import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import nodemailer from "nodemailer";
import handler from "../api/system.js";
import aiHandler from "../api/ai.js";

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
const originalCreateTransport = nodemailer.createTransport;

function setIdentity(uid, claims = {}) {
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "test-id-token");
      return { uid, ...claims };
    },
  });
}

function makeRateLimitStub({ count = 0, firstCall = Date.now() } = {}) {
  return {
    collection(name) {
      assert.equal(name, "rate_limits");
      return { doc: () => ({}) };
    },
    runTransaction: async (callback) => callback({
      get: async () => ({ data: () => ({ count, firstCall }) }),
      set: () => {},
    }),
  };
}

try {
  // Enforce the documented HTTP method for each system action before auth or side effects.
  admin.auth = () => { throw new Error("Method guard must run before authentication."); };
  admin.firestore = () => { throw new Error("Method guard must run before database access."); };

  const redeemGet = mockResponse();
  await handler({
    method: "GET",
    query: { action: "redeem-code" },
    headers: {},
  }, redeemGet);
  assert.equal(redeemGet.statusCode, 405);
  assert.equal(redeemGet.headers.Allow, "POST, OPTIONS");

  const statsPost = mockResponse();
  await handler({
    method: "POST",
    query: { action: "stats" },
    headers: {},
  }, statsPost);
  assert.equal(statsPost.statusCode, 405);
  assert.equal(statsPost.headers.Allow, "GET, OPTIONS");

  const statusPatch = mockResponse();
  await handler({
    method: "PATCH",
    query: { action: "project-status" },
    headers: {},
  }, statusPatch);
  assert.equal(statusPatch.statusCode, 405);
  assert.equal(statusPatch.headers.Allow, "POST, OPTIONS");

  const options = mockResponse();
  await handler({ method: "OPTIONS", query: {}, headers: {} }, options);
  assert.equal(options.statusCode, 200);
  assert.equal(options.headers["Access-Control-Allow-Methods"], "GET,POST,OPTIONS");

  // Restore the mocked methods before exercising authentication and authorization.
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;

  // Firebase verifier diagnostics must never be returned to an API caller.
  admin.auth = () => ({
    verifyIdToken: async () => { throw new Error("sensitive verifier diagnostic"); },
  });
  admin.firestore = () => { throw new Error("Database must not be accessed after token rejection."); };
  const invalidToken = mockResponse();
  await handler({
    method: "GET",
    query: { action: "stats" },
    headers: { authorization: "Bearer invalid-token" },
  }, invalidToken);
  assert.equal(invalidToken.statusCode, 401);
  assert.deepEqual(invalidToken.body, { error: "Authentication failed." });
  assert.doesNotMatch(JSON.stringify(invalidToken.body), /sensitive verifier diagnostic/);

  admin.auth = originalAuth;
  admin.firestore = originalFirestore;

  // Aggregate lead/project counts must never be available to ordinary clients.
  setIdentity("client-1");
  let aggregateReads = 0;
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return {
          doc: (uid) => ({
            get: async () => {
              assert.equal(uid, "client-1");
              return { data: () => ({ role: "client" }) };
            },
          }),
        };
      }
      aggregateReads += 1;
      return { count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }) };
    },
  });
  const clientStats = mockResponse();
  await handler({
    method: "GET",
    query: { action: "stats" },
    headers: { authorization: "Bearer test-id-token" },
  }, clientStats);
  assert.equal(clientStats.statusCode, 403);
  assert.equal(aggregateReads, 0);

  // Admin dashboard aggregate counts remain available to admins.
  setIdentity("admin-1");
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
      }
      const count = name === "leads" ? 12 : 7;
      return { count: () => ({ get: async () => ({ data: () => ({ count }) }) }) };
    },
  });
  const adminStats = mockResponse();
  await handler({
    method: "GET",
    query: { action: "stats" },
    headers: { authorization: "Bearer test-id-token" },
  }, adminStats);
  assert.equal(adminStats.statusCode, 200);
  assert.deepEqual(adminStats.body, { leads: 12, projects: 7 });

  // A signed-in user cannot confirm another user's payment token.
  setIdentity("attacker-1");
  let unauthorizedUpdates = 0;
  const attackerLimiter = makeRateLimitStub();
  admin.firestore = () => ({
    collection(name) {
      if (name === "rate_limits") return attackerLimiter.collection(name);
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
      }
      if (name === "projects") {
        return {
          doc: (id) => {
            assert.equal(id, "project-1");
            return {
              get: async () => ({
                exists: true,
                data: () => ({ userId: "owner-1", paymentToken: "ABC123" }),
              }),
              update: async () => { unauthorizedUpdates += 1; },
            };
          },
        };
      }
      throw new Error("Unexpected collection: " + name);
    },
    runTransaction: attackerLimiter.runTransaction,
  });
  const attackerVerify = mockResponse();
  await handler({
    method: "POST",
    query: { action: "verify-payment-token" },
    headers: { authorization: "Bearer test-id-token" },
    body: { projectId: "project-1", token: "ABC123" },
  }, attackerVerify);
  assert.equal(attackerVerify.statusCode, 403);
  assert.equal(unauthorizedUpdates, 0);

  // A validly shaped token is rejected before any project read when the
  // per-user guess limit has been reached.
  setIdentity("owner-1");
  const blockedLimiter = makeRateLimitStub({ count: 5, firstCall: Date.now() });
  let readsAfterLimit = 0;
  admin.firestore = () => ({
    collection(name) {
      if (name === "rate_limits") return blockedLimiter.collection(name);
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
      }
      if (name === "projects") {
        readsAfterLimit += 1;
        throw new Error("Project reads must not occur after rate limiting.");
      }
      throw new Error("Unexpected collection: " + name);
    },
    runTransaction: blockedLimiter.runTransaction,
  });
  const blockedVerify = mockResponse();
  await handler({
    method: "POST",
    query: { action: "verify-payment-token" },
    headers: { authorization: "Bearer test-id-token" },
    body: { projectId: "project-1", token: "ABC123" },
  }, blockedVerify);
  assert.equal(blockedVerify.statusCode, 429);
  assert.match(blockedVerify.headers["Retry-After"], /^\d+$/);
  assert.equal(readsAfterLimit, 0);

  // Token shape validation bounds the comparison input before hashing or I/O.
  const invalidLength = mockResponse();
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
      }
      throw new Error("Database must not be accessed for malformed token input.");
    },
  });
  await handler({
    method: "POST",
    query: { action: "verify-payment-token" },
    headers: { authorization: "Bearer test-id-token" },
    body: { projectId: "project-1", token: "TOOLONG" },
  }, invalidLength);
  assert.equal(invalidLength.statusCode, 400);

  // The project owner can still confirm their own valid token.
  setIdentity("owner-1");
  let ownerUpdates = 0;
  const ownerLimiter = makeRateLimitStub();
  admin.firestore = () => ({
    collection(name) {
      if (name === "rate_limits") return ownerLimiter.collection(name);
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
      }
      if (name === "projects") {
        return {
          doc: () => ({
            get: async () => ({
              exists: true,
              data: () => ({ userId: "owner-1", paymentToken: "ABC123" }),
            }),
            update: async (patch) => {
              ownerUpdates += 1;
              assert.equal(patch.status, "accepted");
              assert.equal(patch.advancePaid, true);
              assert.equal(patch.paymentToken, null);
            },
          }),
        };
      }
      throw new Error("Unexpected collection: " + name);
    },
    runTransaction: ownerLimiter.runTransaction,
  });
  const ownerVerify = mockResponse();
  await handler({
    method: "POST",
    query: { action: "verify-payment-token" },
    headers: { authorization: "Bearer test-id-token" },
    body: { projectId: "project-1", token: "ABC123" },
  }, ownerVerify);
  assert.equal(ownerVerify.statusCode, 200);
  assert.equal(ownerVerify.body.status, "VERIFIED");
  assert.equal(ownerUpdates, 1);

  // Payment tokens are generated without Math.random while preserving the
  // existing six-character uppercase base-36 format.
  setIdentity("admin-1");
  let savedGeneratedToken = null;
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
      }
      if (name === "projects") {
        return { doc: (id) => ({ update: async (patch) => {
          assert.equal(id, "project-1");
          savedGeneratedToken = patch.paymentToken;
        } }) };
      }
      throw new Error("Unexpected collection: " + name);
    },
  });
  const originalMathRandom = Math.random;
  const generatedTokenResponse = mockResponse();
  try {
    Math.random = () => { throw new Error("Math.random must not generate payment tokens."); };
    await handler({
      method: "POST",
      query: { action: "generate-payment-token" },
      headers: { authorization: "Bearer test-id-token" },
      body: { projectId: "project-1" },
    }, generatedTokenResponse);
  } finally {
    Math.random = originalMathRandom;
  }
  assert.equal(generatedTokenResponse.statusCode, 200);
  assert.match(generatedTokenResponse.body.token, /^[0-9A-Z]{6}$/);
  assert.equal(savedGeneratedToken, generatedTokenResponse.body.token);

  // Credit requests use the verified Firebase identity, not client-supplied
  // email/name fields, and escape identity data before embedding it in HTML.
  setIdentity("client-1", {
    email: "verified@example.com",
    name: "<img src=x onerror=alert(1)>",
  });
  let savedCreditRequest = null;
  let sentCreditNotification = null;
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return {
          doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }),
        };
      }
      if (name === "payment_requests") {
        return {
          doc: () => ({ set: async (value) => { savedCreditRequest = value; } }),
        };
      }
      throw new Error("Unexpected collection: " + name);
    },
  });
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      sentCreditNotification = message;
      return { messageId: "test-message" };
    },
  });
  const creditRequest = mockResponse();
  await handler({
    method: "POST",
    query: { action: "credit-request" },
    headers: { authorization: "Bearer test-id-token" },
    body: {
      amount: "25.50",
      email: "spoofed@attacker.example",
      displayName: "<script>alert(1)</script>",
    },
  }, creditRequest);
  assert.equal(creditRequest.statusCode, 200);
  assert.equal(savedCreditRequest.userEmail, "verified@example.com");
  assert.equal(savedCreditRequest.displayName, "<img src=x onerror=alert(1)>");
  assert.equal(savedCreditRequest.price, 25.5);
  assert.equal(savedCreditRequest.credits, 255);
  assert.ok(sentCreditNotification);
  assert.doesNotMatch(sentCreditNotification.html, /<img\b|<script\b/i);
  assert.match(sentCreditNotification.html, /&lt;img/);
  assert.doesNotMatch(sentCreditNotification.subject, /<img|<script/i);

  // Invalid monetary input is rejected before creating a payment request.
  let paymentRequestWrites = 0;
  admin.firestore = () => ({
    collection(name) {
      if (name === "users") {
        return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
      }
      if (name === "payment_requests") {
        return { doc: () => ({ set: async () => { paymentRequestWrites += 1; } }) };
      }
      throw new Error("Unexpected collection: " + name);
    },
  });
  const invalidCreditRequest = mockResponse();
  await handler({
    method: "POST",
    query: { action: "credit-request" },
    headers: { authorization: "Bearer test-id-token" },
    body: { amount: "<script>alert(1)</script>" },
  }, invalidCreditRequest);
  assert.equal(invalidCreditRequest.statusCode, 400);
  assert.equal(paymentRequestWrites, 0);

  // Kelly AI provider and authentication failures must not expose internal diagnostics.
  const aiOriginalAuth = admin.auth;
  const aiOriginalFirestore = admin.firestore;
  const aiOriginalFetch = globalThis.fetch;
  const aiOriginalConsoleError = console.error;
  const aiOriginalConsoleWarn = console.warn;
  const aiOriginalEnv = {
    key: process.env.NEURAL_NODE_KEY,
    endpoint: process.env.NEURAL_NODE_ENDPOINT,
    engine: process.env.NEURAL_NODE_ENGINE,
  };
  const capturedAiErrors = [];
  const capturedAiWarnings = [];
  const makeRateLimitFirestore = (count = 0) => () => ({
    collection(name) {
      assert.equal(name, "rate_limits");
      return { doc: () => ({}) };
    },
    runTransaction: async (callback) => callback({
      get: async () => ({ data: () => ({ count, firstCall: Date.now() }) }),
      set: () => {},
    }),
  });

  try {
    process.env.NEURAL_NODE_KEY = "test-only-placeholder";
    process.env.NEURAL_NODE_ENDPOINT = "https://provider.example.invalid/v1/chat/completions";
    process.env.NEURAL_NODE_ENGINE = "test-model";
    console.error = (...args) => capturedAiErrors.push(args);
    console.warn = (...args) => capturedAiWarnings.push(args);
    admin.auth = aiOriginalAuth;
    admin.firestore = makeRateLimitFirestore(0);

    // Provider error payloads are never returned to callers or written to logs.
    globalThis.fetch = async () => ({
      ok: false,
      status: 502,
      json: async () => ({ error: "sensitive provider response diagnostic" }),
    });
    const providerFailure = mockResponse();
    await aiHandler({
      method: "POST",
      query: { action: "kelly" },
      headers: { "x-real-ip": "203.0.113.10" },
      body: { message: "Test provider failure" },
    }, providerFailure);
    assert.equal(providerFailure.statusCode, 500);
    assert.deepEqual(providerFailure.body, {
      success: false,
      message: "Unable to process your request right now.",
    });
    assert.ok(capturedAiErrors.some(([label, details]) =>
      label === "NEURAL_NODE_ERROR" && details?.status === 502
    ));

    // Network exception text is also kept out of the response and logs.
    capturedAiErrors.length = 0;
    globalThis.fetch = async () => {
      throw new Error("sensitive network credential diagnostic");
    };
    const networkFailure = mockResponse();
    await aiHandler({
      method: "POST",
      query: { action: "kelly" },
      headers: { "x-real-ip": "203.0.113.10" },
      body: { message: "Test network failure" },
    }, networkFailure);
    assert.equal(networkFailure.statusCode, 500);
    assert.deepEqual(networkFailure.body, {
      success: false,
      message: "Unable to process your request right now.",
    });
    assert.doesNotMatch(JSON.stringify(capturedAiErrors), /sensitive network credential diagnostic/);

    // Firebase token-verifier diagnostics must not be written to logs.
    capturedAiErrors.length = 0;
    admin.auth = () => ({
      verifyIdToken: async () => {
        const invalidTokenError = new Error("sensitive Firebase verifier diagnostic");
        invalidTokenError.code = "auth/invalid-id-token";
        throw invalidTokenError;
      },
    });
    admin.firestore = () => {
      throw new Error("Firestore must not be accessed after token rejection.");
    };
    const verifierFailure = mockResponse();
    await aiHandler({
      method: "POST",
      query: { action: "kelly" },
      headers: { authorization: "Bearer invalid-test-token" },
      body: { message: "Test verifier failure" },
    }, verifierFailure);
    assert.equal(verifierFailure.statusCode, 401);
    assert.deepEqual(verifierFailure.body, {
      success: false,
      message: "Authentication failed.",
    });
    assert.deepEqual(capturedAiErrors, [["[API_ERROR] 401: Authentication failed."]]);
    assert.deepEqual(capturedAiWarnings, [["AI_CLUSTER_AUTH_FAILED"]]);
    assert.doesNotMatch(JSON.stringify(capturedAiWarnings), /sensitive Firebase verifier diagnostic/);

    capturedAiErrors.length = 0;
    capturedAiWarnings.length = 0;

    // Firebase Admin initialization/configuration failures are not caller auth failures.
    capturedAiErrors.length = 0;
    admin.auth = () => {
      throw new Error("private Firebase Admin initialization diagnostic");
    };
    const adminUnavailable = mockResponse();
    await aiHandler({
      method: "POST",
      query: { action: "kelly" },
      headers: { authorization: "Bearer test-token" },
      body: { message: "Test Firebase availability failure" },
    }, adminUnavailable);
    assert.equal(adminUnavailable.statusCode, 503);
    assert.deepEqual(adminUnavailable.body, {
      success: false,
      message: "Authentication service is temporarily unavailable.",
    });
    assert.deepEqual(capturedAiErrors, [
      ["AI_CLUSTER_AUTH_UNAVAILABLE"],
      ["[API_ERROR] 503: Authentication service is temporarily unavailable."],
    ]);
    assert.deepEqual(capturedAiWarnings, []);
    assert.doesNotMatch(JSON.stringify(capturedAiErrors) + JSON.stringify(adminUnavailable.body), /private Firebase Admin initialization diagnostic/);

    // Preserve safe 429 rate-limit semantics and the Retry-After header.
    capturedAiErrors.length = 0;
    admin.auth = aiOriginalAuth;
    admin.firestore = makeRateLimitFirestore(30);
    const rateLimited = mockResponse();
    await aiHandler({
      method: "POST",
      query: { action: "kelly" },
      headers: { "x-real-ip": "203.0.113.11" },
      body: { message: "Test rate limit" },
    }, rateLimited);
    assert.equal(rateLimited.statusCode, 429);
    assert.match(rateLimited.headers["Retry-After"], /^\d+$/);
    assert.deepEqual(rateLimited.body, {
      success: false,
      message: "Rate limit exceeded. Please try again shortly.",
    });
    assert.doesNotMatch(JSON.stringify(capturedAiErrors), /sensitive|diagnostic|credential/i);
  } finally {
    admin.auth = aiOriginalAuth;
    admin.firestore = aiOriginalFirestore;
    globalThis.fetch = aiOriginalFetch;
    console.error = aiOriginalConsoleError;
    console.warn = aiOriginalConsoleWarn;
    if (aiOriginalEnv.key === undefined) delete process.env.NEURAL_NODE_KEY;
    else process.env.NEURAL_NODE_KEY = aiOriginalEnv.key;
    if (aiOriginalEnv.endpoint === undefined) delete process.env.NEURAL_NODE_ENDPOINT;
    else process.env.NEURAL_NODE_ENDPOINT = aiOriginalEnv.endpoint;
    if (aiOriginalEnv.engine === undefined) delete process.env.NEURAL_NODE_ENGINE;
    else process.env.NEURAL_NODE_ENGINE = aiOriginalEnv.engine;
  }

  console.log("Kelly AI error-handling tests passed: provider/network/Firebase diagnostics are private and 429 Retry-After is preserved.");

  // Static Firestore rules contract: direct project creation is admin-only.
  // Runtime authorization is enforced by Firestore; this assertion prevents the
  // permissive owner-create rule from silently returning in future changes.
  const firestoreRules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const projectsRuleMatch = firestoreRules.match(/match \/projects\/\{projectId\}\s*\{([\s\S]*?)^\s*\}/m);
  assert.ok(projectsRuleMatch, "Projects Firestore rule block must exist.");
  const projectsRules = projectsRuleMatch[1];
  assert.match(projectsRules, /allow create:\s*if isAdmin\(\);/);
  assert.doesNotMatch(
    projectsRules,
    /allow create:[\s\S]*?request\.resource\.data\.userId\s*==\s*request\.auth\.uid/,
    "A client must not be able to create a project directly by setting its own userId."
  );
  assert.match(projectsRules, /allow update, delete:\s*if isAdmin\(\);/);

  // Client lead views are read-only; all lead writes must stay admin-only.
  const leadsRuleMatch = firestoreRules.match(/match \/leads\/\{leadId\}\s*\{([\s\S]*?)^\s*\}/m);
  assert.ok(leadsRuleMatch, "Leads Firestore rule block must exist.");
  const leadsRules = leadsRuleMatch[1];
  const leadAccessRules = Array.from(
    leadsRules.matchAll(/allow\s+([\w,\s]+):\s*if\s*([^;]+);/g)
  );
  const leadWriteRules = leadAccessRules.filter(([, operations]) =>
    operations.split(",").some((operation) => ["create", "update", "delete"].includes(operation.trim()))
  );
  assert.equal(leadWriteRules.length, 2, "Leads must define create and update/delete write rules.");
  assert.ok(
    leadWriteRules.every(([, , condition]) => /isAdmin\(\)/.test(condition) && !/request\.auth\.uid/.test(condition)),
    "Only admins may create, update, or delete leads; owner access is read-only."
  );
  assert.match(leadsRules, /allow read:\s*if isAuthenticated\(\)/);


  // Public lead submission must keep Firestore, AI-provider, and Odoo diagnostics private.
  const leadOriginalConsoleError = console.error;
  const leadOriginalFetch = globalThis.fetch;
  const leadOriginalCreateTransport = nodemailer.createTransport;
  const leadEnvKeys = [
    "NEURAL_NODE_KEY", "NEURAL_NODE_ENDPOINT", "NEURAL_NODE_ENGINE",
    "ODOO_URL", "ODOO_DB", "ODOO_USERNAME", "ODOO_API_KEY",
  ];
  const leadOriginalEnv = Object.fromEntries(
    leadEnvKeys.map((key) => [key, process.env[key]])
  );
  const capturedLeadErrors = [];
  const makeLeadFirestore = ({ failLeadWrite = false } = {}) => ({
    collection(name) {
      if (name === "rate_limits") return { doc: () => ({}) };
      if (name === "leads") return {
        doc: () => ({
          id: "lead-security-test",
          set: async () => {
            if (failLeadWrite) throw new Error("private Firestore lead write diagnostic");
          },
          update: async () => {},
        }),
      };
      if (name === "projects") return {
        doc: () => ({ id: "project-security-test", set: async () => {} }),
      };
      throw new Error("Unexpected collection: " + name);
    },
    runTransaction: async (callback) => callback({
      get: async () => ({ data: () => ({ count: 0, firstCall: Date.now() }) }),
      set: () => {},
    }),
  });
  const leadRequest = () => ({
    method: "POST",
    query: { action: "lead" },
    headers: {},
    body: {
      name: "Security Test Lead",
      email: "lead@example.test",
      projectName: "Security Regression",
      requirement: "Test safe error handling",
    },
  });

  try {
    console.error = (...args) => capturedLeadErrors.push(args);
    admin.auth = originalAuth;
    for (const key of leadEnvKeys) delete process.env[key];

    // A failed Firestore lead write must not expose its exception in the public response.
    admin.firestore = () => makeLeadFirestore({ failLeadWrite: true });
    const leadWriteFailure = mockResponse();
    await handler(leadRequest(), leadWriteFailure);
    assert.equal(leadWriteFailure.statusCode, 500);
    assert.deepEqual(leadWriteFailure.body, { error: "Unable to submit lead right now." });
    assert.ok(capturedLeadErrors.some(([label]) => label === "SYSTEM_LEAD_SUBMIT_FAILED"));
    assert.doesNotMatch(JSON.stringify(capturedLeadErrors), /private Firestore lead write diagnostic/);

    // Missing AI configuration must not cause the asynchronous draft error to be logged verbatim.
    capturedLeadErrors.length = 0;
    admin.firestore = () => makeLeadFirestore();
    nodemailer.createTransport = () => ({ sendMail: async () => ({ messageId: "test-message" }) });
    const aiDraftFailure = mockResponse();
    await handler(leadRequest(), aiDraftFailure);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(aiDraftFailure.statusCode, 200);
    assert.ok(capturedLeadErrors.some(([label]) => label === "SYSTEM_LEAD_AI_DRAFT_FAILED"));
    assert.doesNotMatch(JSON.stringify(capturedLeadErrors), /AI Infrastructure Offline|Missing Neural Node Configuration/);

    // An Odoo connection failure is fault-tolerant but must not write its raw exception to logs.
    capturedLeadErrors.length = 0;
    process.env.ODOO_URL = "https://odoo.example.invalid";
    process.env.ODOO_DB = "test-db";
    process.env.ODOO_USERNAME = "test-user";
    process.env.ODOO_API_KEY = "test-only-placeholder";
    globalThis.fetch = async () => {
      throw new Error("private Odoo authentication diagnostic");
    };
    admin.firestore = () => makeLeadFirestore();
    const odooFailure = mockResponse();
    await handler(leadRequest(), odooFailure);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(odooFailure.statusCode, 200);
    assert.ok(capturedLeadErrors.some(([label]) => label === "SYSTEM_LEAD_ODOO_SYNC_FAILED"));
    assert.doesNotMatch(JSON.stringify(capturedLeadErrors), /private Odoo authentication diagnostic/);
  } finally {
    console.error = leadOriginalConsoleError;
    globalThis.fetch = leadOriginalFetch;
    nodemailer.createTransport = leadOriginalCreateTransport;
    admin.auth = originalAuth;
    admin.firestore = originalFirestore;
    for (const key of leadEnvKeys) {
      if (leadOriginalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = leadOriginalEnv[key];
    }
  }


  // Remaining System API backend failures must never expose raw Firebase/Firestore diagnostics.
  const systemFailureOriginalConsoleError = console.error;
  const capturedSystemFailures = [];
  const privateSystemDiagnostic = "private Firestore system diagnostic";
  const systemFailureCases = [
    { action: "stats", role: "admin", collection: "leads", operation: "count", message: "Unable to retrieve system statistics right now.", event: "SYSTEM_STATS_FAILED", method: "GET" },
    { action: "add-credits", role: "admin", transaction: true, message: "Unable to add credits right now.", event: "SYSTEM_ADD_CREDITS_FAILED" },
    { action: "redeem-code", role: "client", transaction: true, message: "Unable to redeem code right now.", event: "SYSTEM_REDEEM_CODE_FAILED" },
    { action: "credit-request", role: "client", collection: "payment_requests", operation: "set", message: "Unable to send credit request right now.", event: "SYSTEM_CREDIT_REQUEST_FAILED" },
    { action: "generate-payment-token", role: "admin", collection: "projects", operation: "update", message: "Unable to generate payment token right now.", event: "SYSTEM_GENERATE_PAYMENT_TOKEN_FAILED" },
    { action: "verify-payment-token", role: "client", collection: "projects", operation: "get", message: "Unable to verify payment token right now.", event: "SYSTEM_VERIFY_PAYMENT_TOKEN_FAILED" },
    { action: "project-quote", role: "admin", collection: "projects", operation: "update", message: "Unable to send the project quote right now.", event: "SYSTEM_PROJECT_QUOTE_FAILED" },
    { action: "project-update", role: "admin", collection: "projects", operation: "update", message: "Unable to update the project right now.", event: "SYSTEM_PROJECT_UPDATE_FAILED" },
    { action: "project-status", role: "client", collection: "projects", operation: "get", message: "Unable to update the project status right now.", event: "SYSTEM_PROJECT_STATUS_FAILED" },
  ];
  const systemBodies = {
    "add-credits": { targetUserId: "target-user", amount: 10 },
    "redeem-code": { code: "TEST-CODE" },
    "credit-request": { amount: 10 },
    "generate-payment-token": { projectId: "project-1" },
    "verify-payment-token": { projectId: "project-1", token: "ABC123" },
    "project-quote": { projectId: "project-1", quote: { price: 10, timeline: "1 week", notes: "test" }, clientEmail: "client@example.test", projectName: "Test Project" },
    "project-update": { projectId: "project-1", progress: 10, message: "Test update", clientEmail: "client@example.test", projectName: "Test Project" },
    "project-status": { projectId: "project-1", status: "accepted" },
  };
  try {
    console.error = (...args) => capturedSystemFailures.push(args);
    for (const testCase of systemFailureCases) {
      setIdentity("system-test-user", { email: "system-test@example.test", name: "System Test User" });
      admin.firestore = () => ({
        collection(name) {
          if (name === "users") {
            return { doc: () => ({ get: async () => ({ data: () => ({ role: testCase.role }) }) }) };
          }
          if (name === testCase.collection || (testCase.transaction && name === "promo_codes")) {
            return {
              count: () => ({ get: async () => { throw new Error(privateSystemDiagnostic); } }),
              doc: () => ({
                get: async () => { throw new Error(privateSystemDiagnostic); },
                set: async () => { throw new Error(privateSystemDiagnostic); },
                update: async () => { throw new Error(privateSystemDiagnostic); },
              }),
            };
          }
          throw new Error("Unexpected collection in system security test.");
        },
        runTransaction: async () => { throw new Error(privateSystemDiagnostic); },
      });
      const response = mockResponse();
      await handler({
        method: testCase.method || "POST",
        query: { action: testCase.action },
        headers: { authorization: "Bearer test-id-token" },
        body: systemBodies[testCase.action] || {},
      }, response);
      assert.equal(response.statusCode, 500, `${testCase.action} should return a generic server error.`);
      assert.deepEqual(response.body, { error: testCase.message });
      assert.ok(capturedSystemFailures.some(([label]) => label === testCase.event), `${testCase.action} should emit its fixed event label.`);
      assert.doesNotMatch(JSON.stringify(capturedSystemFailures), /private Firestore system diagnostic/);
      capturedSystemFailures.length = 0;
    }

    // Preserve only the explicitly allow-listed business errors from promo redemption.
    setIdentity("system-test-user");
    admin.firestore = () => ({
      collection(name) {
        if (name === "users") return { doc: () => ({ get: async () => ({ data: () => ({ role: "client" }) }) }) };
        if (name === "promo_codes") return { doc: () => ({}) };
        throw new Error("Unexpected collection in promo validation test.");
      },
      runTransaction: async (callback) => callback({
        get: async () => ({ exists: false }),
      }),
    });
    const invalidPromo = mockResponse();
    await handler({
      method: "POST",
      query: { action: "redeem-code" },
      headers: { authorization: "Bearer test-id-token" },
      body: { code: "INVALID" },
    }, invalidPromo);
    assert.equal(invalidPromo.statusCode, 400);
    assert.deepEqual(invalidPromo.body, { error: "Invalid promo code." });
  } finally {
    console.error = systemFailureOriginalConsoleError;
    admin.auth = originalAuth;
    admin.firestore = originalFirestore;
  }

  // Project quote/progress email templates must escape user-controlled HTML and strip header newlines.
  const projectEmailOriginalCreateTransport = nodemailer.createTransport;
  const capturedProjectEmails = [];
  const capturedProjectHistory = [];
  const capturedProjectUpdates = [];
  try {
    setIdentity("admin-1");
    admin.firestore = () => ({
      collection(name) {
        if (name === "users") {
          return { doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }) };
        }
        if (name === "projects") {
          return {
            doc: (id) => ({
              update: async (patch) => capturedProjectUpdates.push({ id, patch }),
              collection: (subcollection) => ({
                add: async (entry) => capturedProjectHistory.push({ subcollection, entry }),
              }),
            }),
          };
        }
        throw new Error("Unexpected collection in project email escaping test.");
      },
    });
    nodemailer.createTransport = () => ({
      sendMail: async (message) => {
        capturedProjectEmails.push(message);
        return { messageId: "project-email-security-test" };
      },
    });

    const quoteResponse = mockResponse();
    await handler({
      method: "POST",
      query: { action: "project-quote" },
      headers: { authorization: "Bearer test-id-token" },
      body: {
        projectId: "project-1",
        quote: {
          price: '<img src=x onerror=alert("price")>',
          timeline: "<svg onload=alert(1)>",
          notes: "<script>alert(1)</script>",
        },
        clientEmail: "client@example.test",
        projectName: "</h2><img src=x onerror=alert(1)>\r\nBcc: attacker@example.test",
      },
    }, quoteResponse);
    assert.equal(quoteResponse.statusCode, 200);
    const quoteEmail = capturedProjectEmails[0];
    assert.ok(quoteEmail);
    assert.doesNotMatch(quoteEmail.html, /<(?:script|img|svg|iframe)\b/i);
    assert.match(quoteEmail.html, /&lt;img/);
    assert.match(quoteEmail.html, /&lt;svg/);
    assert.match(quoteEmail.html, /&lt;script/);
    assert.doesNotMatch(quoteEmail.subject, /[\r\n]/);

    const updateResponse = mockResponse();
    await handler({
      method: "POST",
      query: { action: "project-update" },
      headers: { authorization: "Bearer test-id-token" },
      body: {
        projectId: "project-1",
        progress: 25,
        message: "<img src=x onerror=alert(2)>",
        clientEmail: "client@example.test",
        projectName: "<iframe src=javascript:alert(2)>",
      },
    }, updateResponse);
    assert.equal(updateResponse.statusCode, 200);
    const updateEmail = capturedProjectEmails[1];
    assert.ok(updateEmail);
    assert.doesNotMatch(updateEmail.html, /<(?:script|img|svg|iframe)\b/i);
    assert.match(updateEmail.html, /&lt;img/);
    assert.match(updateEmail.html, /&lt;iframe/);
    assert.equal(capturedProjectHistory.length, 1);
    assert.equal(capturedProjectUpdates.length, 2);
  } finally {
    nodemailer.createTransport = projectEmailOriginalCreateTransport;
    admin.auth = originalAuth;
    admin.firestore = originalFirestore;
  }

  console.log("Project email escaping tests passed: quote/progress HTML is escaped and subject newlines are removed.");

  console.log("System API backend-error redaction tests passed: all protected actions return generic failures and promo validation messages remain safe.");

  console.log("Firestore rules contract passed: project creation and lead mutations are admin-only; client lead access is read-only.");
  console.log("System API authorization tests passed: admin-only aggregate stats, project-owner payment verification, and cross-user denial.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  nodemailer.createTransport = originalCreateTransport;
}
