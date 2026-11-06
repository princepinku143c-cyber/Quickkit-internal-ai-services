import assert from "node:assert/strict";
import handler from "../api/user-provision.js";

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

const getResponse = mockResponse();
await handler({ method: "GET", headers: {} }, getResponse);
assert.equal(getResponse.statusCode, 405);
assert.equal(getResponse.headers.Allow, "POST, OPTIONS");

const optionsResponse = mockResponse();
await handler({ method: "OPTIONS", headers: {} }, optionsResponse);
assert.equal(optionsResponse.statusCode, 204);
assert.equal(optionsResponse.ended, true);

const unauthenticatedResponse = mockResponse();
await handler({ method: "POST", headers: {}, body: {} }, unauthenticatedResponse);
assert.equal(unauthenticatedResponse.statusCode, 401);
assert.equal(unauthenticatedResponse.body.success, false);

console.log("User provisioning tests passed: method guard, preflight, and unauthenticated access denial.");
