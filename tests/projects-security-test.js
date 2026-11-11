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
const originalConsoleError = console.error;

try {
  const capturedErrors = [];
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "invalid-test-token");
      throw new Error("private Firebase verifier diagnostic");
    },
  });
  console.error = (...args) => capturedErrors.push(args);

  const response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer invalid-test-token" },
    query: {},
  }, response);

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, {
    success: false,
    message: "Build Logic Verification Failure",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_ENGINE_CRASH"],
    ["[API_ERROR] 403: Build Logic Verification Failure"],
  ]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firebase verifier diagnostic"), false);

  console.log("Project API security tests passed: Firebase verifier diagnostics are redacted and the existing response contract is preserved.");
} finally {
  admin.auth = originalAuth;
  console.error = originalConsoleError;
}
