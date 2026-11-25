import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLeadAndProjectAtomically, getOrCreateLead, getOrCreateWebhookSubmission, hashIdempotencyKey } from "../api/_lib/leadIdempotency.js";
import { stripWebhookIdempotencyMetadata } from "../api/_lib/input.js";
import { sendLeadNotification } from "../api/_lib/leadNotifications.js";
import { fetchJsonResponseWithTimeout, fetchJsonWithTimeout } from "../api/_lib/fetchWithTimeout.js";

class FakeDocumentReference {
  constructor(db, collectionName, id) {
    this.db = db;
    this.collectionName = collectionName;
    this.id = id;
  }

  async get() {
    const value = this.db.read(this.collectionName, this.id);
    return {
      exists: value !== undefined,
      data: () => value === undefined ? undefined : structuredClone(value),
    };
  }
}

class FakeFirestore {
  constructor() {
    this.documents = new Map();
    this.nextId = 0;
  }

  collection(name) {
    return {
      doc: (id) => new FakeDocumentReference(this, name, id || this.allocateId(name)),
    };
  }

  allocateId(collectionName) {
    this.nextId += 1;
    return `test-${collectionName}-${this.nextId}`;
  }

  collectionMap(name) {
    if (!this.documents.has(name)) this.documents.set(name, new Map());
    return this.documents.get(name);
  }

  read(collectionName, id) {
    return this.collectionMap(collectionName).get(id);
  }

  seed(collectionName, id, value) {
    this.collectionMap(collectionName).set(id, structuredClone(value));
  }

  count(collectionName) {
    return this.collectionMap(collectionName).size;
  }

  async runTransaction(callback) {
    const writes = [];
    const transaction = {
      get: (ref) => ref.get(),
      create: (ref, value) => writes.push({ operation: "create", ref, value: structuredClone(value) }),
      set: (ref, value) => writes.push({ operation: "set", ref, value: structuredClone(value) }),
    };

    const result = await callback(transaction);
    for (const write of writes) {
      const collection = this.collectionMap(write.ref.collectionName);
      if (write.operation === "create" && collection.has(write.ref.id)) {
        throw new Error("Document already exists");
      }
      collection.set(write.ref.id, write.value);
    }
    return result;
  }
}

const db = new FakeFirestore();
const key = "quickkit-lead-submit-test-0001";
const keyHash = hashIdempotencyKey(key);
const leadData = { name: "Test lead", email: "test@example.invalid", source: "test" };

assert.match(keyHash, /^[a-f0-9]{64}$/);
assert.notEqual(keyHash, key);

const first = await getOrCreateLead(db, key, leadData);
assert.equal(first.created, true);
assert.equal(first.lead.id, first.ref.id);
assert.equal(first.lead.name, leadData.name);
assert.equal(db.count("leads"), 1);
assert.equal(db.read("lead_idempotency", keyHash).leadId, first.ref.id);
assert.equal(db.read("lead_idempotency", key), undefined);

const retry = await getOrCreateLead(db, key, { ...leadData, name: "Changed retry payload" });
assert.equal(retry.created, false);
assert.equal(retry.ref.id, first.ref.id);
assert.equal(retry.lead.name, leadData.name, "a retry must not overwrite the original lead");
assert.equal(db.count("leads"), 1, "a retry must not create a duplicate lead");

const orphanKey = "quickkit-orphaned-key-0001";
const orphanHash = hashIdempotencyKey(orphanKey);
db.seed("lead_idempotency", orphanHash, {
  leadId: "missing-lead-record",
  createdAt: new Date(0).toISOString(),
});

const repaired = await getOrCreateLead(db, orphanKey, leadData);
assert.equal(repaired.created, true);
assert.notEqual(repaired.ref.id, "missing-lead-record");
assert.equal(db.read("lead_idempotency", orphanHash).leadId, repaired.ref.id);
assert.equal(db.count("leads"), 2);

const webhookDb = new FakeFirestore();
const webhookKey = "webhook-event-00000001";
const aliceLead = { userId: "alice", name: "Alice inbound lead" };
const aliceProject = { userId: "alice", projectName: "Alice Realty" };

const firstWebhook = await getOrCreateWebhookSubmission(
  webhookDb, "alice", webhookKey, aliceLead, aliceProject
);
assert.equal(firstWebhook.created, true);
assert.equal(firstWebhook.leadRef.id, firstWebhook.lead.id);
assert.equal(firstWebhook.lead.projectId, firstWebhook.projectRef.id);
assert.equal(firstWebhook.project.leadId, firstWebhook.leadRef.id);
assert.equal(webhookDb.count("leads"), 1);
assert.equal(webhookDb.count("projects"), 1);
assert.equal(webhookDb.count("webhook_idempotency"), 1);

const webhookRetry = await getOrCreateWebhookSubmission(
  webhookDb,
  "alice",
  webhookKey,
  { ...aliceLead, name: "Changed retry payload" },
  { ...aliceProject, projectName: "Changed retry project" }
);
assert.equal(webhookRetry.created, false);
assert.equal(webhookRetry.leadRef.id, firstWebhook.leadRef.id);
assert.equal(webhookRetry.projectRef.id, firstWebhook.projectRef.id);
assert.equal(webhookRetry.lead.name, "Alice inbound lead");
assert.equal(webhookRetry.project.projectName, "Alice Realty");
assert.equal(webhookDb.count("leads"), 1, "webhook replay must not create duplicate leads");
assert.equal(webhookDb.count("projects"), 1, "webhook replay must not create duplicate projects");

const bobWebhook = await getOrCreateWebhookSubmission(
  webhookDb,
  "bob",
  webhookKey,
  { userId: "bob", name: "Bob inbound lead" },
  { userId: "bob", projectName: "Bob Realty" }
);
assert.equal(bobWebhook.created, true);
assert.notEqual(bobWebhook.leadRef.id, firstWebhook.leadRef.id);
assert.notEqual(bobWebhook.projectRef.id, firstWebhook.projectRef.id);
assert.equal(webhookDb.count("leads"), 2, "the same idempotency key must be isolated by tenant");
assert.equal(webhookDb.count("projects"), 2, "tenant-scoped webhook retries must not share projects");

await assert.rejects(
  () => getOrCreateWebhookSubmission(
    webhookDb,
    "alice",
    "webhook-event-00000002",
    { userId: "bob", name: "Mismatched tenant" },
    { userId: "alice", projectName: "Alice Realty" }
  ),
  /ownership must match/,
  "webhook lead ownership must match the authenticated tenant UID"
);

const webhookRouteSource = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
assert.ok(
  webhookRouteSource.includes("stripWebhookIdempotencyMetadata"),
  "webhook route must remove reserved idempotency-key aliases before persisting custom metadata",
);
assert.deepEqual(
  stripWebhookIdempotencyMetadata({
    source: "website",
    campaign: "spring",
    idempotencyKey: "raw-key-value",
    "idempotency-key": "raw-header-value",
    idempotency_key: "raw-underscore-value",
    IdempotencyKey: "raw-case-variant",
  }),
  { source: "website", campaign: "spring" },
  "raw idempotency-key aliases must never be copied into webhook metadata",
);

const crossTenantLeadKey = "webhook-cross-tenant-lead-0001";
const crossTenantLeadHash = hashIdempotencyKey(JSON.stringify(["alice", crossTenantLeadKey]));
webhookDb.seed("leads", "bob-private-lead", { userId: "bob", name: "Bob private lead" });
webhookDb.seed("projects", "alice-project-for-bob-lead", {
  userId: "alice",
  projectName: "Alice project",
  leadId: "bob-private-lead",
});
webhookDb.seed("webhook_idempotency", crossTenantLeadHash, {
  userId: "alice",
  leadId: "bob-private-lead",
  projectId: "alice-project-for-bob-lead",
});
await assert.rejects(
  () => getOrCreateWebhookSubmission(webhookDb, "alice", crossTenantLeadKey, aliceLead, aliceProject),
  /lead tenant mismatch/,
  "an Alice idempotency record must not return a Bob-owned lead",
);

const crossTenantProjectKey = "webhook-cross-tenant-project-0001";
const crossTenantProjectHash = hashIdempotencyKey(JSON.stringify(["alice", crossTenantProjectKey]));
webhookDb.seed("leads", "alice-owned-lead", { userId: "alice", name: "Alice lead" });
webhookDb.seed("projects", "bob-private-project", { userId: "bob", projectName: "Bob private project" });
webhookDb.seed("webhook_idempotency", crossTenantProjectHash, {
  userId: "alice",
  leadId: "alice-owned-lead",
  projectId: "bob-private-project",
});
await assert.rejects(
  () => getOrCreateWebhookSubmission(webhookDb, "alice", crossTenantProjectKey, aliceLead, aliceProject),
  /project tenant mismatch/,
  "an Alice idempotency record must not return a Bob-owned project",
);


const linkIntegrityKey = "webhook-link-integrity-0001";
const linkIntegrityHash = hashIdempotencyKey(JSON.stringify(["alice", linkIntegrityKey]));
webhookDb.seed("leads", "bob-private-lead", { userId: "bob", name: "Bob private lead" });
webhookDb.seed("projects", "bob-private-project", {
  userId: "bob",
  projectName: "Bob private project",
  leadId: "bob-private-lead",
});
webhookDb.seed("leads", "alice-stale-link-lead", {
  userId: "alice",
  name: "Alice lead",
  projectId: "bob-private-project",
});
webhookDb.seed("projects", "alice-stale-link-project", {
  userId: "alice",
  projectName: "Alice project",
  leadId: "bob-private-lead",
});
webhookDb.seed("webhook_idempotency", linkIntegrityHash, {
  userId: "alice",
  leadId: "alice-stale-link-lead",
  projectId: "alice-stale-link-project",
});
const repairedLinks = await getOrCreateWebhookSubmission(
  webhookDb, "alice", linkIntegrityKey, aliceLead, aliceProject
);
assert.equal(repairedLinks.lead.projectId, "alice-stale-link-project");
assert.equal(webhookDb.read("leads", "alice-stale-link-lead").projectId, "alice-stale-link-project");
assert.equal(repairedLinks.project.leadId, "alice-stale-link-lead");
assert.equal(webhookDb.read("projects", "alice-stale-link-project").leadId, "alice-stale-link-lead");
assert.equal(webhookDb.read("leads", "bob-private-lead").userId, "bob");
assert.equal(webhookDb.read("projects", "bob-private-project").userId, "bob");

const atomicDb = new FakeFirestore();
const atomicSubmission = await createLeadAndProjectAtomically(
  atomicDb,
  { userId: "alice", name: "Atomic system lead" },
  { userId: "alice", projectName: "Atomic system project" },
);
assert.equal(atomicDb.count("leads"), 1);
assert.equal(atomicDb.count("projects"), 1);
assert.equal(atomicSubmission.lead.projectId, atomicSubmission.projectRef.id);
assert.equal(atomicSubmission.project.leadId, atomicSubmission.leadRef.id);
assert.equal(atomicDb.read("leads", atomicSubmission.leadRef.id).projectId, atomicSubmission.projectRef.id);
assert.equal(atomicDb.read("projects", atomicSubmission.projectRef.id).leadId, atomicSubmission.leadRef.id);

await assert.rejects(
  () => createLeadAndProjectAtomically(
    atomicDb,
    { userId: "alice", name: "Mismatched lead" },
    { userId: "bob", projectName: "Mismatched project" },
  ),
  /ownership must match/,
);
assert.equal(atomicDb.count("leads"), 1, "mismatched ownership must not create a lead");
assert.equal(atomicDb.count("projects"), 1, "mismatched ownership must not create a project");

const systemIdempotencyDb = new FakeFirestore();
const systemSubmissionKey = "system-opportunity-submit-0001";
const aliceSystemLead = { userId: "alice", name: "Alice system lead" };
const aliceSystemProject = { userId: "alice", projectName: "Alice system project" };
const firstSystemSubmission = await createLeadAndProjectAtomically(
  systemIdempotencyDb, aliceSystemLead, aliceSystemProject, systemSubmissionKey
);
assert.equal(firstSystemSubmission.created, true);
assert.equal(systemIdempotencyDb.count("leads"), 1);
assert.equal(systemIdempotencyDb.count("projects"), 1);
assert.equal(systemIdempotencyDb.count("system_lead_idempotency"), 1);

const replayedSystemSubmission = await createLeadAndProjectAtomically(
  systemIdempotencyDb,
  { ...aliceSystemLead, name: "Changed retry payload" },
  { ...aliceSystemProject, projectName: "Changed retry project" },
  systemSubmissionKey
);
assert.equal(replayedSystemSubmission.created, false);
assert.equal(replayedSystemSubmission.leadRef.id, firstSystemSubmission.leadRef.id);
assert.equal(replayedSystemSubmission.projectRef.id, firstSystemSubmission.projectRef.id);
assert.equal(replayedSystemSubmission.lead.name, "Alice system lead", "a replay must preserve the first lead payload");
assert.equal(replayedSystemSubmission.project.projectName, "Alice system project", "a replay must preserve the first project payload");
assert.equal(systemIdempotencyDb.count("leads"), 1, "a replay must not create a duplicate lead");
assert.equal(systemIdempotencyDb.count("projects"), 1, "a replay must not create a duplicate project");

const systemKeyHash = hashIdempotencyKey(JSON.stringify(["user", "alice", systemSubmissionKey]));
assert.equal(systemIdempotencyDb.read("system_lead_idempotency", systemKeyHash).leadId, firstSystemSubmission.leadRef.id);
assert.equal(systemIdempotencyDb.read("system_lead_idempotency", systemSubmissionKey), undefined, "raw idempotency keys must not be stored");

const bobSystemSubmission = await createLeadAndProjectAtomically(
  systemIdempotencyDb,
  { userId: "bob", name: "Bob system lead" },
  { userId: "bob", projectName: "Bob system project" },
  systemSubmissionKey
);
assert.equal(bobSystemSubmission.created, true);
assert.notEqual(bobSystemSubmission.leadRef.id, firstSystemSubmission.leadRef.id);
assert.notEqual(bobSystemSubmission.projectRef.id, firstSystemSubmission.projectRef.id);
assert.equal(systemIdempotencyDb.count("leads"), 2, "the same key must be isolated by tenant");
assert.equal(systemIdempotencyDb.count("projects"), 2, "tenant-scoped retries must not share projects");

await assert.rejects(
  () => createLeadAndProjectAtomically(
    systemIdempotencyDb, aliceSystemLead, aliceSystemProject, "invalid-key"
  ),
  /valid system lead idempotency key/,
);


const notificationLogMessages = [];
const notificationSent = await sendLeadNotification(
  async () => {},
  { error: (message) => notificationLogMessages.push(message) },
);
assert.equal(notificationSent, true, "successful notification should be reported as sent");

const notificationFailed = await sendLeadNotification(
  async () => { throw new Error("private SMTP transport detail"); },
  { error: (message) => notificationLogMessages.push(message) },
);
assert.equal(notificationFailed, false, "notification failures must be contained after persistence");
assert.deepEqual(
  notificationLogMessages,
  ["Lead notification email failed after lead persistence."],
  "notification logging must not expose transport details",
);


assert.ok(
  webhookRouteSource.includes("fetchJsonWithTimeout"),
  "the webhook route must use the bounded JSON fetch helper for Odoo",
);
assert.equal(
  webhookRouteSource.split("fetchJsonWithTimeout(`${odooUrl}/jsonrpc`,").length - 1,
  2,
  "both webhook Odoo JSON-RPC requests must be bounded",
);
assert.ok(webhookRouteSource.includes("timeoutMs: 7000"), "webhook Odoo requests must use the 7-second deadline");
assert.ok(
  !webhookRouteSource.includes("await fetch(`${odooUrl}/jsonrpc`,"),
  "webhook Odoo calls must not bypass the timeout helper",
);

const leadSubmitRouteSource = readFileSync(new URL("../api/lead-submit.js", import.meta.url), "utf8");
assert.ok(leadSubmitRouteSource.includes("connectionTimeout: 7000"), "website lead SMTP connection timeout must be bounded");
assert.ok(leadSubmitRouteSource.includes("greetingTimeout: 7000"), "website lead SMTP greeting timeout must be bounded");
assert.ok(leadSubmitRouteSource.includes("socketTimeout: 7000"), "website lead SMTP socket timeout must be bounded");

const systemRouteSource = readFileSync(new URL("../api/system.js", import.meta.url), "utf8");
assert.ok(
  systemRouteSource.includes("createLeadAndProjectAtomically"),
  "the public system lead route must use the atomic lead/project helper",
);
assert.ok(systemRouteSource.includes("Idempotency-Key"), "the system route must allow the idempotency header through CORS");
assert.ok(systemRouteSource.includes("data.idempotencyKey"), "the system route must accept a body idempotency key");
assert.ok(systemRouteSource.includes("idempotencyKey || undefined"), "the system route must pass the validated key to atomic persistence");
assert.ok(systemRouteSource.includes("if (created)"), "system lead retries must not repeat external side effects");

const opportunitiesSource = readFileSync(new URL("../components/OpportunitiesView.tsx", import.meta.url), "utf8");
assert.ok(opportunitiesSource.includes("submissionKeyRef"), "CRM opportunity submissions must retain a key across retries");
assert.ok(opportunitiesSource.includes("crypto.randomUUID()"), "CRM opportunity submissions must generate unpredictable keys");
assert.ok(opportunitiesSource.includes("idempotencyKey"), "CRM opportunity requests must send their idempotency key");

const floatingChatSource = readFileSync(new URL("../components/FloatingChatWidget.tsx", import.meta.url), "utf8");
assert.ok(floatingChatSource.includes("leadSubmissionKeysRef"), "chat lead captures must reuse a key within the widget session");
assert.ok(floatingChatSource.includes("idempotencyKey"), "chat lead requests must send their idempotency key");
assert.ok(floatingChatSource.includes("leadCaptureStatusRef"), "chat lead capture must track pending and successful submissions");
assert.ok(floatingChatSource.includes("if (!response.ok)"), "chat lead capture must treat non-2xx responses as failures");
assert.ok(floatingChatSource.includes("delete leadCaptureStatusRef.current[email]"), "failed chat lead capture must become retryable");
const chatEmailRegexSource = floatingChatSource.match(/const emailRegex = \/(.+)\/;/)?.[1];
assert.ok(chatEmailRegexSource, "chat lead capture must define an email detector");
const chatEmailRegex = new RegExp(chatEmailRegexSource);
assert.ok(
  chatEmailRegex.test("buyer+aeo@sub.example.co.in"),
  "chat lead capture must detect normal dotted email domains",
);
assert.equal(
  chatEmailRegex.test("buyer@example"),
  false,
  "chat lead capture must reject email addresses without a top-level domain",
);
const chatResponseCheckIndex = floatingChatSource.indexOf("if (!response.ok)");
const chatSuccessIndex = floatingChatSource.indexOf('leadCaptureStatusRef.current[email] = "captured"');
assert.ok(chatResponseCheckIndex >= 0 && chatSuccessIndex > chatResponseCheckIndex, "chat capture must only be marked successful after an OK response");
assert.ok(
  systemRouteSource.includes("await sendLeadNotification(async () => {"),
  "post-persistence email notification must be best-effort",
);
assert.ok(
  systemRouteSource.includes("subject: `🚀 New Lead/Project: ${leadData.projectName || 'Custom Build'}`"),
  "email subject must use the normalized project name",
);
assert.doesNotMatch(systemRouteSource, /await leadRef\.set\(leadData\)/);
assert.doesNotMatch(systemRouteSource, /await projectRef\.set\(/);



const successfulJson = await fetchJsonWithTimeout(
  "https://odoo.example.invalid/jsonrpc",
  { method: "POST" },
  {
    timeoutMs: 100,
    fetchImpl: async (_input, options) => ({
      json: async () => ({ ok: true, signalPassed: options.signal instanceof AbortSignal }),
    }),
  },
);
assert.equal(successfulJson.ok, true, "bounded JSON fetch should return parsed upstream data");
assert.equal(successfulJson.signalPassed, true, "bounded JSON fetch must pass an abort signal");

let timeoutAbortObserved = false;
await assert.rejects(
  () => fetchJsonWithTimeout(
    "https://odoo.example.invalid/jsonrpc",
    {},
    {
      timeoutMs: 5,
      fetchImpl: async (_input, options) => ({
        json: () => new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            timeoutAbortObserved = true;
            reject(options.signal.reason);
          }, { once: true });
        }),
      }),
    },
  ),
  /Upstream request timed out/,
  "slow response bodies must be aborted at the configured deadline",
);
assert.equal(timeoutAbortObserved, true, "timeout must remain active while the response body is parsed");

assert.ok(
  systemRouteSource.includes("fetchJsonWithTimeout"),
  "the system route must use the bounded JSON fetch helper",
);
assert.equal(
  systemRouteSource.split("fetchJsonWithTimeout(`${odooUrl}/jsonrpc`,").length - 1,
  2,
  "both Odoo JSON-RPC requests must be bounded",
);
assert.ok(systemRouteSource.includes("timeoutMs: 7000"), "Odoo requests must use the 7-second deadline");
assert.ok(systemRouteSource.includes("connectionTimeout: 7000"), "SMTP connection timeout must be bounded");
assert.ok(systemRouteSource.includes("greetingTimeout: 7000"), "SMTP greeting timeout must be bounded");
assert.ok(systemRouteSource.includes("socketTimeout: 7000"), "SMTP socket timeout must be bounded");
assert.ok(
  !systemRouteSource.includes("await fetch(`${odooUrl}/jsonrpc`,"),
  "Odoo calls must not bypass the timeout helper",
);


const boundedHttpError = await fetchJsonResponseWithTimeout(
  "https://provider.example.invalid/api",
  { method: "POST" },
  {
    timeoutMs: 100,
    fetchImpl: async (_input, options) => ({
      ok: false,
      status: 429,
      json: async () => ({ error: "rate limited", signalPassed: options.signal instanceof AbortSignal }),
    }),
  },
);
assert.equal(boundedHttpError.ok, false, "bounded response helper must preserve non-2xx status");
assert.equal(boundedHttpError.status, 429, "bounded response helper must preserve the HTTP status");
assert.equal(boundedHttpError.data.error, "rate limited");
assert.equal(boundedHttpError.data.signalPassed, true);

let outreachBodyTimeoutObserved = false;
await assert.rejects(
  () => fetchJsonResponseWithTimeout(
    "https://provider.example.invalid/api",
    {},
    {
      timeoutMs: 5,
      fetchImpl: async (_input, options) => ({
        ok: true,
        status: 200,
        json: () => new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            outreachBodyTimeoutObserved = true;
            reject(options.signal.reason);
          }, { once: true });
        }),
      }),
    },
  ),
  /Upstream request timed out/,
  "outreach provider response-body parsing must remain inside the timeout",
);
assert.equal(outreachBodyTimeoutObserved, true);

const outreachRouteSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
assert.equal(
  outreachRouteSource.match(/fetchJsonResponseWithTimeout\(/g)?.length,
  8,
  "all eight outreach Telegram, AI and email API calls must use the bounded helper",
);
assert.doesNotMatch(
  outreachRouteSource,
  /\bfetch\s*\(/,
  "outreach must not leave unbounded direct HTTP fetch calls",
);
assert.equal(
  outreachRouteSource.match(/timeoutMs: 20000/g)?.length,
  2,
  "both outreach AI-provider calls must use a 20-second deadline",
);
assert.equal(
  outreachRouteSource.match(/timeoutMs: 7000/g)?.length,
  6,
  "Telegram and email-provider calls must use a 7-second deadline",
);
assert.ok(outreachRouteSource.includes("connectionTimeout: 7000"), "outreach Gmail fallback connection timeout must be bounded");
assert.ok(outreachRouteSource.includes("greetingTimeout: 7000"), "outreach Gmail fallback greeting timeout must be bounded");
assert.ok(outreachRouteSource.includes("socketTimeout: 7000"), "outreach Gmail fallback socket timeout must be bounded");

console.log("Lead and webhook idempotency regression tests passed (create, replay, tenant isolation, and orphan repair).");
