import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
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

function setIdentity(uid) {
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "test-id-token");
      return { uid };
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

  console.log("System API authorization tests passed: admin-only aggregate stats, project-owner payment verification, and cross-user denial.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
}
