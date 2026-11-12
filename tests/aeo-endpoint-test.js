import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import handler from "../api/aeo-generate.js";
import admin from "../api/_lib/firebaseAdmin.js";
const aeoSource = readFileSync(new URL("../api/aeo-generate.js", import.meta.url), "utf8");
const aeoErrorLogLines = aeoSource
  .split("\\n")
  .map((line) => line.trim())
  .filter((line) => line.includes("console.error("));
assert.deepEqual(
  aeoErrorLogLines,
  ['console.error("AEO_GENERATION_FAILED");'],
  "AEO generation must not log raw provider or database exception details."
);

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


const originalAuthForFailure = admin.auth;
const originalFirestoreForFailure = admin.firestore;
const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENCODE_API_KEY;
const originalApiUrl = process.env.OPENCODE_API_URL;
const originalConsoleError = console.error;
try {
  const capturedErrors = [];
  process.env.OPENCODE_API_KEY = "test-only-key";
  process.env.OPENCODE_API_URL = "https://provider.example.test/v1/chat/completions";
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify([{
            question: "What is a real estate CRM?",
            answer: "A CRM helps organize property leads."
          }])
        }
      }]
    })
  });
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "admin-token");
      return { uid: "admin-1" };
    }
  });
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
      }
      if (name === "rate_limits") {
        return { doc: () => ({ id: "rate-limit-test" }) };
      }
      if (name === "aeo_generations") {
        return {
          add: async () => {
            const error = new Error("private Firestore permission diagnostic");
            error.status = 403;
            throw error;
          }
        };
      }
      throw new Error("Unexpected test collection.");
    },
    async runTransaction(callback) {
      return callback({
        get: async () => ({ data: () => ({ count: 0, firstCall: Date.now() }) }),
        set: () => {}
      });
    }
  });
  console.error = (...args) => capturedErrors.push(args);

  const providerFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer admin-token" },
    body: { keyword: "Real estate CRM", count: 1 }
  }, providerFailureResponse);

  assert.equal(providerFailureResponse.statusCode, 502);
  assert.deepEqual(providerFailureResponse.body, {
    success: false,
    error: "AEO generation failed. No draft was published."
  });
  assert.deepEqual(capturedErrors, [["AEO_GENERATION_FAILED"]]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firestore permission diagnostic"), false);
  assert.equal(JSON.stringify(providerFailureResponse.body).includes("private Firestore permission diagnostic"), false);
} finally {
  admin.auth = originalAuthForFailure;
  admin.firestore = originalFirestoreForFailure;
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.OPENCODE_API_KEY;
  else process.env.OPENCODE_API_KEY = originalApiKey;
  if (originalApiUrl === undefined) delete process.env.OPENCODE_API_URL;
  else process.env.OPENCODE_API_URL = originalApiUrl;
  console.error = originalConsoleError;
}

console.log("AEO endpoint tests passed: method/auth guards, payload validation, and generic handling of sensitive backend failures.");
