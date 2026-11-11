import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import handler from "../api/rank-tracker.js";

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
          { url: "https://example.com/other" },
          { url: "https://quickkitai.com/ai-visibility" }
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
  assert.equal(response.body.results[0].rank, 2);
  assert.equal(response.headers["Cache-Control"], "no-store");

  response = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-admin-token" },
  }, response);
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers["Retry-After"] !== undefined, true);

  console.log("Rank tracker tests passed: method/auth guards, admin-only access, missing-key fail-closed, rate limit, and result summary.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
}
