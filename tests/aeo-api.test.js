import assert from "node:assert/strict";
import { createAeoHandler, parseAeoPairs } from "../api/aeo.js";
import { checkRateLimit } from "../api/_lib/security.js";

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

function assertNoStore(response) {
  assert.equal(response.headers["cache-control"], "no-store");
}

function createAdmin({ validToken = "valid-test-token", uid = "tenant-user", configured = true } = {}) {
  return {
    apps: configured ? [{}] : [],
    auth() {
      return {
        async verifyIdToken(token) {
          if (token !== validToken) throw new Error("invalid test token");
          return { uid };
        },
      };
    },
  };
}

function createRequest({ method = "POST", authorization = "Bearer valid-test-token", body = { keyword: "real estate lead qualification" } } = {}) {
  return { method, headers: authorization === null ? {} : { authorization }, body };
}

function enabledEnv(overrides = {}) {
  return {
    AEO_API_ENABLED: "true",
    OPENCODE_API_KEY: "unit-test-provider-key",
    ...overrides,
  };
}

function providerResponse(content, ok = true) {
  return {
    ok,
    async json() {
      return { choices: [{ message: { content } }] };
    },
  };
}

const validContent = JSON.stringify([
  { question: "How does AI qualify property leads?", answer: "It scores inquiries using agreed fit and intent criteria." },
  { question: "How quickly should property leads receive a reply?", answer: "Respond promptly and measure the actual response time." },
]);

// The endpoint is method-restricted and does not enable credentialed CORS.
{
  const handler = createAeoHandler();
  const options = createResponse();
  await handler(createRequest({ method: "OPTIONS", authorization: null, body: undefined }), options);
  assert.equal(options.statusCode, 204);
  assertNoStore(options);
  assert.equal(options.ended, true);
  assert.equal(options.headers.allow, "POST, OPTIONS");

  const get = createResponse();
  await handler(createRequest({ method: "GET" }), get);
  assert.equal(get.statusCode, 405);
  assertNoStore(get);
  assert.equal(get.headers.allow, "POST, OPTIONS");
}

// Authentication is mandatory, Firebase readiness fails closed, and disabled mode never calls the provider.
{
  let fetchCalls = 0;
  let rateCalls = 0;
  const common = {
    adminClient: createAdmin(),
    rateLimit: async () => { rateCalls += 1; },
    fetchImpl: async () => { fetchCalls += 1; return providerResponse(validContent); },
  };

  const missingAuth = createResponse();
  await createAeoHandler({ ...common, envProvider: () => enabledEnv() })(
    createRequest({ authorization: null }), missingAuth,
  );
  assert.equal(missingAuth.statusCode, 401);
  assertNoStore(missingAuth);

  const invalidAuth = createResponse();
  await createAeoHandler({ ...common, envProvider: () => enabledEnv() })(
    createRequest({ authorization: "Bearer invalid-token" }), invalidAuth,
  );
  assert.equal(invalidAuth.statusCode, 401);
  assertNoStore(invalidAuth);

  const invalidUid = createResponse();
  await createAeoHandler({
    ...common,
    adminClient: createAdmin({ uid: "invalid/uid" }),
    envProvider: () => enabledEnv(),
  })(createRequest(), invalidUid);
  assert.equal(invalidUid.statusCode, 401);
  assertNoStore(invalidUid);

  const unavailableFirebase = createResponse();
  await createAeoHandler({
    ...common,
    adminClient: createAdmin({ configured: false }),
    envProvider: () => enabledEnv(),
  })(createRequest(), unavailableFirebase);
  assert.equal(unavailableFirebase.statusCode, 503);
  assertNoStore(unavailableFirebase);

  const defaultDisabled = createResponse();
  await createAeoHandler({ ...common, envProvider: () => ({ OPENCODE_API_KEY: "unit-test-provider-key" }) })(
    createRequest(), defaultDisabled,
  );
  assert.equal(defaultDisabled.statusCode, 503);
  assertNoStore(defaultDisabled);
  assert.equal(fetchCalls, 0);

  const disabled = createResponse();
  await createAeoHandler({ ...common, envProvider: () => enabledEnv({ AEO_API_ENABLED: "false" }) })(
    createRequest(), disabled,
  );
  assert.equal(disabled.statusCode, 503);
  assertNoStore(disabled);
  assert.equal(fetchCalls, 0);
  assert.equal(rateCalls, 0);

  const missingProviderKey = createResponse();
  await createAeoHandler({ ...common, envProvider: () => enabledEnv({ OPENCODE_API_KEY: "" }) })(
    createRequest(), missingProviderKey,
  );
  assert.equal(missingProviderKey.statusCode, 503);
  assertNoStore(missingProviderKey);
  assert.equal(fetchCalls, 0);
}

// Payload validation rejects extra fields, oversized topics and invalid counts.
{
  const handler = createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => providerResponse(validContent),
  });

  for (const body of [
    null,
    { keyword: "topic", unexpected: "field" },
    { keyword: "x".repeat(161) },
    { keyword: "   " },
    { keyword: "topic\ninjected" },
    { keyword: "topic", count: 0 },
    { keyword: "topic", count: 6 },
    { keyword: "topic", count: 1.5 },
  ]) {
    const response = createResponse();
    await handler(createRequest({ body }), response);
    assert.equal(response.statusCode, 400);
    assertNoStore(response);
  }

  const oversized = createResponse();
  await handler(createRequest({ body: { keyword: "x".repeat(9000) } }), oversized);
  assert.equal(oversized.statusCode, 413);
  assertNoStore(oversized);
}

// Rate limiting is per verified Firebase UID and fails closed.
{
  let fetchCalls = 0;
  let observed;
  const response = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async (...args) => {
      observed = args.slice(1);
      const error = new Error("limited");
      error.status = 429;
      error.retryAfter = 45;
      throw error;
    },
    fetchImpl: async () => { fetchCalls += 1; return providerResponse(validContent); },
  })(createRequest(), response);

  assert.equal(response.statusCode, 429);
  assertNoStore(response);
  assert.equal(response.headers["retry-after"], "45");
  assert.deepEqual(observed, ["uid:tenant-user", "aeo-generation", 3]);
  assert.equal(fetchCalls, 0);
}

// Rate-limit buckets are derived from the verified Firebase UID, not request-supplied identity.
{
  const observedUserKeys = [];
  const tokenToUid = new Map([
    ["tenant-a-token", "tenant-a"],
    ["tenant-b-token", "tenant-b"],
  ]);
  const isolatedAdmin = {
    apps: [{}],
    auth() {
      return {
        async verifyIdToken(token) {
          const uid = tokenToUid.get(token);
          if (!uid) throw new Error("invalid test token");
          return { uid };
        },
      };
    },
  };
  const handler = createAeoHandler({
    adminClient: isolatedAdmin,
    envProvider: () => enabledEnv(),
    rateLimit: async (_admin, userKey, action, limit) => {
      observedUserKeys.push(userKey);
      assert.equal(action, "aeo-generation");
      assert.equal(limit, 3);
    },
    fetchImpl: async () => providerResponse(validContent),
  });

  for (const token of ["tenant-a-token", "tenant-b-token"]) {
    const response = createResponse();
    await handler(createRequest({
      authorization: "Bearer " + token,
      body: { keyword: "topic", count: 2 },
    }), response);
    assert.equal(response.statusCode, 200);
    assertNoStore(response);
  }

  assert.deepEqual(observedUserKeys, ["uid:tenant-a", "uid:tenant-b"]);
  assert.equal(new Set(observedUserKeys).size, 2);
}

// A failed rate-limit backend must fail closed and never call the provider.
{
  let fetchCalls = 0;
  const response = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => { throw new Error("Firestore unavailable"); },
    fetchImpl: async () => { fetchCalls += 1; return providerResponse(validContent); },
  })(createRequest(), response);

  assert.equal(response.statusCode, 503);
  assertNoStore(response);
  assert.equal(response.body.success, false);
  assert.equal(fetchCalls, 0);
}

// Successful requests send only the provider key upstream and return validated plain-text pairs.
{
  let captured;
  let rateArgs;
  const response = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async (...args) => { rateArgs = args.slice(1); },
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return providerResponse(validContent);
    },
  })(createRequest({ body: { keyword: "real estate lead qualification", count: 2 } }), response);

  assert.equal(response.statusCode, 200);
  assertNoStore(response);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.qaPairs.length, 2);
  assert.deepEqual(rateArgs, ["uid:tenant-user", "aeo-generation", 3]);
  assert.equal(captured.url, "https://opencode.ai/zen/v1/chat/completions");
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.headers.Authorization, "Bearer unit-test-provider-key");
  assert.equal(JSON.parse(captured.options.body).model, "deepseek-v4-flash-free");
  assert.equal(response.body.data.keyword, "real estate lead qualification");
  assert.equal(JSON.stringify(response.body).includes("unit-test-provider-key"), false);
}

// A provider response shorter than the requested count must not be reported as a successful partial result.
{
  const response = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => providerResponse(JSON.stringify([
      { question: "Only one question", answer: "Only one answer." },
    ])),
  })(createRequest({ body: { keyword: "topic", count: 2 } }), response);

  assert.equal(response.statusCode, 502);
  assertNoStore(response);
  assert.deepEqual(response.body, {
    success: false,
    message: "AEO provider returned an invalid response.",
  });
}

// Provider failures, malformed JSON and timeouts return sanitized errors only.
{
  const failure = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => ({ ok: false, async text() { return "provider-secret-response"; } }),
  })(createRequest(), failure);
  assert.equal(failure.statusCode, 502);
  assertNoStore(failure);
  assert.equal(JSON.stringify(failure.body).includes("provider-secret-response"), false);

  const invalid = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => providerResponse("not-json"),
  })(createRequest(), invalid);
  assert.equal(invalid.statusCode, 502);
  assertNoStore(invalid);

  // A provider response-body parsing failure must not expose upstream details.
  const unreadableBody = createResponse();
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => ({
      ok: true,
      async json() {
        throw new Error("provider-secret-response-body");
      },
    }),
  })(createRequest(), unreadableBody);
  assert.equal(unreadableBody.statusCode, 502);
  assertNoStore(unreadableBody);
  assert.equal(JSON.stringify(unreadableBody.body).includes("provider-secret-response-body"), false);

  const timeout = createResponse();
  let abortTimer;
  let timeoutCleared = false;
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    setTimeoutImpl: (callback) => { abortTimer = callback; return "test-timer"; },
    clearTimeoutImpl: (timer) => { assert.equal(timer, "test-timer"); timeoutCleared = true; },
    fetchImpl: async (_url, options) => {
      abortTimer();
      assert.equal(options.signal.aborted, true);
      const error = new Error("timeout");
      error.name = "AbortError";
      throw error;
    },
  })(createRequest(), timeout);
  assert.equal(timeout.statusCode, 504);
  assertNoStore(timeout);
  assert.equal(timeoutCleared, true);
}

assert.deepEqual(parseAeoPairs(validContent, 1), [
  { question: "How does AI qualify property leads?", answer: "It scores inquiries using agreed fit and intent criteria." },
]);
assert.deepEqual(parseAeoPairs("```json\n" + validContent + "\n```", 1), [
  { question: "How does AI qualify property leads?", answer: "It scores inquiries using agreed fit and intent criteria." },
]);
assert.throws(() => parseAeoPairs("not-json", 2), SyntaxError);
assert.throws(() => parseAeoPairs(JSON.stringify([{ question: "Missing answer" }]), 1), TypeError);
assert.throws(
  () => parseAeoPairs(JSON.stringify([{ question: "Only one question", answer: "Only one answer." }]), 2),
  TypeError,
);

// Exercise the real Firestore-backed limiter, not only the AEO handler's injected stub.
{
  const records = new Map();
  const database = {
    collection(name) {
      return {
        doc(id) {
          return { path: name + "/" + id };
        },
      };
    },
    async runTransaction(callback) {
      return callback({
        async get(ref) {
          const data = records.get(ref.path);
          return { exists: data !== undefined, data: () => data };
        },
        set(ref, value) {
          records.set(ref.path, { ...value });
        },
      });
    },
  };
  const fakeAdmin = { firestore: () => database };

  assert.equal(await checkRateLimit(fakeAdmin, "uid:tenant-a", "aeo-generation", 3), true);
  assert.equal(await checkRateLimit(fakeAdmin, "uid:tenant-a", "aeo-generation", 3), true);
  assert.equal(await checkRateLimit(fakeAdmin, "uid:tenant-a", "aeo-generation", 3), true);
  await assert.rejects(
    () => checkRateLimit(fakeAdmin, "uid:tenant-a", "aeo-generation", 3),
    (error) => error.status === 429 && error.retryAfter >= 1 && error.retryAfter <= 60,
  );

  // A different verified UID receives an independent counter.
  assert.equal(await checkRateLimit(fakeAdmin, "uid:tenant-b", "aeo-generation", 3), true);
  assert.equal(records.get("rate_limits/uid:tenant-a_aeo-generation").count, 3);
  assert.equal(records.get("rate_limits/uid:tenant-b_aeo-generation").count, 1);
}

// If the Firestore limiter is unavailable, the real helper must return 503 rather than allow.
{
  const unavailableAdmin = {
    firestore() {
      throw new Error("test-only Firestore unavailable");
    },
  };
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await assert.rejects(
      () => checkRateLimit(unavailableAdmin, "uid:tenant-a", "aeo-generation", 3),
      (error) => error.status === 503,
    );
  } finally {
    console.error = originalConsoleError;
  }
}

console.log("AEO API and real Firestore rate-limit regression tests passed.");
