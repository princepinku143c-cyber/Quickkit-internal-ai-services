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

  // Reject oversized Firebase bearer tokens before invoking Admin verification.
  let oversizedTokenVerifyCalls = 0;
  const oversizedToken = createResponse();
  await createAeoHandler({
    adminClient: {
      apps: [{}],
      auth() {
        return {
          async verifyIdToken() {
            oversizedTokenVerifyCalls += 1;
            return { uid: "tenant-user" };
          },
        };
      },
    },
    envProvider: () => enabledEnv(),
    rateLimit: async () => { rateCalls += 1; },
    fetchImpl: async () => { fetchCalls += 1; return providerResponse(validContent); },
  })(createRequest({ authorization: "Bearer " + "x".repeat(8193) }), oversizedToken);
  assert.equal(oversizedToken.statusCode, 401);
  assertNoStore(oversizedToken);
  assert.equal(oversizedTokenVerifyCalls, 0, "Oversized bearer tokens must be rejected before Firebase Admin verification.");

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
  let failureBodyCancelled = false;
  let failureBodyRead = false;
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => ({
      ok: false,
      body: {
        cancel() {
          failureBodyCancelled = true;
          return Promise.reject(new Error("provider cancellation failure"));
        },
      },
      async text() {
        failureBodyRead = true;
        return "provider-secret-response";
      },
    }),
  })(createRequest(), failure);
  assert.equal(failure.statusCode, 502);
  assertNoStore(failure);
  assert.equal(JSON.stringify(failure.body).includes("provider-secret-response"), false);
  assert.equal(failureBodyCancelled, true, "non-OK provider response bodies must be cancelled");
  assert.equal(failureBodyRead, false, "non-OK provider response bodies must not be consumed");

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

// Provider bodies are bounded even when the upstream omits Content-Length.
{
  const oversized = createResponse();
  let readCalls = 0;
  let readerCancelled = false;
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => ({
      ok: true,
      headers: { get: () => null },
      body: {
        getReader() {
          return {
            async read() {
              readCalls += 1;
              return { done: false, value: new Uint8Array(64 * 1024 + 1) };
            },
            async cancel() { readerCancelled = true; },
            releaseLock() {},
          };
        },
      },
    }),
  })(createRequest(), oversized);
  assert.equal(oversized.statusCode, 502);
  assertNoStore(oversized);
  assert.equal(readCalls, 1, "the oversized stream must stop at the first over-limit chunk");
  assert.equal(readerCancelled, true, "the oversized provider stream must be cancelled");
}

{
  const oversizedByHeader = createResponse();
  let bodyRead = false;
  let bodyCancelled = false;
  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    fetchImpl: async () => ({
      ok: true,
      headers: { get: (name) => name === "content-length" ? String(64 * 1024 + 1) : null },
      body: {
        async cancel() {
          bodyCancelled = true;
        },
        getReader() {
          bodyRead = true;
          throw new Error("body must not be read after an oversized Content-Length");
        },
      },
    }),
  })(createRequest(), oversizedByHeader);
  assert.equal(oversizedByHeader.statusCode, 502);
  assertNoStore(oversizedByHeader);
  assert.equal(bodyRead, false, "an oversized Content-Length must be rejected before reading the body");
  assert.equal(bodyCancelled, true, "an oversized Content-Length must cancel the unread provider body");
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
  () => parseAeoPairs(JSON.stringify([{ question: 42, answer: "Numeric question must be rejected." }]), 1),
  TypeError,
);
assert.throws(
  () => parseAeoPairs(JSON.stringify([{ question: "Boolean answer must be rejected.", answer: true }]), 1),
  TypeError,
);
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

// The provider timeout must remain active while the response body is parsed.
{
  const response = createResponse();
  let abortTimer;
  let timeoutCleared = false;
  let bodyParseStarted = false;
  let providerSignal;

  await createAeoHandler({
    adminClient: createAdmin(),
    envProvider: () => enabledEnv(),
    rateLimit: async () => {},
    setTimeoutImpl: (callback) => {
      abortTimer = callback;
      return "body-parse-timer";
    },
    clearTimeoutImpl: (timer) => {
      assert.equal(timer, "body-parse-timer");
      timeoutCleared = true;
    },
    fetchImpl: async (_url, options) => {
      providerSignal = options.signal;
      return {
        ok: true,
        async json() {
          bodyParseStarted = true;
          assert.equal(timeoutCleared, false, "timeout must remain armed during response-body parsing");
          abortTimer();
          assert.equal(providerSignal.aborted, true);
          const error = new Error("timeout while parsing provider body");
          error.name = "AbortError";
          throw error;
        },
      };
    },
  })(createRequest(), response);

  assert.equal(response.statusCode, 504);
  assertNoStore(response);
  assert.equal(bodyParseStarted, true);
  assert.equal(providerSignal.aborted, true);
  assert.equal(timeoutCleared, true);
}

// Corrupt persisted rate-limit state must fail closed instead of resetting the bucket.
{
  const now = Date.now();
  const corruptCases = [
    ["negative-count", { count: -1, firstCall: now }],
    ["fractional-count", { count: 1.5, firstCall: now }],
    ["string-count", { count: "3", firstCall: now }],
    ["missing-count", { firstCall: now }],
    ["missing-first-call", { count: 3 }],
    ["invalid-first-call", { count: 3, firstCall: "not-a-timestamp" }],
    ["negative-first-call", { count: 3, firstCall: -1 }],
  ];
  const records = new Map(corruptCases.map(([key, value]) => [
    `rate_limits/uid:corrupt-${key}_aeo-generation`,
    { ...value },
  ]));
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
  const corruptAdmin = { firestore: () => database };
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    for (const [key, value] of corruptCases) {
      const path = `rate_limits/uid:corrupt-${key}_aeo-generation`;
      const before = { ...value };
      await assert.rejects(
        () => checkRateLimit(corruptAdmin, `uid:corrupt-${key}`, "aeo-generation", 3),
        (error) => error.status === 503,
      );
      assert.deepEqual(records.get(path), before, `corrupt bucket ${key} must not be reset or overwritten`);
    }

    await assert.rejects(
      () => checkRateLimit(corruptAdmin, "uid:invalid-limit", "aeo-generation", 0),
      (error) => error.status === 503,
    );
  } finally {
    console.error = originalConsoleError;
  }
}

console.log("AEO API and real Firestore rate-limit regression tests passed.");
