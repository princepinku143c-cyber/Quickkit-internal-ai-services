import assert from "node:assert/strict";
import handler from "../api/aeo-generate.js";
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
console.log("AEO endpoint tests passed: method guard, preflight, unauthenticated access denial and payload validation.");
