import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import nodemailer from "nodemailer";
import handler from "../api/send-proposal.js";
import { buildProposalEmail } from "../services/proposalEmail.js";

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

function assertPrivateNoStore(response) {
  assert.equal(response.headers["Cache-Control"], "private, no-store");
  assert.equal(response.headers.Vary, "Authorization");
}

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalCreateTransport = nodemailer.createTransport;
const originalWarn = console.warn;
const originalError = console.error;

function setAdminIdentity() {
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "test-id-token");
      return { uid: "admin-1" };
    },
  });
  admin.firestore = () => ({
    collection(name) {
      assert.equal(name, "users");
      return {
        doc(uid) {
          assert.equal(uid, "admin-1");
          return { get: async () => ({ data: () => ({ role: "admin" }) }) };
        },
      };
    },
  });
}

try {
  setAdminIdentity();
  let sentMessage = null;
  let sendCount = 0;
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      sentMessage = message;
      sendCount += 1;
      return { messageId: "test-message" };
    },
  });

  const successResponse = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer test-id-token" },
    body: {
      email: "client@example.com",
      name: '<img src=x onerror="alert(1)">',
      price: "<script>alert(2)</script>",
      features: ['<svg onload="alert(3)">', "Lead qualification"],
    },
  }, successResponse);
  assert.equal(successResponse.statusCode, 200);
  assertPrivateNoStore(successResponse);
  assert.equal(sentMessage.to, "client@example.com");
  assert.doesNotMatch(sentMessage.html, /<(?:img|script|svg)\b/i);
  assert.match(sentMessage.html, /&lt;img/);
  assert.match(sentMessage.html, /&lt;script&gt;/);
  assert.match(sentMessage.html, /&lt;svg/);
  assert.match(sentMessage.html, /Lead qualification/);

  const methodFailure = mockResponse();
  await handler({ method: "GET", headers: {} }, methodFailure);
  assert.equal(methodFailure.statusCode, 405);
  assertPrivateNoStore(methodFailure);

  // Reject header injection and malformed feature data before attempting delivery.
  const beforeInvalid = sendCount;
  const invalidRecipient = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer test-id-token" },
    body: { email: "client@example.com\r\nBcc: attacker@example.com", name: "Client", price: "100", features: [] },
  }, invalidRecipient);
  assert.equal(invalidRecipient.statusCode, 400);
  assertPrivateNoStore(invalidRecipient);
  assert.equal(sendCount, beforeInvalid);

  assert.throws(() => buildProposalEmail({
    email: "client@example.com", name: "Client", price: "100", features: Array(21).fill("feature"),
  }), /no more than 20/);
  assert.throws(() => buildProposalEmail({
    email: "client@example.com", name: "Client", price: "100", features: [{ html: "<script>" }],
  }), /text values/);

  // Token-verifier details must not enter logs or API responses.
  const authLogs = [];
  console.warn = (...args) => authLogs.push(args.join(" "));
  admin.auth = () => ({ verifyIdToken: async () => { throw new Error("sensitive Firebase verifier diagnostic"); } });
  const authFailure = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer invalid-token" },
    body: { email: "client@example.com", name: "Client", price: "100", features: [] },
  }, authFailure);
  assert.equal(authFailure.statusCode, 403);
  assertPrivateNoStore(authFailure);
  assert.deepEqual(authLogs, ["SEND_PROPOSAL_AUTH_FAILED"]);
  assert.doesNotMatch(JSON.stringify(authFailure.body) + authLogs.join(" "), /sensitive Firebase verifier diagnostic/);

  // SMTP exceptions must be replaced by a fixed event label and generic response.
  setAdminIdentity();
  const smtpLogs = [];
  console.error = (...args) => smtpLogs.push(args.join(" "));
  nodemailer.createTransport = () => ({ sendMail: async () => { throw new Error("sensitive SMTP credential diagnostic"); } });
  const smtpFailure = mockResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer test-id-token" },
    body: { email: "client@example.com", name: "Client", price: "100", features: [] },
  }, smtpFailure);
  assert.equal(smtpFailure.statusCode, 500);
  assertPrivateNoStore(smtpFailure);
  assert.deepEqual(smtpLogs, ["PROPOSAL_DISPATCH_FAILURE", "[API_ERROR] 500: Failed to transmit proposal."]);
  assert.doesNotMatch(JSON.stringify(smtpFailure.body) + smtpLogs.join(" "), /sensitive SMTP credential diagnostic/);

  console.log("Send-proposal security tests passed: HTML escaping, recipient validation, feature bounds, and diagnostic redaction.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  nodemailer.createTransport = originalCreateTransport;
  console.warn = originalWarn;
  console.error = originalError;
}
