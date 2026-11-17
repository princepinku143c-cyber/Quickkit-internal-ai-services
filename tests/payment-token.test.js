import assert from "node:assert/strict";
import {
  generatePaymentToken,
  verifyAndConsumePaymentToken,
} from "../api/_lib/paymentToken.js";

for (let index = 0; index < 1000; index += 1) {
  const token = generatePaymentToken();
  assert.match(token, /^[0-9A-Z]{6}$/, "payment tokens must remain six uppercase base-36 characters");
}

function createFakeFirestore(initial, userProfiles = {}) {
  let state = { exists: true, data: { ...initial } };
  let queue = Promise.resolve();
  let writeCount = 0;
  const projectRef = { path: "projects/project-1" };
  const userRefs = new Map();
  const db = {
    collection(name) {
      assert.equal(name, "users");
      return {
        doc(id) {
          if (!userRefs.has(id)) userRefs.set(id, { path: "users/" + id, id });
          return userRefs.get(id);
        },
      };
    },
    runTransaction(callback) {
      const operation = queue.then(async () => {
        const writes = [];
        const transaction = {
          async get(ref) {
            if (ref === projectRef) {
              return {
                exists: state.exists,
                get(field) { return state.data[field]; },
              };
            }
            const actorId = [...userRefs.entries()].find(([, candidate]) => candidate === ref)?.[0];
            assert.ok(actorId !== undefined, "transaction may read only the project and authenticated actor profile");
            const profile = userProfiles[actorId];
            return {
              exists: Boolean(profile),
              get(field) { return profile?.[field]; },
            };
          },
          update(ref, patch) {
            assert.equal(ref, projectRef);
            writes.push(patch);
          },
        };
        const result = await callback(transaction);
        for (const patch of writes) {
          state.data = { ...state.data, ...patch };
          writeCount += 1;
        }
        return result;
      });
      queue = operation.catch(() => undefined);
      return operation;
    },
  };
  return {
    db,
    projectRef,
    read: () => ({ ...state.data }),
    setExists: (exists) => { state.exists = exists; },
    writeCount: () => writeCount,
  };
}

const valid = createFakeFirestore(
  { userId: "owner", paymentToken: "ABC123", status: "quoted", advancePaid: false },
  { owner: { role: "client" } },
);
const concurrentResults = await Promise.all([
  verifyAndConsumePaymentToken(valid.db, valid.projectRef, "ABC123", "owner"),
  verifyAndConsumePaymentToken(valid.db, valid.projectRef, "ABC123", "owner"),
]);
assert.deepEqual(concurrentResults.sort(), [false, true], "only one concurrent owner verifier may consume a token");
assert.equal(valid.read().paymentToken, null);
assert.equal(valid.read().advancePaid, true);
assert.equal(valid.read().status, "accepted");
assert.equal(valid.writeCount(), 1, "token consumption must commit exactly once");

const admin = createFakeFirestore(
  { userId: "owner", paymentToken: "ADMIN1", advancePaid: false },
  { admin: { role: "admin" } },
);
assert.equal(await verifyAndConsumePaymentToken(admin.db, admin.projectRef, "ADMIN1", "admin"), true,
  "a trusted Firestore admin profile may verify a project token");
assert.equal(admin.writeCount(), 1);

const unauthorized = createFakeFirestore(
  { userId: "owner", paymentToken: "ABC123", advancePaid: false },
  { intruder: { role: "client" } },
);
assert.equal(await verifyAndConsumePaymentToken(unauthorized.db, unauthorized.projectRef, "ABC123", "intruder"), false,
  "a different authenticated user must not consume another owner's token");
assert.equal(unauthorized.read().paymentToken, "ABC123");
assert.equal(unauthorized.writeCount(), 0);

const missingActor = createFakeFirestore(
  { userId: "owner", paymentToken: "ABC123", advancePaid: false },
  {},
);
assert.equal(await verifyAndConsumePaymentToken(missingActor.db, missingActor.projectRef, "ABC123", ""), false);
assert.equal(missingActor.writeCount(), 0);

const missing = createFakeFirestore(
  { userId: "owner", paymentToken: "ABC123", advancePaid: false },
  { owner: { role: "client" } },
);
missing.setExists(false);
assert.equal(await verifyAndConsumePaymentToken(missing.db, missing.projectRef, "ABC123", "owner"), false);
assert.equal(missing.writeCount(), 0);

const mismatch = createFakeFirestore(
  { userId: "owner", paymentToken: "ABC123", advancePaid: false },
  { owner: { role: "client" } },
);
assert.equal(await verifyAndConsumePaymentToken(mismatch.db, mismatch.projectRef, "WRONG1", "owner"), false);
assert.equal(mismatch.writeCount(), 0);

const absent = createFakeFirestore(
  { userId: "owner", advancePaid: false },
  { owner: { role: "client" } },
);
assert.equal(await verifyAndConsumePaymentToken(absent.db, absent.projectRef, "ABC123", "owner"), false);
assert.equal(absent.writeCount(), 0);

console.log("Payment token generation, owner/admin authorization, and atomic single-use verification tests passed.");
