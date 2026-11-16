import assert from "node:assert/strict";
import { getOrCreateLead, hashIdempotencyKey } from "../api/_lib/leadIdempotency.js";

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

console.log("Lead idempotency regression tests passed (create, replay, and orphan repair).");
