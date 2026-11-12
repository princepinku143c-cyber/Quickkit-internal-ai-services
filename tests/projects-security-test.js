import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import handler from "../api/projects.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

try {
  const capturedErrors = [];
  const capturedWarnings = [];
  console.error = (...args) => capturedErrors.push(args);
  console.warn = (...args) => capturedWarnings.push(args);

  // Invalid Firebase credentials return 401 without exposing verifier diagnostics.
  const invalidTokenDiagnostic = "private Firebase verifier diagnostic";
  const invalidTokenError = new Error(invalidTokenDiagnostic);
  invalidTokenError.code = "auth/invalid-id-token";
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "invalid-test-token");
      throw invalidTokenError;
    },
  });

  const authResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer invalid-test-token" },
    query: {},
  }, authResponse);

  assert.equal(authResponse.statusCode, 401);
  assert.deepEqual(authResponse.body, {
    success: false,
    message: "Authentication failed.",
  });
  assert.deepEqual(capturedWarnings, [["PROJECT_AUTH_FAILED"]]);
  assert.deepEqual(capturedErrors, [
    ["[API_ERROR] 401: Authentication failed."],
  ]);
  assert.equal(JSON.stringify(capturedWarnings).includes(invalidTokenDiagnostic), false);
  assert.equal(JSON.stringify(capturedErrors).includes(invalidTokenDiagnostic), false);

  // Firebase verifier/service failures are 503, not invalid-credential responses.
  capturedErrors.length = 0;
  capturedWarnings.length = 0;
  const authServiceDiagnostic = "private Firebase Admin availability diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => {
      throw new Error(authServiceDiagnostic);
    },
  });

  const unavailableResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer test-token-during-outage" },
    query: {},
  }, unavailableResponse);

  assert.equal(unavailableResponse.statusCode, 503);
  assert.deepEqual(unavailableResponse.body, {
    success: false,
    message: "Authentication service is temporarily unavailable.",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_AUTH_UNAVAILABLE"],
    ["[API_ERROR] 503: Authentication service is temporarily unavailable."],
  ]);
  assert.deepEqual(capturedWarnings, []);
  assert.equal(JSON.stringify(capturedErrors).includes(authServiceDiagnostic), false);
  assert.equal(JSON.stringify(unavailableResponse.body).includes(authServiceDiagnostic), false);

  // A Firestore rejection from an async route handler must be awaited and
  // converted to a generic 500 response instead of escaping the handler.
  capturedErrors.length = 0;
  const databaseDiagnostic = "private Firestore connection diagnostic";
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-test-token");
      return { uid: "client-1" };
    },
  });
  admin.firestore = () => {
    throw new Error(databaseDiagnostic);
  };

  const databaseResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-test-token" },
    query: {},
  }, databaseResponse);

  assert.equal(databaseResponse.statusCode, 500);
  assert.deepEqual(databaseResponse.body, {
    success: false,
    message: "Unable to process project request right now.",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_REQUEST_FAILED"],
    ["[API_ERROR] 500: Unable to process project request right now."],
  ]);
  assert.equal(JSON.stringify(capturedErrors).includes(databaseDiagnostic), false);
  assert.equal(JSON.stringify(databaseResponse.body).includes(databaseDiagnostic), false);

  console.log("Project API security tests passed: invalid tokens return 401, Firebase verifier outages return 503, and auth/Firestore diagnostics stay redacted.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}
