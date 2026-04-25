import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return error(res, 'Unauthorized', 401);

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { projectName, price, leadId } = req.body;

    if (!projectName) throw new Error("Verification failed: Project mapping parameters missing.");

    const projectRef = await admin.firestore().collection('projects').add({
      userId,
      projectName,
      price: Number(price) || 2499,
      status: "PENDING_PAYMENT",
      advancePaid: false,
      progress: 0,
      leadId: leadId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Notify Admin (Phase 2)
    const host = req.headers.host === 'localhost' ? 'http://localhost' : `https://${req.headers.host}`;
    fetch(`${host}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: process.env.EMAIL_USER,
            name: "Admin",
            subject: `🚀 [New Build] ${projectName}`,
            text: `Critical Build Queue Entry: ${projectName} for User ID: ${userId}. Projected Value: $${price}`
        })
    }).catch(() => {});

    return success(res, { projectId: projectRef.id });
  } catch (err) {
    console.error("PROJECT_CREATE_CRASH:", err);
    return error(res, err.message);
  }
}
