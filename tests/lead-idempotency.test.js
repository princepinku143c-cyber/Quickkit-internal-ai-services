import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getOrCreateLead, getOrCreateWebhookSubmission, hashIdempotencyKey } from "../api/_lib/leadIdempotency.js";
import { stripWebhookIdempotencyMetadata } from "../api/_lib/input.js";

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

console.log("Lead and webhook idempotency regression tests passed (create, replay, tenant isolation, and orphan repair).");
