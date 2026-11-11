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
  admin.firestore = () => ({
    collection(name) {
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

  // The project owner can still confirm their own valid token.
  setIdentity("owner-1");
  let ownerUpdates = 0;
  admin.firestore = () => ({
    collection(name) {
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
  const aiOriginalEnv = {
    key: process.env.NEURAL_NODE_KEY,
    endpoint: process.env.NEURAL_NODE_ENDPOINT,
    engine: process.env.NEURAL_NODE_ENGINE,
  };
  const capturedAiErrors = [];
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
        throw new Error("sensitive Firebase verifier diagnostic");
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
    assert.equal(verifierFailure.statusCode, 403);
    assert.deepEqual(verifierFailure.body, {
      success: false,
      message: "Identity Verification Failure",
    });
    assert.doesNotMatch(JSON.stringify(capturedAiErrors), /sensitive Firebase verifier diagnostic/);

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
    assert.match(rateLimited.headers["Retry-After"], /^\\d+$/);
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

  console.log("Firestore rules contract passed: project creation and lead mutations are admin-only; client lead access is read-only.");
  console.log("System API authorization tests passed: admin-only aggregate stats, project-owner payment verification, and cross-user denial.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  nodemailer.createTransport = originalCreateTransport;
}
