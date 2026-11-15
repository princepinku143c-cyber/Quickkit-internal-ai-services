import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import handler from "../api/rank-tracker.js";

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
const originalSetTimeout = globalThis.setTimeout;

try {
  const source = await readFile(new URL("../api/rank-tracker.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /tvly-[A-Za-z0-9]/, "provider credentials must not be hardcoded");

  let fetchCalls = 0;
  delete process.env.TAVILY_API_KEY;
  globalThis.fetch = async () => { fetchCalls += 1; throw new Error("unexpected network call"); };
  const missingKeyResponse = createResponse();
  await handler({ method: "GET" }, missingKeyResponse);
  assert.equal(missingKeyResponse.statusCode, 503);
  assert.equal(fetchCalls, 0, "missing configuration must fail before network access");

  const methodResponse = createResponse();
  await handler({ method: "POST" }, methodResponse);
  assert.equal(methodResponse.statusCode, 405);

  const optionsResponse = createResponse();
  await handler({ method: "OPTIONS" }, optionsResponse);
  assert.equal(optionsResponse.statusCode, 204);
  assert.equal(optionsResponse.ended, true);

  process.env.TAVILY_API_KEY = "unit-test-only-key";
  globalThis.setTimeout = (callback) => { callback(); return 0; };
  globalThis.fetch = async (url, options) => {
    fetchCalls += 1;
    assert.equal(url, "https://api.tavily.com/search");
    assert.equal(options.method, "POST");
    assert.equal(JSON.parse(options.body).api_key, "unit-test-only-key");
    return {
      ok: true,
      json: async () => ({ results: [
        { url: "https://example.com/" },
        { url: "https://quickkitai.com/visibility" },
      ] }),
    };
  };
  fetchCalls = 0;
  const successResponse = createResponse();
  await handler({ method: "GET" }, successResponse);
  assert.equal(successResponse.statusCode, 200);
  assert.equal(fetchCalls, 10);
  assert.equal(successResponse.body.summary.total, 10);
  assert.equal(successResponse.body.summary.found, 10);
  assert.equal(successResponse.body.results[0].rank, 2);

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: "unit-test-provider-response-must-not-leak" }),
  });
  const providerFailureResponse = createResponse();
  await handler({ method: "GET" }, providerFailureResponse);
  assert.equal(providerFailureResponse.statusCode, 200);
  assert.ok(providerFailureResponse.body.results.every((item) => item.error === "Search provider request failed"));
  assert.ok(!JSON.stringify(providerFailureResponse.body).includes("unit-test-provider-response-must-not-leak"));

  globalThis.fetch = async () => { throw new Error("unit-test-network-detail-must-not-leak"); };
  const networkFailureResponse = createResponse();
  await handler({ method: "GET" }, networkFailureResponse);
  assert.ok(networkFailureResponse.body.results.every((item) => item.error === "Search request failed"));
  assert.ok(!JSON.stringify(networkFailureResponse.body).includes("unit-test-network-detail-must-not-leak"));

  console.log("Rank tracker credential and provider-error regression tests passed.");
} finally {
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
}
