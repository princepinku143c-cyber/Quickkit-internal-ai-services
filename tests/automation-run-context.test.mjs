import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createDailyQuotaHandler, consumeDailyQuota, DAILY_EXECUTION_LIMIT, isAdminAppBoundToProject } from "../quickkit-automation-agent-main/api/usage/daily.js";
import { createRunCreationHandler, createRunWithQuota } from "../quickkit-automation-agent-main/api/runs/create.js";
import { isPaymentOrderOwnedBy } from "../quickkit-automation-agent-main/functions/paymentOrderOwnership.js";

const dailyQuotaApi = await readFile(new URL("../quickkit-automation-agent-main/api/usage/daily.js", import.meta.url), "utf8");
assert.equal(isAdminAppBoundToProject("quickkit-staging", "quickkit-staging"), true);
assert.equal(isAdminAppBoundToProject("quickkit-production", "quickkit-staging"), false);
assert.equal(isAdminAppBoundToProject(undefined, "quickkit-staging"), false, "An explicit target must not reuse an Admin app with unknown project binding.");
assert.equal(isAdminAppBoundToProject("quickkit-staging", undefined), true, "No explicit project target preserves ADC discovery.");
assert.equal(isAdminAppBoundToProject(" quickkit-staging ", "quickkit-staging "), true);
assert.ok(
  dailyQuotaApi.includes("if (!isAdminAppBoundToProject(existingProjectId, projectId))"),
  "getAdminApp must reject an existing Admin app whose configured project cannot be verified.",
);

const app = await readFile(new URL("../quickkit-automation-agent-main/App.tsx", import.meta.url), "utf8");
const modal = await readFile(new URL("../quickkit-automation-agent-main/components/RunModal.tsx", import.meta.url), "utf8");
const engine = await readFile(new URL("../quickkit-automation-agent-main/services/executionEngine.ts", import.meta.url), "utf8");
const cloudStore = await readFile(new URL("../quickkit-automation-agent-main/services/cloudStore.ts", import.meta.url), "utf8");
const automationRules = await readFile(new URL("../quickkit-automation-agent-main/firestore.rules", import.meta.url), "utf8");
const runCreationApi = await readFile(new URL("../quickkit-automation-agent-main/api/runs/create.js", import.meta.url), "utf8");
const paymentWorker = await readFile(new URL("../quickkit-automation-agent-main/functions/paymentWorker.ts", import.meta.url), "utf8");

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
assert.ok(cloudStore.includes("fetch('/api/runs/create'"), "Persistable runs must be created through the authenticated server API.");
assert.ok(cloudStore.includes("currentUser.uid !== state.userId"), "Run creation must match the verified client Firebase user.");
assert.match(cloudStore, /collection\('active_runs'\)\.doc\(state\.runId\)\.update/);
assert.doesNotMatch(cloudStore, /collection\('active_runs'\)\.doc\(state\.runId\)\.set/);
assert.ok(engine.includes("createCloudRun(this.state, 'local')"), "Signed-in saved-project local runs must use the atomic server run/quota transaction.");
assert.ok(modal.includes("createCloudRun(initialState, 'cloud')"), "Cloud runs must use the atomic server run/quota transaction.");
assert.match(automationRules, /match \/active_runs\/\{runId\}[\s\S]*allow create: if false;/, "Clients must not create active-run documents directly.");
assert.ok(runCreationApi.includes("mode: input.mode"), "Trusted run creation must persist the local/cloud execution mode.");

// Payment verification must not let one authenticated tenant claim another tenant's order.
assert.equal(isPaymentOrderOwnedBy({ userId: "tenant-a" }, "tenant-a"), true);
assert.equal(isPaymentOrderOwnedBy({ userId: "tenant-b" }, "tenant-a"), false);
assert.equal(isPaymentOrderOwnedBy({ userId: "tenant-a" }, "tenant-b"), false);
assert.equal(isPaymentOrderOwnedBy({ userId: null }, "tenant-a"), false);
assert.equal(isPaymentOrderOwnedBy({}, "tenant-a"), false);
assert.equal(isPaymentOrderOwnedBy(null, "tenant-a"), false);
const paymentOwnerGuardIndex = paymentWorker.indexOf("if (!isPaymentOrderOwnedBy(orderData, context.auth!.uid))");
const paymentGrantIndex = paymentWorker.indexOf("await processSuccessfulPayment(context.auth!.uid");
assert.ok(paymentOwnerGuardIndex >= 0 && paymentOwnerGuardIndex < paymentGrantIndex,
  "Payment ownership must be checked before any plan or credit mutation.");
assert.ok(automationRules.includes("resource.data.mode == 'local'"), "Only browser-local runs may accept client checkpoint updates.");
assert.ok(automationRules.includes("request.resource.data.mode == resource.data.mode"), "Clients must not change a run's execution mode.");

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
  method: "POST",  headers: { authorization: "Bearer valid-token" },  body: {},});
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
          const key = `${ref.collectionName}/${ref.id}`;
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
        const key = `${write.ref.collectionName}/${write.ref.id}`;
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


const validRunInput = {
  runId: "run-cloud-a",
  projectId: "project-a",
  mode: "cloud",
  currentQueue: ["trigger"],
  completedNodeIds: [],
  context: { trigger: { data: { event: "test" } } },
  startTime: quotaNow,
  lastUpdateTime: quotaNow,
  nodeLimitCount: 0,
};

const runApiCalls = [];
const runHandler = createRunCreationHandler({
  verifyIdToken: async (token) => {
    assert.equal(token, "valid-token");
    return { uid: "tenant-a" };
  },
  createRun: async (uid, input) => {
    runApiCalls.push({ uid, input });
    return { allowed: true, count: 1, created: true, status: input.mode === "cloud" ? "QUEUED" : "RUNNING" };
  },
});

const runOptions = await invokeQuotaHandler(runHandler, { method: "OPTIONS" });
assert.equal(runOptions.statusCode, 204);
assert.equal(runOptions.headers.allow, "POST, OPTIONS");
assert.equal(runOptions.headers["cache-control"], "no-store");

const runGet = await invokeQuotaHandler(runHandler, { method: "GET" });
assert.equal(runGet.statusCode, 405);

const runMissingAuth = await invokeQuotaHandler(runHandler, { method: "POST", body: validRunInput });
assert.equal(runMissingAuth.statusCode, 401);
assert.equal(runApiCalls.length, 0);

const runSpoofedIdentity = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: { ...validRunInput, userId: "victim" },
});
assert.equal(runSpoofedIdentity.statusCode, 400, "Client-supplied user IDs must be rejected.");
assert.equal(runApiCalls.length, 0);

const runSpoofedStatus = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: { ...validRunInput, status: "COMPLETED" },
});
assert.equal(runSpoofedStatus.statusCode, 400, "Clients must not choose the server-owned run status.");
assert.equal(runApiCalls.length, 0);

const runOversizedBody = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: { ...validRunInput, context: { trigger: { data: "x".repeat(33 * 1024) } } },
});
assert.equal(runOversizedBody.statusCode, 413, "The parsed run payload must be byte-limited even without Content-Length.");
assert.equal(runApiCalls.length, 0);

const runInvalidMode = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: { ...validRunInput, mode: "admin" },
});
assert.equal(runInvalidMode.statusCode, 400);

const runOversized = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token", "content-length": "32769" },
  body: validRunInput,
});
assert.equal(runOversized.statusCode, 413);

const runCreated = await invokeQuotaHandler(runHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: validRunInput,
});
assert.equal(runCreated.statusCode, 201);
assert.deepEqual(runCreated.body, {
  success: true,
  data: { allowed: true, count: 1, created: true, status: "QUEUED" },
});
assert.equal(runApiCalls[0].uid, "tenant-a", "Run ownership must come from Firebase token verification.");
assert.equal("userId" in runApiCalls[0].input, false, "Client-supplied identity must never reach run storage.");

const invalidRunTokenHandler = createRunCreationHandler({
  verifyIdToken: async () => {
    const error = new Error("invalid token");
    error.code = "auth/invalid-id-token";
    throw error;
  },
  createRun: async () => { throw new Error("must not be called"); },
});
const invalidRunToken = await invokeQuotaHandler(invalidRunTokenHandler, {
  method: "POST",
  headers: { authorization: "Bearer invalid" },
  body: validRunInput,
});
assert.equal(invalidRunToken.statusCode, 401);

const exceededRunHandler = createRunCreationHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),
  createRun: async () => ({ allowed: false, count: 500, reason: "exceeded" }),
});
const exceededRun = await invokeQuotaHandler(exceededRunHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: validRunInput,
});
assert.equal(exceededRun.statusCode, 429);
assert.equal(exceededRun.body.data.reason, "exceeded");

const missingProjectHandler = createRunCreationHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),
  createRun: async () => ({ allowed: false, reason: "project_not_found" }),
});
const missingProject = await invokeQuotaHandler(missingProjectHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: validRunInput,
});
assert.equal(missingProject.statusCode, 404);

const conflictRunHandler = createRunCreationHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),  createRun: async () => ({ allowed: false, reason: "conflict" }),
});const conflictRun = await invokeQuotaHandler(conflictRunHandler, {
  method: "POST",  headers: { authorization: "Bearer valid-token" },
  body: validRunInput,
});
assert.equal(conflictRun.statusCode, 409);

const unavailableRunHandler = createRunCreationHandler({
  verifyIdToken: async () => ({ uid: "tenant-a" }),
  createRun: async () => { throw new Error("private Firestore diagnostic"); },
});
const unavailableRun = await invokeQuotaHandler(unavailableRunHandler, {
  method: "POST",
  headers: { authorization: "Bearer valid-token" },
  body: validRunInput,
});
assert.equal(unavailableRun.statusCode, 503);
assert.equal(JSON.stringify(unavailableRun.body).includes("private Firestore diagnostic"), false);

function createFakeRunDb(initialRecords = {}) {
  const records = new Map(Object.entries(initialRecords));
  return {
    records,
    collection(name) {
      return { doc(id) { return { collectionName: name, id }; } };
    },
    async runTransaction(callback) {
      const writes = [];
      const transaction = {
        async get(ref) {
          const key = ref.collectionName + "/" + ref.id;
          return { exists: records.has(key), data: () => records.get(key) };
        },
        create(ref, value) { writes.push({ kind: "create", ref, value }); },
        set(ref, value, options) { writes.push({ kind: "set", ref, value, options }); },
      };
      const result = await callback(transaction);
      for (const write of writes) {
        const key = write.ref.collectionName + "/" + write.ref.id;
        if (write.kind === "create") {
          if (records.has(key)) throw new Error("Document already exists.");
          records.set(key, write.value);
        } else {
          const previous = records.get(key) || {};
          records.set(key, write.options?.merge ? { ...previous, ...write.value } : write.value);
        }
      }
      return result;
    },
  };
}

const atomicRunDb = createFakeRunDb({
  "projects/project-a": { userId: "tenant-a" },
  "usage_quotas/tenant-a_2026-11-24": { count: 499, lastUpdate: quotaNow - 1 },
});
const atomicCreated = await createRunWithQuota(atomicRunDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP");
assert.deepEqual(atomicCreated, { allowed: true, count: 500, created: true, status: "QUEUED" });
assert.equal(atomicRunDb.records.get("active_runs/run-cloud-a").userId, "tenant-a");
assert.equal(atomicRunDb.records.get("active_runs/run-cloud-a").status, "QUEUED");
assert.equal(atomicRunDb.records.get("active_runs/run-cloud-a").mode, "cloud", "The server must persist cloud mode for worker-owned runs.");
assert.equal(atomicRunDb.records.get("active_runs/run-cloud-a").createdAt, "SERVER_TIMESTAMP");
assert.equal(atomicRunDb.records.get("usage_quotas/tenant-a_2026-11-24").count, 500);

const idempotentRun = await createRunWithQuota(atomicRunDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP");
assert.deepEqual(idempotentRun, { allowed: true, count: 500, created: false, status: "QUEUED" }, "An idempotent retry must report the existing daily count without charging quota again.");
assert.equal(atomicRunDb.records.get("usage_quotas/tenant-a_2026-11-24").count, 500, "A retry of the same run ID must not consume quota twice.");
const mismatchedModeRetry = await createRunWithQuota(
  atomicRunDb,
  "tenant-a",
  { ...validRunInput, mode: "local" },
  quotaNow,
  "SERVER_TIMESTAMP",
);
assert.deepEqual(mismatchedModeRetry, { allowed: false, reason: "conflict" }, "An idempotent retry must not reuse a run ID across execution modes.");
assert.equal(atomicRunDb.records.get("usage_quotas/tenant-a_2026-11-24").count, 500, "A mode-conflict retry must not consume quota.");

const overLimitRun = await createRunWithQuota(
  atomicRunDb,
  "tenant-a",
  { ...validRunInput, runId: "run-cloud-b" },
  quotaNow,
  "SERVER_TIMESTAMP",
);
assert.deepEqual(overLimitRun, { allowed: false, count: 500, reason: "exceeded" });

const localRunDb = createFakeRunDb({ "projects/project-a": { userId: "tenant-a" } });
const localRun = await createRunWithQuota(
  localRunDb,
  "tenant-a",
  { ...validRunInput, runId: "run-local-a", mode: "local" },
  quotaNow,
  "SERVER_TIMESTAMP",
);
assert.deepEqual(localRun, { allowed: true, count: 1, created: true, status: "RUNNING" });
assert.equal(localRunDb.records.get("active_runs/run-local-a").mode, "local", "The server must persist local mode for browser checkpoint updates.");

const wrongOwnerRunDb = createFakeRunDb({ "projects/project-a": { userId: "tenant-b" } });
const wrongOwnerRun = await createRunWithQuota(wrongOwnerRunDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP");
assert.deepEqual(wrongOwnerRun, { allowed: false, reason: "project_not_found" });

const conflictingRunDb = createFakeRunDb({
  "projects/project-a": { userId: "tenant-a" },
  "active_runs/run-cloud-a": { userId: "tenant-b", projectId: "project-a", status: "QUEUED" },
});
const conflictingRun = await createRunWithQuota(conflictingRunDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP");
assert.deepEqual(conflictingRun, { allowed: false, reason: "conflict" });

const corruptRunQuotaDb = createFakeRunDb({
  "projects/project-a": { userId: "tenant-a" },
  "usage_quotas/tenant-a_2026-11-24": { count: "499" },
});
await assert.rejects(
  () => createRunWithQuota(corruptRunQuotaDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP"),
  /Daily quota record is invalid/,
);

const corruptIdempotentRunQuotaDb = createFakeRunDb({
  "projects/project-a": { userId: "tenant-a" },
  "active_runs/run-cloud-a": {
    runId: "run-cloud-a",
    userId: "tenant-a",
    projectId: "project-a",
    mode: "cloud",
    status: "QUEUED",
  },
  "usage_quotas/tenant-a_2026-11-24": { count: "499" },
});
await assert.rejects(
  () => createRunWithQuota(corruptIdempotentRunQuotaDb, "tenant-a", validRunInput, quotaNow, "SERVER_TIMESTAMP"),
  /Daily quota record is invalid/,
  "An idempotent retry must not hide a corrupt quota record.",
);
await assert.rejects(
  () => createRunWithQuota(createFakeRunDb(), "tenant-a/other", validRunInput, quotaNow, "SERVER_TIMESTAMP"),
  /valid authenticated user ID/,
);

const workerSource = await readFile(
  new URL("../quickkit-automation-agent-main/functions/worker.ts", import.meta.url),
  "utf8",
);
assert.match(workerSource, /CLOUD_WORKER_NOT_IMPLEMENTED/);
assert.match(workerSource, /status:\s*'FAILED'/);
assert.doesNotMatch(workerSource, /worker_simulated_|status:\s*'COMPLETED'/);
assert.doesNotMatch(workerSource, /axios\.get|fetch\(/, "The placeholder poller must not make outbound requests.");
assert.match(workerSource, /Disabled: secure tenant-scoped polling is not implemented/);

const startMethodIndex = engine.indexOf("public async start(payload: any)");
const terminalFailureGuardIndex = engine.indexOf("if (this.state.status === 'FAILED') {", startMethodIndex);
const quotaCheckIndex = engine.indexOf("let quota:", startMethodIndex);
assert.ok(
  terminalFailureGuardIndex > startMethodIndex && terminalFailureGuardIndex < quotaCheckIndex,
  "A previously failed run must stop before requesting or consuming quota.",
);
const completionIndex = engine.indexOf("this.state.status = 'COMPLETED';");
const postLoopFailureGuardIndex = engine.indexOf(
  "if (this.state.status === 'FAILED') {",
  engine.indexOf("while (this.state.currentQueue.length > 0)"),
);
assert.ok(
  postLoopFailureGuardIndex > 0 && postLoopFailureGuardIndex < completionIndex,
  "A node failure must be returned before the success finalizer.",
);
const failedResultBlock = engine.slice(postLoopFailureGuardIndex, completionIndex);
assert.match(failedResultBlock, /status: 'FAILED'/);
assert.match(failedResultBlock, /output: this\.state\.context/);

console.log("PASS: server-side run creation verifies Firebase identity and project ownership, atomically enforces the 500/day quota, and is idempotent.");
console.log("PASS: clients cannot create active-run documents; trusted server creation preserves owner-only checkpoints.");
console.log("PASS: server-side daily quota API authenticates the Firebase UID, preserves the 500/day cap, and fails closed.");

console.log("PASS: local and cloud automation runs retain the active project; cloud runs require authentication and a saved owner project.");