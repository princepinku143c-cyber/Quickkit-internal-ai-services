import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import handler from "../api/outreach.js";

const outreachSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
assert.doesNotMatch(outreachSource, /console\.(?:error|warn)\([^;\n]*,\s*(?:err|error|e|apiErr)\s*\);/);
assert.doesNotMatch(outreachSource, /console\.(?:error|warn)\([^;\n]*\.message/);
assert.doesNotMatch(outreachSource, /\$\{(?:err|error|e|apiErr)\.message\}/);
assert.doesNotMatch(outreachSource, /error:\s*(?:err|e)\.message/);

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

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalCronSecret = process.env.CRON_SECRET;
const originalConsoleError = console.error;

try {
  delete process.env.CRON_SECRET;
  let authCalls = 0;
  let firestoreCalls = 0;
  admin.auth = () => ({
    verifyIdToken: async () => {
      authCalls += 1;
      throw new Error("No Firebase token should be accepted in this test.");
    },
  });
  admin.firestore = () => {
    firestoreCalls += 1;
    throw new Error("Unauthorized requests must not access Firestore.");
  };

  const getResponse = mockResponse();
  await handler({
    method: "GET",
    query: { action: "process-queue" },
    headers: { "x-vercel-cron": "1" },
  }, getResponse);
  assert.equal(getResponse.statusCode, 405);
  assert.equal(getResponse.headers.Allow, "POST, OPTIONS");
  assert.equal(getResponse.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");

  const spoofedCronResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { "x-vercel-cron": "1" },
  }, spoofedCronResponse);
  assert.equal(spoofedCronResponse.statusCode, 403);
  assert.equal(authCalls, 0);
  assert.equal(firestoreCalls, 0);

  process.env.CRON_SECRET = "short-secret";
  const shortSecretResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer short-secret", "x-vercel-cron": "1" },
  }, shortSecretResponse);
  assert.equal(shortSecretResponse.statusCode, 403);
  assert.equal(firestoreCalls, 0);

  // Firebase token verifier diagnostics must never be copied into server logs.
  const capturedAuthErrors = [];
  console.error = (...args) => capturedAuthErrors.push(args);
  const authDiagnostic = "sensitive-firebase-verifier-diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => { throw new Error(authDiagnostic); },
  });
  const invalidTokenResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer invalid-token" },
  }, invalidTokenResponse);
  assert.equal(invalidTokenResponse.statusCode, 403);
  assert.equal(firestoreCalls, 0);
  assert.deepEqual(capturedAuthErrors, [["OUTREACH_AUTH_FAILED"]]);
  assert.doesNotMatch(JSON.stringify(capturedAuthErrors), /sensitive-firebase-verifier-diagnostic/);
  console.error = originalConsoleError;

  process.env.CRON_SECRET = "test-cron-secret-with-at-least-thirty-two-characters";
  admin.auth = () => {
    throw new Error("A valid cron secret must not be treated as a Firebase ID token.");
  };
  admin.firestore = () => ({
    collection(name) {
      assert.equal(name, "settings");
      return {
        doc(id) {
          assert.equal(id, "telegram");
          return {
            get: async () => ({
              exists: true,
              data: () => ({ paused: true }),
            }),
          };
        },
      };
    },
  });

  const validCronResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET}`,
      "x-vercel-cron": "1",
    },
  }, validCronResponse);
  assert.equal(validCronResponse.statusCode, 200);
  assert.equal(validCronResponse.body.status, "PAUSED");

  const originalCronAuth = admin.auth;
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-admin-token");
      return { uid: "admin-1" };
    },
  });
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return {
          doc(uid) {
            assert.equal(uid, "admin-1");
            return { get: async () => ({ data: () => ({ role: "admin" }) }) };
          },
        };
      }
      assert.equal(name, "settings");
      return {
        doc: () => ({
          get: async () => ({ exists: true, data: () => ({ paused: true }) }),
        }),
      };
    },
  });

  const adminResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer valid-admin-token" },
  }, adminResponse);
  assert.equal(adminResponse.statusCode, 200);
  assert.equal(adminResponse.body.status, "PAUSED");

  // Internal service diagnostics must not be returned to callers or copied into logs.
  const capturedErrors = [];
  console.error = (...args) => capturedErrors.push(args);
  process.env.CRON_SECRET = "test-cron-secret-with-at-least-thirty-two-characters";
  admin.firestore = () => {
    throw new Error("sensitive database connection detail");
  };
  const internalFailureResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }, internalFailureResponse);
  assert.equal(internalFailureResponse.statusCode, 500);
  assert.deepEqual(internalFailureResponse.body, { error: "Internal server error." });
  assert.doesNotMatch(JSON.stringify(capturedErrors), /sensitive database connection detail/);
  console.error = originalConsoleError;

  console.log("Outreach authorization tests passed: POST-only routing, spoofed cron-header denial, strong CRON_SECRET requirement, and admin access.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalCronSecret;
}
