import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import handler from "../api/user-provision.js";

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; },
  };
}

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

try {
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
  await handler({ method: "POST", headers: {}, body: {} }, unauthenticatedResponse);
  assert.equal(unauthenticatedResponse.statusCode, 401);
  assert.equal(unauthenticatedResponse.body.success, false);

  const capturedErrors = [];
  const capturedWarnings = [];
  console.error = (...args) => capturedErrors.push(args);
  console.warn = (...args) => capturedWarnings.push(args);

  // Known invalid/expired ID tokens are client authentication failures (401).
  const invalidTokenDiagnostic = "private Firebase invalid-token diagnostic";
  const invalidTokenError = new Error(invalidTokenDiagnostic);
  invalidTokenError.code = "auth/id-token-expired";
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "expired-test-token");
      throw invalidTokenError;
    },
  });

  const invalidTokenResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer expired-test-token" },
    body: {},
  }, invalidTokenResponse);
  assert.equal(invalidTokenResponse.statusCode, 401);
  assert.deepEqual(invalidTokenResponse.body, {
    success: false,
    error: "Authentication failed.",
  });
  assert.deepEqual(capturedWarnings, [["USER_PROVISION_AUTH_FAILED"]]);
  assert.deepEqual(capturedErrors, []);
  assert.equal(JSON.stringify(capturedWarnings).includes(invalidTokenDiagnostic), false);
  assert.equal(JSON.stringify(invalidTokenResponse.body).includes(invalidTokenDiagnostic), false);

  // Unknown verifier errors remain 503 and never expose Firebase diagnostics.
  capturedWarnings.length = 0;
  const verifierDiagnostic = "private Firebase verifier availability diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => {
      throw new Error(verifierDiagnostic);
    },
  });
  const verifierFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer token-during-outage" },
    body: {},
  }, verifierFailureResponse);
  assert.equal(verifierFailureResponse.statusCode, 503);
  assert.deepEqual(verifierFailureResponse.body, {
    success: false,
    error: "Authentication service is temporarily unavailable.",
  });
  assert.deepEqual(capturedErrors, [["USER_PROVISION_AUTH_UNAVAILABLE"]]);
  assert.equal(JSON.stringify(capturedErrors).includes(verifierDiagnostic), false);
  assert.equal(JSON.stringify(verifierFailureResponse.body).includes(verifierDiagnostic), false);

  // Database/transaction failures also remain generic 503 responses.
  capturedErrors.length = 0;
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "new-user" }),
  });
  admin.firestore = () => ({
    collection: () => ({ doc: () => ({ id: "new-user" }) }),
    runTransaction: async () => {
      throw new Error("private Firestore transaction diagnostic");
    },
  });
  const databaseFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer valid-test-token" },
    body: {},
  }, databaseFailureResponse);
  assert.equal(databaseFailureResponse.statusCode, 503);
  assert.deepEqual(capturedErrors, [["USER_PROVISION_FAILED"]]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firestore transaction diagnostic"), false);
  assert.equal(JSON.stringify(databaseFailureResponse.body).includes("private Firestore transaction diagnostic"), false);

  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-test-token");
      return { uid: "new-user", email: "user@example.test", name: "Test User" };
    },
  });

  let createdProfile;
  let createCalls = 0;
  admin.firestore = () => ({
    collection(name) {
      assert.equal(name, "users");
      return {
        doc(uid) {
          assert.equal(uid, "new-user");
          return { id: uid };
        },
      };
    },
    async runTransaction(callback) {
      return callback({
        get: async () => ({ exists: false }),
        create: (_ref, value) => {
          createCalls += 1;
          createdProfile = value;
        },
      });
    },
  });

  const createdResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer valid-test-token" },
    body: { role: "admin", credits: 999999 },
  }, createdResponse);
  assert.equal(createdResponse.statusCode, 200);
  assert.equal(createdResponse.body.data.created, true);
  assert.equal(createdResponse.body.data.profileReady, true);
  assert.equal(createdProfile.role, "client");
  assert.equal(createdProfile.credits, 500);
  assert.equal(createdProfile.email, "user@example.test");
  assert.equal(createCalls, 1);

  admin.firestore = () => ({
    collection: () => ({
      doc: () => ({ id: "new-user" }),
    }),
    async runTransaction(callback) {
      return callback({
        get: async () => ({ exists: true }),
        create: () => {
          throw new Error("Existing profiles must never be overwritten.");
        },
      });
    },
  });

  const existingResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer valid-test-token" },
    body: {},
  }, existingResponse);
  assert.equal(existingResponse.statusCode, 200);
  assert.equal(existingResponse.body.data.created, false);

  console.log("User provisioning tests passed: method/auth guards, invalid-token 401, verifier/database 503, safe logging, client-only role, fixed starter credits, and idempotency.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}
