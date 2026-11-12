import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import leadSubmitHandler from "../api/lead-submit.js";

const webhookSource = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
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
  };
}

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
