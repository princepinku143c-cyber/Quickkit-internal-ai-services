import assert from "node:assert/strict";
import handler from "../api/rank-tracker.js";

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
}

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalKey = process.env.TAVILY_API_KEY;

try {
  delete process.env.TAVILY_API_KEY;
  let response = mockResponse();
  await handler({ method: "GET" }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, "TAVILY_API_KEY_MISSING");

  response = mockResponse();
  await handler({ method: "POST" }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET");

  process.env.TAVILY_API_KEY = "test-only-key";
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
  await handler({ method: "GET" }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(calls, 10);
  assert.equal(response.body.summary.total, 10);
  assert.equal(response.body.summary.found, 10);
  assert.equal(response.body.summary.errors, 0);
  assert.equal(response.body.results[0].rank, 2);
  assert.equal(response.headers["Cache-Control"], "no-store");

  console.log("Rank tracker tests passed: method guard, missing-key fail-closed, env-key usage, ranking summary.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
}
