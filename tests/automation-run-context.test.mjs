import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createDailyQuotaHandler, consumeDailyQuota, DAILY_EXECUTION_LIMIT } from "../quickkit-automation-agent-main/api/usage/daily.js";

const app = await readFile(new URL("../quickkit-automation-agent-main/App.tsx", import.meta.url), "utf8");
const modal = await readFile(new URL("../quickkit-automation-agent-main/components/RunModal.tsx", import.meta.url), "utf8");
const engine = await readFile(new URL("../quickkit-automation-agent-main/services/executionEngine.ts", import.meta.url), "utf8");
const cloudStore = await readFile(new URL("../quickkit-automation-agent-main/services/cloudStore.ts", import.meta.url), "utf8");

assert.ok(app.includes("projectId={currentProject?.id}"), "App must pass the active project ID to RunModal.");
assert.ok(modal.includes("projectId?: string;"), "RunModal must accept an optional project ID.");
assert.ok(
  modal.includes("const resolvedProjectId = resumeState?.projectId || projectId?.trim() || 'test-project';"),
  "Resumed runs must retain their saved project ID; new runs must use the active project ID.",
);
assert.ok(
  modal.includes("user?.uid || 'guest',\n          resolvedProjectId,"),
  "Local workflow execution must receive the resolved project ID.",
);
assert.ok(
  modal.includes("projectId: resolvedProjectId,"),
  "Cloud run documents must store the resolved project ID.",
);
assert.ok(!modal.includes("projectId: 'test-project'"), "Cloud runs must not hardcode the placeholder project ID.");
assert.ok(
  !modal.includes("user?.uid || 'guest',\n          'test-project',"),
  "Local runs must not hardcode the placeholder project ID.",
);

assert.ok(modal.includes("Cloud runs require an authenticated account."), "Cloud runs must require a signed-in user.");
assert.ok(modal.includes("Cloud runs require a saved project."), "Cloud runs must reject the placeholder project.");
assert.ok(engine.includes("const isPersistableProjectId ="), "Local runs without a saved project must not persist placeholder checkpoints.");
assert.ok(engine.includes("if (!isPersistableProjectId(this.state.projectId)) return;"), "Checkpoint writes must require a real project ID.");
assert.ok(engine.includes("if (isPersistableProjectId(this.state.projectId)) {"), "Checkpoint cleanup must require a real project ID.");


assert.ok(cloudStore.includes("fetch('/api/usage/daily'"), "Signed-in quota checks must use the server-side API.");
assert.ok(cloudStore.includes("currentUser.uid !== userId"), "The client must match its current Firebase UID before requesting quota.");
assert.ok(!/collection\(['"]usage_quotas['"]\)/.test(cloudStore), "Clients must never write daily quota documents directly.");
assert.equal(DAILY_EXECUTION_LIMIT, 500, "The server-side quota service must preserve the existing 500/day limit.");

function makeQuotaResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

async function invokeQuotaHandler(handler, request = {}) {
  const response = makeQuotaResponse();
  await handler({ headers: {}, ...request }, response);
  return response;
}

const quotaCalls = [];
const validQuotaHandler = createDailyQuotaHandler({
  verifyIdToken: async (token) => {
    quotaCalls.push({ type: "verify", token });
    return { uid: "tenant-a" };
  },
  consumeQuota: async (uid) => {
    quotaCalls.push({ type: "consume", uid });
    return { allowed: true, count: 1 };
  },
});

const optionsResponse = await invokeQuotaHandler(validQuotaHandler, { method: "OPTIONS" });
assert.equal(optionsResponse.statusCode, 204, "Quota API OPTIONS must return 204.");
assert.equal(optionsResponse.headers.allow, "POST, OPTIONS");
assert.equal(optionsResponse.headers["cache-control"], "no-store");

const methodResponse = await invokeQuotaHandler(validQuotaHandler, { method: "GET" });
assert.equal(methodResponse.statusCode, 405, "Quota API must reject non-POST methods.");

const missingAuthResponse = await invokeQuotaHandler(validQuotaHandler, { method: "POST", body: {} });
assert.equal(missingAuthResponse.statusCode, 401, "Quota API must require a Firebase bearer token.");
assert.equal(quotaCalls.length, 0, "Unauthenticated requests must not consume quota.");

const oversizedResponse = await invokeQuotaHandler(validQuotaHandler, {
  method: "POST",
  headers: { "content-length": "1025", authorization: "Bearer token" },
  body: {},
});
assert.equal(oversizedResponse.statusCode, 413, "Quota API must bound request size.");

const suppliedIdentityResponse = await invokeQuotaHandler(validQuotaHandler, {
  method: "POST",
  headers: { authorization: "Bearer token" },
  body: { userId: "victim" },
});
assert.equal(suppliedIdentityResponse.statusCode, 400, "Clients must not submit a user ID to select a quota bucket.");
assert.equal(quotaCalls.length, 0, "Rejected client identity fields must not reach quota storage.");

const invalidTokenHandler = createDailyQuotaHandler({
  verifyIdToken: async () => { const error = new Error("invalid token"); error.code = "auth/invalid-id-token"; throw error; },
  consumeQuota: async () => { throw new Error("must not be called"); },
});
const invalidTokenResponse = await invokeQuotaHandler(invalidTokenHandler, {
  method: "POST",
  headers: { authorization: "Bearer invalid" },
  body: {},
});
assert.equal(invalidTokenResponse.statusCode, 401, "Invalid Firebase ID tokens must be rejected.");

const adminUnavailableHandler = createDailyQuotaHandler({
  verifyIdToken: async () => { const error = new Error("admin unavailable"); error.code = "ADMIN_UNAVAILABLE"; throw error; },
  consumeQuota: async () => ({ allowed: true, count: 1 }),
});
const adminUnavailableResponse = await invokeQuotaHandler(adminUnavailableHandler, {
  method: "POST",
  headers: { authorization: "Bearer token" },
  body: {},
});
assert.equal(adminUnavailableResponse.statusCode, 503, "Missing Firebase Admin configuration must fail closed.");

const successResponse = await invokeQuotaHandler(validQuotaHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token", "content-length": "2" },
  body: {},
});
assert.equal(successResponse.statusCode, 200);
assert.deepEqual(successResponse.body, { success: true, data: { allowed: true, count: 1 } });
assert.deepEqual(quotaCalls, [
  { type: "verify", token: "valid-token" },
  { type: "consume", uid: "tenant-a" },
], "Quota storage must use only the UID returned by Firebase token verification.");

const invalidUidHandler = createDailyQuotaHandler({
  verifyIdToken: async () => ({ uid: "tenant-a/other" }),
  consumeQuota: async () => ({ allowed: true, count: 1 }),
});
const invalidUidResponse = await invokeQuotaHandler(invalidUidHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: {},
});
assert.equal(invalidUidResponse.statusCode, 401, "Invalid Firestore path identities must be rejected.");

const exhaustedHandler = createDailyQuotaHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),
  consumeQuota: async () => ({ allowed: false, count: 500 }),
});
const exhaustedResponse = await invokeQuotaHandler(exhaustedHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: {},
});
assert.equal(exhaustedResponse.statusCode, 200);
assert.deepEqual(exhaustedResponse.body.data, { allowed: false, count: 500 });

const unavailableQuotaHandler = createDailyQuotaHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),
  consumeQuota: async () => { throw new Error("private Firestore diagnostic"); },
});
const unavailableQuotaResponse = await invokeQuotaHandler(unavailableQuotaHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: {},
});
assert.equal(unavailableQuotaResponse.statusCode, 503);
assert.equal(JSON.stringify(unavailableQuotaResponse.body).includes("private Firestore diagnostic"), false, "Quota errors must not leak internal diagnostics.");

function createFakeQuotaDb(initialRecords = {}) {
  const records = new Map(Object.entries(initialRecords));
  const db = {
    records,
    collection(name) {
      return {
        doc(id) { return { collectionName: name, id }; },
      };
    },
    async runTransaction(callback) {
      const writes = [];
      const transaction = {
        async get(ref) {
          const key = \`\${ref.collectionName}/\${ref.id}\`;
          const exists = records.has(key);
          const value = records.get(key);
          return { exists, data: () => value };
        },
        set(ref, value, options) {
          writes.push({ ref, value, options });
        },
      };
      const result = await callback(transaction);
      for (const write of writes) {
        const key = \`\${write.ref.collectionName}/\${write.ref.id}\`;
        const previous = records.get(key) || {};
        records.set(key, write.options?.merge ? { ...previous, ...write.value } : write.value);
      }
      return result;
    },
  };
  return db;
}

const quotaNow = Date.UTC(2026, 10, 24, 4, 0, 0);
const newQuotaDb = createFakeQuotaDb();
const firstQuota = await consumeDailyQuota(newQuotaDb, "tenant-a", quotaNow);
assert.deepEqual(firstQuota, { allowed: true, count: 1 });
assert.deepEqual(newQuotaDb.records.get("usage_quotas/tenant-a_2026-11-24"), {
  count: 1,
  lastUpdate: quotaNow,
});

const atLimitDb = createFakeQuotaDb({
  "usage_quotas/tenant-a_2026-11-24": { count: 499, lastUpdate: quotaNow - 1, retained: true },
});
const finalAllowedQuota = await consumeDailyQuota(atLimitDb, "tenant-a", quotaNow);
assert.deepEqual(finalAllowedQuota, { allowed: true, count: 500 });
assert.equal(atLimitDb.records.get("usage_quotas/tenant-a_2026-11-24").retained, true, "Quota updates must preserve existing metadata.");
const overLimitQuota = await consumeDailyQuota(atLimitDb, "tenant-a", quotaNow);
assert.deepEqual(overLimitQuota, { allowed: false, count: 500 }, "The 501st daily execution must be denied.");

const corruptQuotaDb = createFakeQuotaDb({
  "usage_quotas/tenant-a_2026-11-24": { count: "499", lastUpdate: quotaNow - 1 },
});
await assert.rejects(
  () => consumeDailyQuota(corruptQuotaDb, "tenant-a", quotaNow),
  /Daily quota record is invalid/,
  "Corrupt quota records must fail closed.",
);
await assert.rejects(
  () => consumeDailyQuota(createFakeQuotaDb(), "tenant-a/other", quotaNow),
  /valid authenticated user ID/,
  "UIDs must not be allowed to escape their Firestore document path.",
);

console.log("PASS: server-side daily quota API authenticates the Firebase UID, preserves the 500/day cap, and fails closed.");

console.log("PASS: local and cloud automation runs retain the active project; cloud runs require authentication and a saved owner project.");
