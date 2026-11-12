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

try {
  const capturedErrors = [];
  console.error = (...args) => capturedErrors.push(args);

  // Invalid Firebase credentials retain the existing authorization response.
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "invalid-test-token");
      throw new Error("private Firebase verifier diagnostic");
    },
  });

  const authResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer invalid-test-token" },
    query: {},
  }, authResponse);

  assert.equal(authResponse.statusCode, 403);
  assert.deepEqual(authResponse.body, {
    success: false,
    message: "Build Logic Verification Failure",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_AUTH_FAILED"],
    ["[API_ERROR] 403: Build Logic Verification Failure"],
  ]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firebase verifier diagnostic"), false);

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

  console.log("Project API security tests passed: Firebase verifier and asynchronous Firestore diagnostics are redacted; request failures return a generic 500.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
}
