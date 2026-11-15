import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import leadSubmitHandler from "../api/lead-submit.js";
import webhookHandler, { matchesWebhookSecret } from "../api/webhook.js";

const webhookSource = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
assert.match(webhookSource, /createHash\("sha256"\)/);
assert.match(webhookSource, /timingSafeEqual/);
assert.doesNotMatch(webhookSource, /expectedBytes\.length\s*!==\s*suppliedBytes\.length/);

const webhookErrorLogLines = webhookSource
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.includes("console.error("));

assert.deepEqual(
  webhookErrorLogLines.sort(),
  [
    'console.error("WEBHOOK_AI_DRAFT_FAILED");',
    'console.error("WEBHOOK_ODOO_AUTH_FAILED");',
    'console.error("WEBHOOK_ODOO_SYNC_FAILED");',
    'console.error("WEBHOOK_PROCESSING_FAILED");',
  ].sort(),
  "Webhook error logs must use fixed event labels and must not serialize exception details."
);

const leadSubmitSource = readFileSync(new URL("../api/lead-submit.js", import.meta.url), "utf8");
const leadSubmitErrorLogLines = leadSubmitSource
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.includes("console.error("));

assert.deepEqual(
  leadSubmitErrorLogLines,
  ["console.error('LEAD_SUBMIT_FAILED');"],
  "Public lead submission must not log raw Firebase, Firestore, or SMTP exception details."
);

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

function assertPrivateNoStore(response) {
  assert.equal(response.headers["Cache-Control"], "private, no-store");
  assert.equal(response.headers.Vary, "X-Webhook-Secret");
}

function assertNoStore(response) {
  assert.equal(response.headers["Cache-Control"], "private, no-store");
}

// OPTIONS and rejected methods must also carry credential-scoped cache protections.
const webhookPreflight = mockResponse();
await webhookHandler({ method: "OPTIONS", headers: {} }, webhookPreflight);
assert.equal(webhookPreflight.statusCode, 200);
assertPrivateNoStore(webhookPreflight);

const webhookMethodFailure = mockResponse();
await webhookHandler({ method: "GET", headers: {} }, webhookMethodFailure);
assert.equal(webhookMethodFailure.statusCode, 405);
assertPrivateNoStore(webhookMethodFailure);

// Public lead intake contains contact details; OPTIONS, rejected methods, and failures must not be cached.
const leadSubmitPreflight = mockResponse();
await leadSubmitHandler({ method: "OPTIONS", headers: {} }, leadSubmitPreflight);
assert.equal(leadSubmitPreflight.statusCode, 204);
assertNoStore(leadSubmitPreflight);

const leadSubmitMethodFailure = mockResponse();
await leadSubmitHandler({ method: "GET", headers: {} }, leadSubmitMethodFailure);
assert.equal(leadSubmitMethodFailure.statusCode, 405);
assertNoStore(leadSubmitMethodFailure);

// Webhook credentials are compared through fixed-length SHA-256 digests.
// This keeps the comparison independent of the supplied/stored secret lengths.
const validWebhookSecret = "webhook-test-secret-with-at-least-thirty-two-characters";
assert.equal(matchesWebhookSecret(validWebhookSecret, validWebhookSecret), true);
assert.equal(matchesWebhookSecret(validWebhookSecret, "x".repeat(validWebhookSecret.length)), false);
assert.equal(matchesWebhookSecret(validWebhookSecret, "different-length-secret"), false);
assert.equal(matchesWebhookSecret(validWebhookSecret, "x".repeat(257)), false);
assert.equal(matchesWebhookSecret("x".repeat(257), "x".repeat(257)), false);
assert.equal(matchesWebhookSecret("", validWebhookSecret), false);
assert.equal(matchesWebhookSecret(validWebhookSecret, ""), false);
assert.equal(matchesWebhookSecret(null, validWebhookSecret), false);

const originalFirestore = admin.firestore;
const originalConsoleError = console.error;

try {
  const capturedErrors = [];
  admin.firestore = () => ({
    collection(name) {
      if (name === "rate_limits") {
        return { doc: () => ({ id: "rate-limit-test" }) };
      }
      if (name === "leads") {
        return {
          doc: () => ({
            id: "lead-test",
            set: async () => {
              throw new Error("private Firestore write diagnostic");
            },
          }),
        };
      }
      throw new Error("Unexpected test collection.");
    },
    async runTransaction(callback) {
      return callback({
        get: async () => ({
          data: () => ({ count: 0, firstCall: Date.now() }),
        }),
        set: () => {},
      });
    },
  });
  console.error = (...args) => capturedErrors.push(args);

  const response = mockResponse();
  await leadSubmitHandler({
    method: "POST",
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
    body: {
      name: "Test Lead",
      phone: "9876543210",
      email: "lead@example.test",
      businessName: "Example Realty",
      businessType: "Real Estate",
      plan: "AEO",
    },
  }, response);

  assert.equal(response.statusCode, 500);
  assertNoStore(response);
  assert.deepEqual(response.body, {
    error: "Unable to submit the request right now. Please try again or contact admin@quickkitai.com.",
  });
  assert.deepEqual(capturedErrors, [["LEAD_SUBMIT_FAILED"]]);
  assert.equal(JSON.stringify(capturedErrors).includes("private Firestore write diagnostic"), false);
} finally {
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
}

console.log("Webhook and public lead security tests passed: request failures use fixed event labels and preserve generic response contracts.");
