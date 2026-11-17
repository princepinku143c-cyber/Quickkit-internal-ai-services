import assert from "node:assert/strict";
import {
  generatePaymentToken,
  verifyAndConsumePaymentToken,
} from "../api/_lib/paymentToken.js";

for (let index = 0; index < 1000; index += 1) {
  const token = generatePaymentToken();
  assert.match(token, /^[0-9A-Z]{6}$/, "payment tokens must remain six uppercase base-36 characters");
}

function createFakeFirestore(initial) {
  let state = { exists: true, data: { ...initial } };
  let queue = Promise.resolve();
  let writeCount = 0;
  const projectRef = { path: "projects/project-1" };
  const db = {
    runTransaction(callback) {
      const operation = queue.then(async () => {
        const writes = [];
        const transaction = {
          async get(ref) {
            assert.equal(ref, projectRef);
            return {
              exists: state.exists,
              get(field) { return state.data[field]; },
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

const valid = createFakeFirestore({ paymentToken: "ABC123", status: "quoted", advancePaid: false });
const concurrentResults = await Promise.all([
  verifyAndConsumePaymentToken(valid.db, valid.projectRef, "ABC123"),
  verifyAndConsumePaymentToken(valid.db, valid.projectRef, "ABC123"),
]);
assert.deepEqual(concurrentResults.sort(), [false, true], "only one concurrent verifier may consume a token");
assert.equal(valid.read().paymentToken, null);
assert.equal(valid.read().advancePaid, true);
assert.equal(valid.read().status, "accepted");
assert.equal(valid.writeCount(), 1, "token consumption must commit exactly once");

const missing = createFakeFirestore({ paymentToken: "ABC123", advancePaid: false });
missing.setExists(false);
assert.equal(await verifyAndConsumePaymentToken(missing.db, missing.projectRef, "ABC123"), false);
assert.equal(missing.writeCount(), 0);

const mismatch = createFakeFirestore({ paymentToken: "ABC123", advancePaid: false });
assert.equal(await verifyAndConsumePaymentToken(mismatch.db, mismatch.projectRef, "WRONG1"), false);
assert.equal(mismatch.writeCount(), 0);

const absent = createFakeFirestore({ advancePaid: false });
assert.equal(await verifyAndConsumePaymentToken(absent.db, absent.projectRef, "ABC123"), false);
assert.equal(absent.writeCount(), 0);

console.log("Payment token generation and atomic single-use verification tests passed.");
