import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import admin from "../api/_lib/firebaseAdmin.js";
import nodemailer from "nodemailer";
import handler from "../api/system.js";

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
