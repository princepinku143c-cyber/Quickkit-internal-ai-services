import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import handler from "../api/aeo-generate.js";
import admin from "../api/_lib/firebaseAdmin.js";
const aeoSource = readFileSync(new URL("../api/aeo-generate.js", import.meta.url), "utf8");
const aeoErrorLogLines = aeoSource
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.includes("console.error("));
assert.deepEqual(
  aeoErrorLogLines,
  [
    'console.error("AEO_AUTH_UNAVAILABLE");',
    'console.error("AEO_PROFILE_LOOKUP_FAILED");',
    'console.error("AEO_RATE_LIMIT_UNAVAILABLE");',
    'console.error("AEO_PROVIDER_FAILED");',
    'console.error("AEO_DRAFT_SAVE_FAILED");',
  ],
  "AEO authentication, provider, and database failures must use fixed redacted log labels."
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

const originalAuthForClassification = admin.auth;
const originalFirestoreForClassification = admin.firestore;
const originalConsoleErrorForClassification = console.error;
const originalConsoleWarnForClassification = console.warn;
try {
  const capturedAuthErrors = [];
  const capturedAuthWarnings = [];
  console.error = (...args) => capturedAuthErrors.push(args);
  console.warn = (...args) => capturedAuthWarnings.push(args);
  admin.firestore = () => {
    throw new Error("Firestore must not be accessed before token verification.");
  };

  const invalidTokenDiagnostic = "private Firebase expired-token diagnostic";
  const invalidTokenError = new Error(invalidTokenDiagnostic);
  invalidTokenError.code = "auth/id-token-expired";
  admin.auth = () => ({
    verifyIdToken: async () => { throw invalidTokenError; },
  });
  const invalidTokenResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer expired-test-token" },
    body: { keyword: "test", count: 1 },
  }, invalidTokenResponse);
  assert.equal(invalidTokenResponse.statusCode, 401);
  assert.deepEqual(invalidTokenResponse.body, {
    success: false,
    error: "Authentication failed.",
  });
  assert.deepEqual(capturedAuthWarnings, [["AEO_AUTH_FAILED"]]);
  assert.deepEqual(capturedAuthErrors, []);
  assert.equal(JSON.stringify(capturedAuthWarnings).includes(invalidTokenDiagnostic), false);
  assert.equal(JSON.stringify(invalidTokenResponse.body).includes(invalidTokenDiagnostic), false);

  capturedAuthWarnings.length = 0;
  const verifierDiagnostic = "private Firebase verifier outage diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => { throw new Error(verifierDiagnostic); },
  });
  const verifierFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer token-during-outage" },
    body: { keyword: "test", count: 1 },
  }, verifierFailureResponse);
  assert.equal(verifierFailureResponse.statusCode, 503);
  assert.deepEqual(verifierFailureResponse.body, {
    success: false,
    error: "Authentication service is temporarily unavailable.",
  });
  assert.deepEqual(capturedAuthErrors, [["AEO_AUTH_UNAVAILABLE"]]);
  assert.equal(JSON.stringify(capturedAuthErrors).includes(verifierDiagnostic), false);
  assert.equal(JSON.stringify(verifierFailureResponse.body).includes(verifierDiagnostic), false);
} finally {
  admin.auth = originalAuthForClassification;
  admin.firestore = originalFirestoreForClassification;
  console.error = originalConsoleErrorForClassification;
  console.warn = originalConsoleWarnForClassification;
}

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


const originalAuthForBackendFailures = admin.auth;
const originalFirestoreForBackendFailures = admin.firestore;
const originalConsoleErrorForBackendFailures = console.error;
try {
  const capturedBackendErrors = [];
  console.error = (...args) => capturedBackendErrors.push(args);
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "admin-1" }),
  });

  const profileDiagnostic = "private Firestore profile lookup diagnostic";
  admin.firestore = () => ({
    collection(name) {
      assert.equal(name, "users");
      return {
        doc: () => ({
          get: async () => { throw new Error(profileDiagnostic); },
        }),
      };
    },
  });
  const profileFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer admin-token" },
    body: { keyword: "Real estate CRM", count: 1 },
  }, profileFailureResponse);
  assert.equal(profileFailureResponse.statusCode, 503);
  assert.deepEqual(profileFailureResponse.body, {
    success: false,
    error: "Authorization service is temporarily unavailable.",
  });
  assert.deepEqual(capturedBackendErrors, [["AEO_PROFILE_LOOKUP_FAILED"]]);
  assert.equal(JSON.stringify(capturedBackendErrors).includes(profileDiagnostic), false);
  assert.equal(JSON.stringify(profileFailureResponse.body).includes(profileDiagnostic), false);

  capturedBackendErrors.length = 0;
  const rateLimitDiagnostic = "private Firestore rate-limit transaction diagnostic";
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
      }
      if (name === "rate_limits") {
        return { doc: () => ({ id: "rate-limit-test" }) };
      }
      throw new Error("Unexpected test collection.");
    },
    runTransaction: async () => { throw new Error(rateLimitDiagnostic); },
  });
  const rateLimitFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer admin-token" },
    body: { keyword: "Real estate CRM", count: 1 },
  }, rateLimitFailureResponse);
  assert.equal(rateLimitFailureResponse.statusCode, 503);
  assert.deepEqual(rateLimitFailureResponse.body, {
    success: false,
    error: "AEO generation is temporarily unavailable.",
  });
  assert.deepEqual(capturedBackendErrors, [
    ["RATE_LIMIT_UNAVAILABLE"],
    ["AEO_RATE_LIMIT_UNAVAILABLE"],
  ]);
  assert.equal(JSON.stringify(capturedBackendErrors).includes(rateLimitDiagnostic), false);
  assert.equal(JSON.stringify(rateLimitFailureResponse.body).includes(rateLimitDiagnostic), false);
} finally {
  admin.auth = originalAuthForBackendFailures;
  admin.firestore = originalFirestoreForBackendFailures;
  console.error = originalConsoleErrorForBackendFailures;
}

const originalAuthForProviderFailure = admin.auth;
const originalFirestoreForProviderFailure = admin.firestore;
const originalFetchForProviderFailure = globalThis.fetch;
const originalApiKeyForProviderFailure = process.env.OPENCODE_API_KEY;
const originalApiUrlForProviderFailure = process.env.OPENCODE_API_URL;
const originalConsoleErrorForProviderFailure = console.error;
try {
  const capturedProviderErrors = [];
  process.env.OPENCODE_API_KEY = "test-only-key";
  process.env.OPENCODE_API_URL = "https://provider.example.test/v1/chat/completions";
  globalThis.fetch = async () => {
    throw new Error("private provider transport diagnostic");
  };
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "admin-1" }),
  });
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
      }
      if (name === "rate_limits") {
        return { doc: () => ({ id: "rate-limit-test" }) };
      }
      throw new Error("Unexpected test collection.");
    },
    async runTransaction(callback) {
      return callback({
        get: async () => ({ data: () => ({ count: 0, firstCall: Date.now() }) }),
        set: () => {},
      });
    },
  });
  console.error = (...args) => capturedProviderErrors.push(args);

  const providerFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer admin-token" },
    body: { keyword: "Real estate CRM", count: 1 },
  }, providerFailureResponse);
  assert.equal(providerFailureResponse.statusCode, 502);
  assert.deepEqual(providerFailureResponse.body, {
    success: false,
    error: "AEO generation failed. No draft was published.",
  });
  assert.deepEqual(capturedProviderErrors, [["AEO_PROVIDER_FAILED"]]);
  assert.equal(JSON.stringify(capturedProviderErrors).includes("private provider transport diagnostic"), false);
  assert.equal(JSON.stringify(providerFailureResponse.body).includes("private provider transport diagnostic"), false);
} finally {
  admin.auth = originalAuthForProviderFailure;
  admin.firestore = originalFirestoreForProviderFailure;
  globalThis.fetch = originalFetchForProviderFailure;
  if (originalApiKeyForProviderFailure === undefined) delete process.env.OPENCODE_API_KEY;
  else process.env.OPENCODE_API_KEY = originalApiKeyForProviderFailure;
  if (originalApiUrlForProviderFailure === undefined) delete process.env.OPENCODE_API_URL;
  else process.env.OPENCODE_API_URL = originalApiUrlForProviderFailure;
  console.error = originalConsoleErrorForProviderFailure;
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

  const draftSaveFailureResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer admin-token" },
    body: { keyword: "Real estate CRM", count: 1 }
  }, draftSaveFailureResponse);

  assert.equal(draftSaveFailureResponse.statusCode, 503);
  assert.deepEqual(draftSaveFailureResponse.body, {
    success: false,
    error: "AEO draft could not be saved. Please retry."
  });
  assert.deepEqual(capturedErrors, [["AEO_DRAFT_SAVE_FAILED"]]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firestore permission diagnostic"), false);
  assert.equal(JSON.stringify(draftSaveFailureResponse.body).includes("private Firestore permission diagnostic"), false);
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

console.log("AEO endpoint tests passed: method/auth guards, admin role checks, Firebase profile/rate-limit outage classification, provider failures, draft persistence failures, and redacted diagnostics.");
