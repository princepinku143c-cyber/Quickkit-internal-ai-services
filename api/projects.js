import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";

/**
 * Unified Project Lifecycle & Billing Engine.
 * Handles: Create, List, Billing, and Invoicing.
 */
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "Missing Authorization", 401);

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
      if (action === 'invoice') return handleCreateInvoice(req, res, userId);
    }

    return error(res, "Method/Action Not Allowed", 405);
  } catch (err) {
    console.error("PROJECTS_ENGINE_CRASH:", err);
    return error(res, err.message);
  }
}

async function handleListProjects(res, userId) {
  const snapshot = await admin.firestore().collection('projects')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, data);
}

async function handleGetBilling(res, userId) {
  const snapshot = await admin.firestore().collection('payments')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, data);
}

async function handleCreateProject(req, res, userId) {
  const { projectName, packageId, price } = req.body;
  if (!projectName || !packageId) throw new Error("Project metadata incomplete.");

  const docRef = await admin.firestore().collection('projects').add({
    userId, projectName, packageId, price,
    status: 'READY', progress: 0, advancePaid: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    logs: [{ time: new Date().toISOString(), msg: "Project Architected & Recorded." }]
  });

  return success(res, { id: docRef.id });
}

async function handleCreateInvoice(req, res, userId) {
  // Mock invoice logic for SaaS MVP
  return success(res, { status: "GENERATED", invoiceId: Math.random().toString(36).substr(2, 9) });
}
