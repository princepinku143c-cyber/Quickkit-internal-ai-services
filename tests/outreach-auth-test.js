import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import handler, { checkMxRecords } from "../api/outreach.js";

const outreachSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
assert.doesNotMatch(outreachSource, /console\.(?:error|warn)\([^;\n]*,\s*(?:err|error|e|apiErr)\s*\);/);
assert.doesNotMatch(outreachSource, /console\.(?:error|warn)\([^;\n]*\.message/);
assert.doesNotMatch(outreachSource, /\$\{(?:err|error|e|apiErr)\.message\}/);
assert.doesNotMatch(outreachSource, /error:\s*(?:err|e)\.message/);
assert.doesNotMatch(outreachSource, /Bypassing checks/);
assert.match(outreachSource, /timingSafeEqual/);
assert.match(outreachSource, /createHash\("sha256"\)/);

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

function assertPrivateNoStore(response) {
  assert.equal(response.headers["Cache-Control"], "private, no-store");
  assert.equal(response.headers.Vary, "Authorization, X-Telegram-Bot-Api-Secret-Token");
}

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalCronSecret = process.env.CRON_SECRET;
const originalTelegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
const originalTelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

try {
  // Telegram's native secret-token header is preferred. Once a dedicated secret
  // exists, query-string credentials (including the bot token) must be rejected.
  const testTelegramSecret = "test-webhook-secret-with-at-least-thirty-two-characters";
  process.env.TELEGRAM_WEBHOOK_SECRET = testTelegramSecret;
  process.env.TELEGRAM_BOT_TOKEN = "test-telegram-bot-token";

  const telegramHeaderResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook" },
    headers: { "x-telegram-bot-api-secret-token": testTelegramSecret },
    body: {},
  }, telegramHeaderResponse);
  assert.equal(telegramHeaderResponse.statusCode, 200);
  assertPrivateNoStore(telegramHeaderResponse);
  assert.deepEqual(telegramHeaderResponse.body, { ok: true });

  const telegramQueryResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook", secret: process.env.TELEGRAM_BOT_TOKEN },
    headers: {},
    body: {},
  }, telegramQueryResponse);
  assert.equal(telegramQueryResponse.statusCode, 403);
  assertPrivateNoStore(telegramQueryResponse);

  const telegramWrongHeaderResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook" },
    headers: { "x-telegram-bot-api-secret-token": "wrong-secret" },
    body: {},
  }, telegramWrongHeaderResponse);
  assert.equal(telegramWrongHeaderResponse.statusCode, 403);

  const telegramSameLengthWrongHeaderResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook" },
    headers: { "x-telegram-bot-api-secret-token": "x".repeat(testTelegramSecret.length) },
    body: {},
  }, telegramSameLengthWrongHeaderResponse);
  assert.equal(telegramSameLengthWrongHeaderResponse.statusCode, 403);

  const telegramOversizedHeaderResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook" },
    headers: { "x-telegram-bot-api-secret-token": "x".repeat(257) },
    body: {},
  }, telegramOversizedHeaderResponse);
  assert.equal(telegramOversizedHeaderResponse.statusCode, 403);

  // Keep the old bot-token query route working until a dedicated webhook secret
  // is configured in the deployment and Telegram webhook settings are migrated.
  delete process.env.TELEGRAM_WEBHOOK_SECRET;
  const telegramLegacyResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "telegram-webhook", secret: process.env.TELEGRAM_BOT_TOKEN },
    headers: {},
    body: {},
  }, telegramLegacyResponse);
  assert.equal(telegramLegacyResponse.statusCode, 200);
  assert.deepEqual(telegramLegacyResponse.body, { ok: true });

  delete process.env.CRON_SECRET;
  let authCalls = 0;
  let firestoreCalls = 0;
  admin.auth = () => ({
    verifyIdToken: async () => {
      authCalls += 1;
      const invalidTokenError = new Error("No Firebase token should be accepted in this test.");
      invalidTokenError.code = "auth/invalid-id-token";
      throw invalidTokenError;
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
  assertPrivateNoStore(getResponse);
  assert.equal(getResponse.headers.Allow, "POST, OPTIONS");
  assert.equal(getResponse.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");

  const spoofedCronResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { "x-vercel-cron": "1" },
  }, spoofedCronResponse);
  assert.equal(spoofedCronResponse.statusCode, 403);
  assertPrivateNoStore(spoofedCronResponse);
  assert.equal(authCalls, 0);
  assert.equal(firestoreCalls, 0);

  process.env.CRON_SECRET = "short-secret";
  const shortSecretResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer short-secret", "x-vercel-cron": "1" },
  }, shortSecretResponse);
  assert.equal(shortSecretResponse.statusCode, 401);
  assertPrivateNoStore(shortSecretResponse);
  assert.equal(firestoreCalls, 0);

  // Cron bearer secrets are compared through the same fixed-length digest path
  // as Telegram webhook secrets. Same-length mismatches and oversized values
  // must never authorize queue processing.
  const cronSecretForComparison = "test-cron-secret-with-at-least-thirty-two-characters";
  process.env.CRON_SECRET = cronSecretForComparison;
  const sameLengthWrongCronResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: `Bearer ${"x".repeat(cronSecretForComparison.length)}` },
  }, sameLengthWrongCronResponse);
  assert.equal(sameLengthWrongCronResponse.statusCode, 401);
  assertPrivateNoStore(sameLengthWrongCronResponse);
  assert.equal(firestoreCalls, 0);

  process.env.CRON_SECRET = "x".repeat(257);
  const oversizedCronResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: `Bearer ${"x".repeat(257)}` },
  }, oversizedCronResponse);
  assert.equal(oversizedCronResponse.statusCode, 401);
  assertPrivateNoStore(oversizedCronResponse);
  assert.equal(firestoreCalls, 0);

  // Known invalid tokens are authentication failures; verifier outages are service failures.
  const capturedAuthErrors = [];
  const capturedAuthWarnings = [];
  console.error = (...args) => capturedAuthErrors.push(args);
  console.warn = (...args) => capturedAuthWarnings.push(args);

  const authDiagnostic = "sensitive-firebase-verifier-diagnostic";
  const invalidTokenError = new Error(authDiagnostic);
  invalidTokenError.code = "auth/invalid-id-token";
  admin.auth = () => ({
    verifyIdToken: async () => { throw invalidTokenError; },
  });
  const invalidTokenResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer invalid-token" },
  }, invalidTokenResponse);
  assert.equal(invalidTokenResponse.statusCode, 401);
  assertPrivateNoStore(invalidTokenResponse);
  assert.deepEqual(invalidTokenResponse.body, { error: "Authentication failed." });
  assert.equal(firestoreCalls, 0);
  assert.deepEqual(capturedAuthWarnings, [["OUTREACH_AUTH_INVALID"]]);
  assert.deepEqual(capturedAuthErrors, []);
  assert.doesNotMatch(JSON.stringify(capturedAuthWarnings), /sensitive-firebase-verifier-diagnostic/);

  const verifierDiagnostic = "sensitive-firebase-outage-diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => { throw new Error(verifierDiagnostic); },
  });
  const verifierUnavailableResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer token-during-outage" },
  }, verifierUnavailableResponse);
  assert.equal(verifierUnavailableResponse.statusCode, 503);
  assertPrivateNoStore(verifierUnavailableResponse);
  assert.deepEqual(verifierUnavailableResponse.body, {
    error: "Authentication service is temporarily unavailable.",
  });
  assert.equal(firestoreCalls, 0);
  assert.deepEqual(capturedAuthErrors, [["OUTREACH_AUTH_UNAVAILABLE"]]);
  assert.doesNotMatch(JSON.stringify(capturedAuthErrors), /sensitive-firebase-outage-diagnostic/);

  capturedAuthErrors.length = 0;
  const profileDiagnostic = "sensitive-firestore-profile-diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "admin-1" }),
  });
  admin.firestore = () => {
    firestoreCalls += 1;
    throw new Error(profileDiagnostic);
  };
  const profileUnavailableResponse = mockResponse();
  await handler({
    method: "POST",
    query: { action: "process-queue" },
    headers: { authorization: "Bearer valid-token-during-database-outage" },
  }, profileUnavailableResponse);
  assert.equal(profileUnavailableResponse.statusCode, 503);
  assertPrivateNoStore(profileUnavailableResponse);
  assert.deepEqual(profileUnavailableResponse.body, {
    error: "Authorization service is temporarily unavailable.",
  });
  assert.equal(firestoreCalls, 1);
  assert.deepEqual(capturedAuthErrors, [["OUTREACH_PROFILE_LOOKUP_FAILED"]]);
  assert.doesNotMatch(JSON.stringify(capturedAuthErrors), /sensitive-firestore-profile-diagnostic/);

  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

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

  // DNS validation accepts an MX record.
  const mxResolver = {
    resolveMx(_domain, callback) { assert.equal(_domain, "example.test"); callback(null, [{ exchange: "mx.example.test", priority: 10 }]); },
    resolve4() { assert.fail("A lookup is unnecessary when MX exists."); },
  };
  assert.equal(await checkMxRecords("owner@example.test", mxResolver, 20), true);
  assert.equal(await checkMxRecords("owner@example.test.", mxResolver, 20), true);

  // A fallback is accepted only when the domain has an A record.
  const aFallbackResolver = {
    resolveMx(_domain, callback) { const err = new Error("no MX"); err.code = "ENODATA"; callback(err); },
    resolve4(_domain, callback) { callback(null, ["8.8.8.8"]); },
  };
  assert.equal(await checkMxRecords("owner@example.test", aFallbackResolver, 20), true);

  // Missing MX and A records are a definitive invalid-domain result.
  const noRecordsResolver = {
    resolveMx(_domain, callback) { const err = new Error("no MX"); err.code = "ENODATA"; callback(err); },
    resolve4(_domain, callback) { const err = new Error("no A"); err.code = "ENOTFOUND"; callback(err); },
  };
  assert.equal(await checkMxRecords("owner@example.test", noRecordsResolver, 20), false);

  // Resolver/server errors must reject so the queue item stays queued for retry.
  const transientMxResolver = {
    resolveMx(_domain, callback) { const err = new Error("sensitive resolver detail"); err.code = "ESERVFAIL"; callback(err); },
    resolve4() { assert.fail("A fallback must not hide a transient MX resolver failure."); },
  };
  await assert.rejects(
    checkMxRecords("owner@example.test", transientMxResolver, 20),
    (err) => err.code === "ESERVFAIL"
  );

  const transientAResolver = {
    resolveMx(_domain, callback) { const err = new Error("no MX"); err.code = "ENODATA"; callback(err); },
    resolve4(_domain, callback) { const err = new Error("sensitive resolver detail"); err.code = "ETIMEOUT"; callback(err); },
  };
  await assert.rejects(
    checkMxRecords("owner@example.test", transientAResolver, 20),
    (err) => err.code === "ETIMEOUT"
  );

  // A stalled resolver is bounded and surfaces a retryable timeout, not a valid result.
  const stalledResolver = {
    resolveMx() {},
    resolve4() { assert.fail("A lookup must not follow an unresolved MX timeout."); },
  };
  await assert.rejects(
    checkMxRecords("owner@example.test", stalledResolver, 5),
    (err) => err.code === "DNS_TIMEOUT"
  );

  let invalidDomainLookups = 0;
  const unusedResolver = {
    resolveMx() { invalidDomainLookups += 1; },
    resolve4() { invalidDomainLookups += 1; },
  };
  assert.equal(await checkMxRecords("not-an-email", unusedResolver, 20), false);
  assert.equal(await checkMxRecords("owner@bad domain.test", unusedResolver, 20), false);
  assert.equal(invalidDomainLookups, 0);

  console.log("Outreach authorization tests passed: POST-only routing, spoofed cron-header denial, strong CRON_SECRET, admin access, and fail-closed DNS retry behavior.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalCronSecret;
  if (originalTelegramWebhookSecret === undefined) delete process.env.TELEGRAM_WEBHOOK_SECRET;
  else process.env.TELEGRAM_WEBHOOK_SECRET = originalTelegramWebhookSecret;
  if (originalTelegramBotToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
  else process.env.TELEGRAM_BOT_TOKEN = originalTelegramBotToken;
}
