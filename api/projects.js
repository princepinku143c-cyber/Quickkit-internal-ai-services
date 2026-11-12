import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";

/**
 * Hardened Project Lifecycle Engine.
 * Enforces strict input schemas and deterministic default states.
 */
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "UNAUTHORIZED: Operator Token Required", 401);
  }

  let decodedToken;
  try {
    const idToken = authHeader.slice(7);
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch {
    // Firebase verifier diagnostics can contain project/auth details; never log the exception.
    console.error("PROJECT_AUTH_FAILED");
    return error(res, "Build Logic Verification Failure", 403);
  }

  const userId = decodedToken.uid;
  const { action } = req.query || {};

  try {
    if (req.method === "GET") {
      if (action === "billing") return await handleGetBilling(res, userId);
      return await handleListProjects(res, userId);
    }

    if (req.method === "POST" && action === "create") {
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
  if (!projectName || projectName.length < 3) return error(res, "Invalid Project Name", 400);
  if (!packageId) return error(res, "Engineering Package Missing", 400);

  const validPrice = Number(price);
  if (isNaN(validPrice) || validPrice <= 0) return error(res, "Invalid Value Scoping", 400);

  // 2. Deterministic State Initialization
  const docRef = await admin.firestore().collection("projects").add({
    userId,
    projectName,
    packageId,
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
