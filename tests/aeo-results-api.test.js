import assert from "node:assert/strict";
import { createAeoResultsHandler } from "../api/aeo/results.js";

function createResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    ended: false,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function createAdmin({
  uid = "tenant-a",
  token = "valid-test-token",
  configured = true,
  records = new Map(),
  readError = null,
} = {}) {
  const reads = [];
  const database = {
    collection(name) {
      assert.equal(name, "aeo_results");
      return {
        doc(id) {
          return {
            async get() {
              reads.push(id);
              if (readError) throw readError;
              const record = records.get(id);
              return {
                exists: record !== undefined,
                data: () => record,
              };
            },
          };
        },
      };
    },
  };

  return {
    apps: configured ? [{}] : [],
    reads,
    auth() {
      return {
        async verifyIdToken(candidate) {
          if (candidate !== token) throw new Error("invalid test token");
          return { uid };
        },
      };
    },
    firestore() {
      return database;
    },
  };
}

function createRequest({
  method = "GET",
  authorization = "Bearer valid-test-token",
  query = { id: "result-a" },
} = {}) {
  return {
    method,
    headers: authorization === null ? {} : { authorization },
    query,
  };
}

function validRecord(overrides = {}) {
  return {
    userId: "tenant-a",
    keyword: "real estate lead qualification",
    requestedCount: 2,
    qaPairs: [
      {
        question: "How are property leads qualified?",
        answer: "Using agreed fit and intent criteria.",
      },
      {
        question: "How should a property lead be followed up?",
        answer: "Use a timely, relevant follow-up based on the lead's request.",
      },
    ],
    provider: "opencode",
    model: "deepseek-v4-flash-free",
    schemaVersion: 1,
    createdAt: "2026-11-26T10:00:00.000Z",
    ...overrides,
  };
}

function assertNoStore(response) {
  assert.equal(response.headers["cache-control"], "no-store");
}

// The route is read-only and does not enable credentialed CORS.
{
  const handler = createAeoResultsHandler();
  const options = createResponse();
  await handler(createRequest({ method: "OPTIONS", authorization: null }), options);
  assert.equal(options.statusCode, 204);
  assert.equal(options.headers.allow, "GET, OPTIONS");
  assert.equal(options.ended, true);
  assertNoStore(options);

  const post = createResponse();
  await handler(createRequest({ method: "POST" }), post);
  assert.equal(post.statusCode, 405);
  assert.equal(post.headers.allow, "GET, OPTIONS");
  assertNoStore(post);
}

// IDs and query shape are validated before authentication or database access.
{
  const adminClient = createAdmin();
  const handler = createAeoResultsHandler({
    adminClient,
    rateLimit: async () => {},
  });

  for (const query of [
    null,
    {},
    { id: ["result-a"] },
    { id: "" },
    { id: "result/a" },
    { id: " result-a" },
    { id: "x".repeat(129) },
    { id: "result-a", userId: "tenant-a" },
  ]) {
    const response = createResponse();
    await handler(createRequest({ query }), response);
    assert.equal(response.statusCode, 400);
    assertNoStore(response);
  }
  assert.deepEqual(adminClient.reads, []);
}

// Authentication and Firebase readiness fail closed.
{
  const adminClient = createAdmin();
  const handler = createAeoResultsHandler({
    adminClient,
    rateLimit: async () => {},
  });

  const missingAuth = createResponse();
  await handler(createRequest({ authorization: null }), missingAuth);
  assert.equal(missingAuth.statusCode, 401);
  assertNoStore(missingAuth);

  const invalidAuth = createResponse();
  await handler(createRequest({ authorization: "Bearer invalid" }), invalidAuth);
  assert.equal(invalidAuth.statusCode, 401);
  assertNoStore(invalidAuth);

  const unavailableAdmin = createResponse();
  await createAeoResultsHandler({
    adminClient: createAdmin({ configured: false }),
    rateLimit: async () => {},
  })(createRequest(), unavailableAdmin);
  assert.equal(unavailableAdmin.statusCode, 503);
  assertNoStore(unavailableAdmin);

  assert.deepEqual(adminClient.reads, []);
}

// A verified owner can read one result; private ownership/provider fields are not returned.
{
  const records = new Map([["result-a", validRecord()]]);
  const adminClient = createAdmin({ records });
  let rateArgs;
  const response = createResponse();

  await createAeoResultsHandler({
    adminClient,
    rateLimit: async (...args) => { rateArgs = args.slice(1); },
  })(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assertNoStore(response);
  assert.deepEqual(rateArgs, ["uid:tenant-a", "aeo-result-read", 30]);
  assert.deepEqual(response.body, {
    success: true,
    data: {
      resultId: "result-a",
      keyword: "real estate lead qualification",
      requestedCount: 2,
      qaPairs: [
        {
          question: "How are property leads qualified?",
          answer: "Using agreed fit and intent criteria.",
        },
        {
          question: "How should a property lead be followed up?",
          answer: "Use a timely, relevant follow-up based on the lead's request.",
        },
      ],
      createdAt: "2026-11-26T10:00:00.000Z",
    },
  });
  assert.equal("userId" in response.body.data, false);
  assert.equal("provider" in response.body.data, false);
  assert.equal("model" in response.body.data, false);
  assert.deepEqual(adminClient.reads, ["result-a"]);
}

// Cross-tenant and unknown IDs both return 404 without revealing record data.
{
  const records = new Map([["result-a", validRecord()]]);
  const otherTenant = createAdmin({ uid: "tenant-b", records });
  const response = createResponse();

  await createAeoResultsHandler({
    adminClient: otherTenant,
    rateLimit: async () => {},
  })(createRequest(), response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { success: false, message: "AEO result not found." });
  assertNoStore(response);

  const missing = createResponse();
  await createAeoResultsHandler({
    adminClient: createAdmin({ records }),
    rateLimit: async () => {},
  })(createRequest({ query: { id: "missing-result" } }), missing);
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(missing.body, { success: false, message: "AEO result not found." });
  assertNoStore(missing);
}

// The rate limiter is UID-scoped, and both abuse-control and storage failures fail closed.
{
  const denied = createResponse();
  const deniedAdmin = createAdmin();
  await createAeoResultsHandler({
    adminClient: deniedAdmin,
    rateLimit: async (_admin, userKey, action, limit) => {
      assert.equal(userKey, "uid:tenant-a");
      assert.equal(action, "aeo-result-read");
      assert.equal(limit, 30);
      const error = new Error("limited");
      error.status = 429;
      error.retryAfter = 45;
      throw error;
    },
  })(createRequest(), denied);
  assert.equal(denied.statusCode, 429);
  assert.equal(denied.headers["retry-after"], "45");
  assertNoStore(denied);
  assert.deepEqual(deniedAdmin.reads, []);

  const unavailableLimiter = createResponse();
  await createAeoResultsHandler({
    adminClient: createAdmin(),
    rateLimit: async () => { throw new Error("private rate-limit detail"); },
  })(createRequest(), unavailableLimiter);
  assert.equal(unavailableLimiter.statusCode, 503);
  assert.equal(JSON.stringify(unavailableLimiter.body).includes("private rate-limit detail"), false);
  assertNoStore(unavailableLimiter);

  const unavailableStore = createResponse();
  await createAeoResultsHandler({
    adminClient: createAdmin({ readError: new Error("private Firestore read detail") }),
    rateLimit: async () => {},
  })(createRequest(), unavailableStore);
  assert.equal(unavailableStore.statusCode, 503);
  assert.equal(JSON.stringify(unavailableStore.body).includes("private Firestore read detail"), false);
  assertNoStore(unavailableStore);
}

// Corrupt or unexpected stored data is never returned as a successful API response.
{
  const malformed = createResponse();
  await createAeoResultsHandler({
    adminClient: createAdmin({
      records: new Map([["result-a", validRecord({ qaPairs: [] })]]),
    }),
    rateLimit: async () => {},
  })(createRequest(), malformed);
  assert.equal(malformed.statusCode, 503);
  assert.equal(malformed.body.success, false);
  assertNoStore(malformed);
}

console.log("AEO result retrieval API tenant-isolation tests passed.");
