import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRankTrackerHandler, fetchTavilyJsonWithTimeout, isQuickKitResultUrl } from "../api/rank-tracker.js";

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

const originalKey = process.env.TAVILY_API_KEY;
const originalFetch = globalThis.fetch;
const adminClient = { testAdminClient: true };
const createHandler = (rateLimit = async () => true, sleep = async () => {}) => createRankTrackerHandler({
  adminClient,
  rateLimit,
  resolveClientIp: (req) => req.clientIp || "203.0.113.10",
  sleep,
});

try {
  const source = await readFile(new URL("../api/rank-tracker.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\\btvly-[A-Za-z0-9_-]+/i, "provider credentials must not be hardcoded");

  // Scan every tracked API source file, not only the rank-tracker handler, so
  // provider credentials cannot be reintroduced in a different route/helper.
  const isApiSourceFile = (path) => /^api\/.*\.(?:[cm]?[jt]sx?)$/i.test(path);
  assert.ok(
    ["api/example.jsx", "api/example.cts", "api/example.mts"].every(isApiSourceFile),
    "the API credential scan must include JSX and Node/TypeScript module extensions",
  );
  const apiSourcePaths = execFileSync("git", ["ls-files", "-z", "--", "api"], {
    encoding: "utf8",
  })
    .split("\0")
.filter(isApiSourceFile);
  assert.ok(apiSourcePaths.includes("api/rank-tracker.js"), "rank tracker source must be included in the API credential scan");
  for (const path of apiSourcePaths) {
    const apiSource = await readFile(path, "utf8");
    assert.doesNotMatch(
      apiSource,
      /\btvly-[A-Za-z0-9_-]+/i,
      `Tavily credentials must not be hardcoded in API source (${path})`,
    );
  }
  assert.match(source, /process\.env\.TAVILY_API_KEY/, "rank tracker must read its provider key from the server environment");

  assert.equal(isQuickKitResultUrl("https://quickkitai.com/visibility"), true);
  assert.equal(isQuickKitResultUrl("https://quickkitai.com./visibility"), true);
  assert.equal(isQuickKitResultUrl("https://www.quickkitai.com/visibility"), true);
  assert.equal(isQuickKitResultUrl("https://agents.quickkitai.com/visibility"), true);
  assert.equal(isQuickKitResultUrl("http://quickkitai.com/visibility"), true);
  assert.equal(isQuickKitResultUrl("https://quickkitai.com.evil.example/"), false);
  assert.equal(isQuickKitResultUrl("https://evil.example/?next=https://quickkitai.com"), false);
  assert.equal(isQuickKitResultUrl("https://quickkitai.com@evil.example/"), false);
  assert.equal(isQuickKitResultUrl("https://notquickkitai.com/"), false);
  assert.equal(isQuickKitResultUrl("javascript://quickkitai.com/"), false);
  assert.equal(isQuickKitResultUrl("not-a-url"), false);
  assert.equal(isQuickKitResultUrl({ url: "https://quickkitai.com/" }), false);

  const bodyTimeoutError = await fetchTavilyJsonWithTimeout("https://api.tavily.com/search", {}, {
    timeoutMs: 10,
    fetchImpl: async (_url, options) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
      }),
    }),
  }).then(() => null, (error) => error);
  assert.equal(
    bodyTimeoutError?.message,
    "Search provider request timed out.",
    "the provider deadline must remain active while the JSON response body is being read",
  );

  let fetchCalls = 0;
  let rateLimitCalls = 0;
  delete process.env.TAVILY_API_KEY;
  globalThis.fetch = async () => { fetchCalls += 1; throw new Error("unexpected network call"); };
  const missingKeyResponse = createResponse();
  await createHandler(async () => { rateLimitCalls += 1; })({ method: "GET" }, missingKeyResponse);
  assert.equal(missingKeyResponse.statusCode, 503);
  assert.equal(fetchCalls, 0, "missing configuration must fail before network access");
  assert.equal(rateLimitCalls, 0, "missing configuration must not write a rate-limit record");

  const methodResponse = createResponse();
  await createHandler()({ method: "POST" }, methodResponse);
  assert.equal(methodResponse.statusCode, 405);

  const optionsResponse = createResponse();
  await createHandler()({ method: "OPTIONS" }, optionsResponse);
  assert.equal(optionsResponse.statusCode, 204);
  assert.equal(optionsResponse.ended, true);

  process.env.TAVILY_API_KEY = "unit-test-only-key";
  const limiterArgs = [];
  const sleepCalls = [];
  const successHandler = createHandler(
    async (...args) => { limiterArgs.push(args); },
    async (ms) => { sleepCalls.push(ms); },
  );
  globalThis.fetch = async (url, options) => {
    fetchCalls += 1;
    assert.equal(url, "https://api.tavily.com/search");
    assert.equal(options.method, "POST");
    assert.ok(options.signal instanceof AbortSignal, "provider requests must carry an abort signal");
    assert.equal(JSON.parse(options.body).api_key, "unit-test-only-key");
    return {
      ok: true,
      json: async () => ({ results: [
        { url: "https://quickkitai.com.evil.example/visibility" },
        { url: "https://evil.example/?next=https://quickkitai.com" },
        { url: "https://quickkitai.com/visibility" },
      ] }),
    };
  };
  fetchCalls = 0;
  const successResponse = createResponse();
  await successHandler({ method: "GET", clientIp: "203.0.113.25" }, successResponse);
  assert.equal(successResponse.statusCode, 200);
  assert.equal(fetchCalls, 10);
  assert.equal(successResponse.body.summary.total, 10);
  assert.equal(successResponse.body.summary.found, 10);
  assert.equal(successResponse.body.results[0].rank, 3, "lookalike hosts and URL text must not count as QuickKitAI results");
  assert.equal(limiterArgs.length, 1, "each full scan must be rate-limited once");
  assert.equal(limiterArgs[0][0], adminClient);
  assert.equal(limiterArgs[0][1], "203.0.113.25");
  assert.equal(limiterArgs[0][2], "rank-tracker");
  assert.equal(limiterArgs[0][3], 2, "allow at most two full scans per IP per minute");
  assert.equal(sleepCalls.length, 9, "provider pacing should occur only between keywords, not after the final request");
  assert.ok(sleepCalls.every((ms) => ms === 1500), "inter-keyword pacing must remain 1.5 seconds");

  fetchCalls = 0;
  const deniedError = Object.assign(new Error("internal limiter details"), { status: 429, retryAfter: 37 });
  const rateLimitedResponse = createResponse();
  await createHandler(async () => { throw deniedError; })({ method: "GET" }, rateLimitedResponse);
  assert.equal(rateLimitedResponse.statusCode, 429);
  assert.equal(rateLimitedResponse.headers["Retry-After"], "37");
  assert.equal(fetchCalls, 0, "rate-limited requests must not call the search provider");
  assert.ok(!JSON.stringify(rateLimitedResponse.body).includes("internal limiter details"));

  const unavailableResponse = createResponse();
  await createHandler(async () => { throw new Error("internal Firestore details"); })({ method: "GET" }, unavailableResponse);
  assert.equal(unavailableResponse.statusCode, 503);
  assert.ok(!JSON.stringify(unavailableResponse.body).includes("internal Firestore details"));
  assert.equal(fetchCalls, 0, "limiter backend failures must fail closed before provider access");

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: "unit-test-provider-response-must-not-leak" }),
  });
  const providerFailureResponse = createResponse();
  await successHandler({ method: "GET" }, providerFailureResponse);
  assert.equal(providerFailureResponse.statusCode, 200);
  assert.ok(providerFailureResponse.body.results.every((item) => item.error === "Search provider request failed"));
  assert.ok(!JSON.stringify(providerFailureResponse.body).includes("unit-test-provider-response-must-not-leak"));

  globalThis.fetch = async () => { throw new Error("unit-test-network-detail-must-not-leak"); };
  const networkFailureResponse = createResponse();
  await successHandler({ method: "GET" }, networkFailureResponse);
  assert.ok(networkFailureResponse.body.results.every((item) => item.error === "Search request failed"));
  assert.ok(!JSON.stringify(networkFailureResponse.body).includes("unit-test-network-detail-must-not-leak"));

  console.log("Rank tracker rate-limit, credential and provider-error regression tests passed.");
} finally {
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
  globalThis.fetch = originalFetch;
}
