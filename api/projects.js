import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { isPlainObject, payloadTooLarge } from "./_lib/input.js";

const INVALID_ID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-user-token",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/tenant-id-mismatch",
]);

/**
 * Hardened Project Lifecycle Engine.
 * Enforces strict input schemas and deterministic default states.
 */
export default async function handler(req, res) {
  // Project and billing responses contain user-scoped records; never cache them.
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Authorization");

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "UNAUTHORIZED: Operator Token Required", 401);
  }

  let decodedToken;
  try {
    const idToken = authHeader.slice(7);
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (authError) {
    // Invalid credentials are a client authentication failure; verifier outages
    // are service failures. Never expose Firebase diagnostics in either response.
    if (INVALID_ID_TOKEN_CODES.has(authError?.code)) {
      console.warn("PROJECT_AUTH_FAILED");
      return error(res, "Authentication failed.", 401);
    }
    console.error("PROJECT_AUTH_UNAVAILABLE");
    return error(res, "Authentication service is temporarily unavailable.", 503);
  }

  const userId = decodedToken.uid;
  const { action } = req.query || {};

  try {
    if (req.method === "GET") {
      if (action === "billing") return await handleGetBilling(res, userId);
      return await handleListProjects(res, userId);
    }

    if (req.method === "POST" && action === "create") {
      if (!isPlainObject(req.body) || payloadTooLarge(req.body, 16 * 1024)) {
        return error(res, "Invalid or oversized request payload", 400);
      }
      return await handleCreateProject(req, res, userId);
    }

    return error(res, "Lifecycle Action Not Allowed", 405);
  } catch {
    // Await route work inside this boundary so Firestore rejections are handled
    // without exposing internal database or provider diagnostics.
    console.error("PROJECT_REQUEST_FAILED");
    return error(res, "Unable to process project request right now.", 500);
  }
}

async function handleListProjects(res, userId) {
  const snapshot = await admin.firestore().collection("projects")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  // Always return Array for zero-crash frontend (.map)
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, Array.isArray(data) ? data : []);
}

async function handleGetBilling(res, userId) {
  const snapshot = await admin.firestore().collection("payments")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, Array.isArray(data) ? data : []);
}

async function handleCreateProject(req, res, userId) {
  const { projectName, packageId, price } = req.body || {};

  // 1. Strict Schema Validation
  const normalizedProjectName = typeof projectName === "string" ? projectName.trim() : "";
  const normalizedPackageId = typeof packageId === "string" ? packageId.trim() : "";
  if (normalizedProjectName.length < 3 || normalizedProjectName.length > 120) {
    return error(res, "Invalid Project Name", 400);
  }
  if (!normalizedPackageId || normalizedPackageId.length > 128) {
    return error(res, "Engineering Package Missing", 400);
  }

  // Accept numeric values and non-empty numeric strings, but reject booleans,
  // objects, NaN, and infinities before they reach Firestore.
  const hasNumericPriceType = typeof price === "number"
    || (typeof price === "string" && price.trim().length > 0);
  const validPrice = hasNumericPriceType ? Number(price) : NaN;
  if (!Number.isFinite(validPrice) || validPrice <= 0) {
    return error(res, "Invalid Value Scoping", 400);
  }

  // 2. Deterministic State Initialization
  const docRef = await admin.firestore().collection("projects").add({
    userId,
    projectName: normalizedProjectName,
    packageId: normalizedPackageId,
    price: validPrice,
    status: "PENDING_PAYMENT", // Default SaaS Starting State
    progress: 5,
    advancePaid: false,
    paymentStatus: "AWAITING_DEPOSIT",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    logs: [{
      time: new Date().toISOString(),
      msg: "Project Blueprint Secured. Awaiting initial settlement."
    }]
  });

  return success(res, { projectId: docRef.id });
}
