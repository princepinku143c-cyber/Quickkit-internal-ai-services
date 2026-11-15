import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import handler, { isQuickKitDomainUrl } from "../api/rank-tracker.js";

assert.equal(isQuickKitDomainUrl("https://quickkitai.com/"), true);
assert.equal(isQuickKitDomainUrl("https://www.quickkitai.com/ai-visibility"), true);
assert.equal(isQuickKitDomainUrl("https://quickkitai.com.attacker.example/"), false);
assert.equal(isQuickKitDomainUrl("https://attacker.example/quickkitai.com"), false);
assert.equal(isQuickKitDomainUrl("https://quickkitai.com.evil/"), false);
assert.equal(isQuickKitDomainUrl("ftp://quickkitai.com/file"), false);
assert.equal(isQuickKitDomainUrl("https://user:pass@quickkitai.com/"), false);
assert.equal(isQuickKitDomainUrl("not-a-url"), false);

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

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalKey = process.env.TAVILY_API_KEY;
const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const capturedErrors = [];
const capturedWarnings = [];

try {
  let response = mockResponse();
  await handler({ method: "POST", headers: {} }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET, OPTIONS");

  response = mockResponse();
  await handler({ method: "GET", headers: {} }, response);
  assert.equal(response.statusCode, 401);

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
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-client-token" },
  }, response);
  assert.equal(response.statusCode, 403);

  // A stale server-signed admin claim must not override a demoted Firestore role.
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "stale-admin-claim-token");
      return { uid: "ordinary-client", admin: true };
    },
  });
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer stale-admin-claim-token" },
  }, response);
  assert.equal(response.statusCode, 403);

  // Known invalid/expired ID tokens are client authentication failures (401).
  console.warn = (...args) => { capturedWarnings.push(args); };
  const invalidTokenDiagnostic = "sensitive-expired-token-diagnostic";
  const invalidTokenError = new Error(invalidTokenDiagnostic);
  invalidTokenError.code = "auth/id-token-expired";
  admin.auth = () => ({
    verifyIdToken: async () => { throw invalidTokenError; },
  });
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer expired-test-token" },
  }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Authentication failed.");
  assert.deepEqual(capturedWarnings, [["RANK_TRACKER_AUTH_INVALID"]]);
  assert.equal(capturedErrors.length, 0);
  assert.equal(capturedWarnings.flat().join(" ").includes(invalidTokenDiagnostic), false);
  assert.equal(JSON.stringify(response.body).includes(invalidTokenDiagnostic), false);
  capturedWarnings.length = 0;

  // Firebase verifier outages remain generic 503 responses; diagnostics are redacted.
  console.error = (...args) => { capturedErrors.push(args); };
  const authDiagnostic = "sensitive-firebase-auth-diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => { throw new Error(authDiagnostic); },
  });
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer invalid-token" },
  }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, "Rank tracking authorization is temporarily unavailable.");
  assert.equal(capturedErrors.flat().join(" ").includes(authDiagnostic), false);
  assert.equal(capturedErrors.some(args => args[0] === "RANK_TRACKER_AUTH_FAILED"), true);

  // Firestore rate-limit backend diagnostics must also remain out of logs.
  capturedErrors.length = 0;
  const limiterDiagnostic = "sensitive-firestore-limiter-diagnostic";
  const failingRateLimitDb = {
    collection(name) {
      if (name === "users") {
        return {
          doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }),
        };
      }
      assert.equal(name, "rate_limits");
      return { doc: () => ({}) };
    },
    async runTransaction() {
      throw new Error(limiterDiagnostic);
    },
  };
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "admin-user", admin: false }),
  });
  admin.firestore = () => failingRateLimitDb;
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-admin-token" },
  }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, "Rank tracking authorization is temporarily unavailable.");
  assert.equal(capturedErrors.flat().join(" ").includes(limiterDiagnostic), false);
  assert.equal(capturedErrors.some(args => args[0] === "RATE_LIMIT_UNAVAILABLE"), true);
  assert.equal(capturedErrors.some(args => args[0] === "RANK_TRACKER_AUTH_FAILED"), true);
  console.error = originalConsoleError;

  let rateLimitCount = 0;
  const fakeDb = {
    collection(name) {
      if (name === "users") {
        return {
          doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }),
        };
      }
      assert.equal(name, "rate_limits");
      return { doc: () => ({}) };
    },
    async runTransaction(callback) {
      return callback({
        get: async () => ({
          data: () => ({ count: rateLimitCount, firstCall: Date.now() }),
        }),
        set: () => { rateLimitCount += 1; },
      });
    },
  };
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-admin-token");
      return { uid: "admin-user", admin: false };
    },
  });
  admin.firestore = () => fakeDb;

  delete process.env.TAVILY_API_KEY;
  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-admin-token" },
  }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, "TAVILY_API_KEY_MISSING");

  process.env.TAVILY_API_KEY = "test-only-key";
  rateLimitCount = 0;
  globalThis.setTimeout = (callback) => originalSetTimeout(callback, 0);
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    assert.equal(JSON.parse(options.body).api_key, "test-only-key");
    return {
      ok: true,
      json: async () => ({
        results: [
          { url: "https://quickkitai.com.attacker.example/spoof" },
          { url: "https://attacker.example/path/quickkitai.com" },
          { url: "https://www.quickkitai.com/ai-visibility" },
          { url: "https://quickkitai.com/" }
        ]
      })
    };
  };

  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-admin-token" },
  }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(calls, 10);
  assert.equal(response.body.summary.total, 10);
  assert.equal(response.body.summary.found, 10);
  assert.equal(response.body.summary.errors, 0);
  assert.equal(response.body.results[0].rank, 3);
  assert.equal(response.headers["Cache-Control"], "no-store");

  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-admin-token" },
  }, response);
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers["Retry-After"] !== undefined, true);

  console.log("Rank tracker tests passed: auth, rate limits, provider handling, exact host matching, and result summary.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
}
