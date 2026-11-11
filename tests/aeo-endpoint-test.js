import assert from "node:assert/strict";
import handler from "../api/aeo-generate.js";
import admin from "../api/_lib/firebaseAdmin.js";
function mockResponse() {
  return {
    statusCode: 200, headers: {}, body: null, ended: false,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; }
  };
}
const getResponse = mockResponse();
await handler({ method: "GET", headers: {} }, getResponse);
assert.equal(getResponse.statusCode, 405);
assert.equal(getResponse.headers.Allow, "POST, OPTIONS");
const optionsResponse = mockResponse();
await handler({ method: "OPTIONS", headers: {} }, optionsResponse);
assert.equal(optionsResponse.statusCode, 204);
assert.equal(optionsResponse.ended, true);
assert.equal(optionsResponse.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");
const unauthenticatedResponse = mockResponse();
await handler({ method: "POST", headers: {}, body: { keyword: "test", count: 1 } }, unauthenticatedResponse);
assert.equal(unauthenticatedResponse.statusCode, 401);
assert.equal(unauthenticatedResponse.body.success, false);
const invalidPayloadResponse = mockResponse();
await handler({ method: "POST", headers: {}, body: [] }, invalidPayloadResponse);
assert.equal(invalidPayloadResponse.statusCode, 400);

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
try {
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-client-token");
      return { uid: "ordinary-client", admin: false };
    },
  });
  admin.firestore = () => ({
    collection(name) {
      assert.equal(name, "users");
      return {
        doc(uid) {
          assert.equal(uid, "ordinary-client");
          return {
            get: async () => ({ data: () => ({ role: "client" }) }),
          };
        },
      };
    },
  });
  const forbiddenResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer valid-client-token" },
    body: { keyword: "test", count: 1 },
  }, forbiddenResponse);
  assert.equal(forbiddenResponse.statusCode, 403);
  assert.equal(forbiddenResponse.body.success, false);

  // A stale server-signed admin claim must not override a demoted Firestore role.
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "stale-admin-claim-token");
      return { uid: "ordinary-client", admin: true };
    },
  });
  const staleClaimResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer stale-admin-claim-token" },
    body: { keyword: "test", count: 1 },
  }, staleClaimResponse);
  assert.equal(staleClaimResponse.statusCode, 403);
  assert.equal(staleClaimResponse.body.success, false);
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
}

console.log("AEO endpoint tests passed: method guard, preflight, unauthenticated and non-admin denial, and payload validation.");
