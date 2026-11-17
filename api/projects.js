import admin from "./_lib/firebaseAdmin.js";
import { logSafeError } from "./_lib/safeErrorLog.js";
import { success, error } from "./_lib/response.js";
import { normalizeProjectCreateInput } from "./_lib/projectInput.js";
import { checkRateLimit } from "./_lib/security.js";

/**
 * Hardened Project Lifecycle Engine.
 * Enforces strict input schemas and deterministic default states.
 */
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "UNAUTHORIZED: Operator Token Required", 401);
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { action } = req.query;

    if (req.method === 'GET') {
      if (action === 'billing') return handleGetBilling(res, userId);
      return handleListProjects(res, userId);
    }

    if (req.method === 'POST') {
      if (action === 'create') {
        await checkRateLimit(admin, userId, "project-create", 5);
        return handleCreateProject(req, res, userId);
      }
    }

    return error(res, "Lifecycle Action Not Allowed", 405);
  } catch (err) {
    logSafeError("PROJECT_ENGINE_CRASH", err);
    if (err?.status === 429) {
      if (err.retryAfter) res.setHeader("Retry-After", String(err.retryAfter));
      return error(res, "Too many project creation requests. Please retry shortly.", 429);
    }
    if (err?.status === 503) {
      return error(res, "Project creation is temporarily unavailable.", 503);
    }
    return error(res, "Build Logic Verification Failure", 403);
  }
}

async function handleListProjects(res, userId) {
  const snapshot = await admin.firestore().collection('projects')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  // Always return Array for zero-crash frontend (.map)
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, Array.isArray(data) ? data : []);
}

async function handleGetBilling(res, userId) {
  const snapshot = await admin.firestore().collection('payments')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
    
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, Array.isArray(data) ? data : []);
}

async function handleCreateProject(req, res, userId) {
  const projectInput = normalizeProjectCreateInput(req.body);
  if (!projectInput) return error(res, "Invalid project details", 400);
  const { projectName, packageId, price } = projectInput;

  // Price policy remains owned by the existing package/admin workflow.
  // This endpoint only rejects malformed, non-finite, or unsafe numeric input.
  const docRef = await admin.firestore().collection('projects').add({
    userId,
    projectName,
    packageId,
    price,
    status: 'PENDING_PAYMENT', // Default SaaS Starting State
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
