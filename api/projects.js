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
      if (action === 'create') return handleCreateProject(req, res, userId);
    }

    return error(res, "Lifecycle Action Not Allowed", 405);
  } catch (err) {
    console.error("PROJECT_ENGINE_CRASH:", err);
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
  const { projectName, packageId, price } = req.body;
  
  // 1. Strict Schema Validation
  if (!projectName || projectName.length < 3) return error(res, "Invalid Project Name", 400);
  if (!packageId) return error(res, "Engineering Package Missing", 400);
  
  const validPrice = Number(price);
  if (isNaN(validPrice) || validPrice <= 0) return error(res, "Invalid Value Scoping", 400);

  // 2. Deterministic State Initialization
  const docRef = await admin.firestore().collection('projects').add({
    userId, 
    projectName, 
    packageId, 
    price: validPrice,
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
