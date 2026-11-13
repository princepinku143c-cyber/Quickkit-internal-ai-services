import assert from "node:assert/strict";
import admin from "../api/_lib/firebaseAdmin.js";
import handler from "../api/projects.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

const originalAuth = admin.auth;
const originalFirestore = admin.firestore;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

try {
  const capturedErrors = [];
  const capturedWarnings = [];
  console.error = (...args) => capturedErrors.push(args);
  console.warn = (...args) => capturedWarnings.push(args);

  // Invalid Firebase credentials return 401 without exposing verifier diagnostics.
  const invalidTokenDiagnostic = "private Firebase verifier diagnostic";
  const invalidTokenError = new Error(invalidTokenDiagnostic);
  invalidTokenError.code = "auth/invalid-id-token";
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "invalid-test-token");
      throw invalidTokenError;
    },
  });

  const authResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer invalid-test-token" },
    query: {},
  }, authResponse);

  assert.equal(authResponse.statusCode, 401);
  assert.deepEqual(authResponse.body, {
    success: false,
    message: "Authentication failed.",
  });
  assert.deepEqual(capturedWarnings, [["PROJECT_AUTH_FAILED"]]);
  assert.deepEqual(capturedErrors, [
    ["[API_ERROR] 401: Authentication failed."],
  ]);
  assert.equal(JSON.stringify(capturedWarnings).includes(invalidTokenDiagnostic), false);
  assert.equal(JSON.stringify(capturedErrors).includes(invalidTokenDiagnostic), false);

  // Firebase verifier/service failures are 503, not invalid-credential responses.
  capturedErrors.length = 0;
  capturedWarnings.length = 0;
  const authServiceDiagnostic = "private Firebase Admin availability diagnostic";
  admin.auth = () => ({
    verifyIdToken: async () => {
      throw new Error(authServiceDiagnostic);
    },
  });

  const unavailableResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer test-token-during-outage" },
    query: {},
  }, unavailableResponse);

  assert.equal(unavailableResponse.statusCode, 503);
  assert.deepEqual(unavailableResponse.body, {
    success: false,
    message: "Authentication service is temporarily unavailable.",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_AUTH_UNAVAILABLE"],
    ["[API_ERROR] 503: Authentication service is temporarily unavailable."],
  ]);
  assert.deepEqual(capturedWarnings, []);
  assert.equal(JSON.stringify(capturedErrors).includes(authServiceDiagnostic), false);
  assert.equal(JSON.stringify(unavailableResponse.body).includes(authServiceDiagnostic), false);

  // A Firestore rejection from an async route handler must be awaited and
  // converted to a generic 500 response instead of escaping the handler.
  capturedErrors.length = 0;
  const databaseDiagnostic = "private Firestore connection diagnostic";
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-test-token");
      return { uid: "client-1" };
    },
  });
  admin.firestore = () => {
    throw new Error(databaseDiagnostic);
  };

  const databaseResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-test-token" },
    query: {},
  }, databaseResponse);

  assert.equal(databaseResponse.statusCode, 500);
  assert.deepEqual(databaseResponse.body, {
    success: false,
    message: "Unable to process project request right now.",
  });
  assert.deepEqual(capturedErrors, [
    ["PROJECT_REQUEST_FAILED"],
    ["[API_ERROR] 500: Unable to process project request right now."],
  ]);
  assert.equal(JSON.stringify(capturedErrors).includes(databaseDiagnostic), false);
  assert.equal(JSON.stringify(databaseResponse.body).includes(databaseDiagnostic), false);

  // Project creation rejects malformed/non-finite quote values before any Firestore write.
  const projectWrites = [];
  admin.auth = () => ({
    verifyIdToken: async () => ({ uid: "client-1" }),
  });
  const mockFirestore = () => ({
    collection: (name) => {
      assert.equal(name, "projects");
      return {
        add: async (document) => {
          projectWrites.push(document);
          return { id: "project-123" };
        },
      };
    },
  });
  mockFirestore.FieldValue = {
    serverTimestamp: () => "mock-server-timestamp",
  };
  admin.firestore = mockFirestore;

  const createProject = async (price, extraBody = {}) => {
    const response = mockResponse();
    await handler({
      method: "POST",
      headers: { authorization: "Bearer valid-test-token" },
      query: { action: "create" },
      body: {
        projectName: "  Example project  ",
        packageId: "  starter  ",
        price,
        ...extraBody,
      },
    }, response);
    return response;
  };

  for (const invalidPrice of [Infinity, -Infinity, "1e309", "Infinity", "NaN", "", true, false, null, {}, [], 0, -1]) {
    const response = await createProject(invalidPrice);
    assert.equal(response.statusCode, 400, `Expected invalid price ${String(invalidPrice)} to be rejected`);
    assert.equal(response.body.message, "Invalid Value Scoping");
  }
  assert.equal(projectWrites.length, 0, "Invalid quote values must not create project records");

  // Existing numeric-string clients remain compatible; strings are normalized before persistence.
  const validQuoteResponse = await createProject("1250.50");
  assert.equal(validQuoteResponse.statusCode, 200);
  assert.deepEqual(validQuoteResponse.body, {
    success: true,
    data: { projectId: "project-123" },
  });
  assert.equal(projectWrites.length, 1);
  assert.equal(projectWrites[0].projectName, "Example project");
  assert.equal(projectWrites[0].packageId, "starter");
  assert.equal(projectWrites[0].price, 1250.5);
  assert.equal(projectWrites[0].userId, "client-1");

  // Ownership must come from the verified Firebase token, never request-body fields.
  const spoofedOwnerResponse = await createProject(250, {
    userId: "client-2",
    tenantId: "tenant-victim",
    workspaceId: "workspace-victim",
  });
  assert.equal(spoofedOwnerResponse.statusCode, 200);
  assert.equal(projectWrites.length, 2);
  assert.equal(projectWrites[1].userId, "client-1");
  assert.equal(Object.hasOwn(projectWrites[1], "tenantId"), false);
  assert.equal(Object.hasOwn(projectWrites[1], "workspaceId"), false);

  // Project and billing reads must be scoped to the verified Firebase UID,
  // even when a caller supplies a different userId or tenantId query parameter.
  const readCollections = [];
  admin.auth = () => ({
    verifyIdToken: async (token) => {
      assert.equal(token, "valid-test-token");
      return { uid: "client-1" };
    },
  });
  admin.firestore = () => ({
    collection: (name) => {
      assert.ok(["projects", "payments"].includes(name));
      let ownerFilterApplied = false;
      let orderingApplied = false;
      return {
        where: (field, operator, value) => {
          assert.equal(field, "userId");
          assert.equal(operator, "==");
          assert.equal(value, "client-1", "Read scope must come from the verified token, not query parameters");
          ownerFilterApplied = true;
          return this;
        },
        orderBy: (field, direction) => {
          assert.equal(field, "createdAt");
          assert.equal(direction, "desc");
          orderingApplied = true;
          return this;
        },
        get: async () => {
          assert.equal(ownerFilterApplied, true, "A user ownership filter is required before reading");
          assert.equal(orderingApplied, true, "Existing createdAt ordering must remain intact");
          readCollections.push(name);
          return {
            docs: [{
              id: `${name}-owned-by-client-1`,
              data: () => ({ userId: "client-1", label: "owned" }),
            }],
          };
        },
      };
    },
  });

  const listProjectsResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-test-token" },
    query: { userId: "client-2", tenantId: "tenant-victim" },
  }, listProjectsResponse);
  assert.equal(listProjectsResponse.statusCode, 200);
  assert.deepEqual(listProjectsResponse.body.data, [{
    id: "projects-owned-by-client-1",
    userId: "client-1",
    label: "owned",
  }]);

  const listBillingResponse = mockResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer valid-test-token" },
    query: { action: "billing", userId: "client-2", tenantId: "tenant-victim" },
  }, listBillingResponse);
  assert.equal(listBillingResponse.statusCode, 200);
  assert.deepEqual(listBillingResponse.body.data, [{
    id: "payments-owned-by-client-1",
    userId: "client-1",
    label: "owned",
  }]);
  assert.deepEqual(readCollections, ["projects", "payments"]);

  console.log("Project API security tests passed: verified-token ownership overrides body-supplied user, tenant, and workspace identifiers.");
  console.log("Project API security tests passed: authentication diagnostics are redacted and malformed/non-finite project quote values are rejected before persistence.");
  console.log("Project API security tests passed: invalid tokens return 401, Firebase verifier outages return 503, and auth/Firestore diagnostics stay redacted.");
} finally {
  admin.auth = originalAuth;
  admin.firestore = originalFirestore;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}
