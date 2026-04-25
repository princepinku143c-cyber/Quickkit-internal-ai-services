import fetch from "node-fetch";
import admin from "./_lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "./_lib/paypalAdmin.js";
import { success, error } from "./_lib/response.js";

/**
 * Hardened Settlement Capture with Atomic States & Idempotency.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  const { orderID, projectId } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "Missing Authorization", 401);

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!projectId) throw new Error("Verification failed: Project ID mapping missing.");

    // 1. ATOMIC PROJECT LOCK (Transaction)
    const projectRef = admin.firestore().collection('projects').doc(projectId);
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(projectRef);
      if (!doc.exists) throw new Error("Build record not found.");
      
      const project = doc.data();
      if (project.userId !== userId) throw new Error("Industrial Violation: Authorization mismatch.");
      if (project.advancePaid) throw new Error("Payment already finalized for this project.");

      const expectedAmount = Math.round(project.price * 0.1);
      return { expectedAmount, projectName: project.projectName };
    });

    // 2. Fetch PayPal Access Token
    const accessToken = await getPayPalAccessToken();

    // 3. CAPTURE & VERIFY
    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data.status !== "COMPLETED") {
       throw new Error(`External verification failure. Status: ${data.status}`);
    }

    // 4. Amount Scrutiny
    const capturedAmount = Number(data.purchase_units[0].payments.captures[0].amount.value);
    if (Math.abs(capturedAmount - result.expectedAmount) > 1) {
        throw new Error(`Financial Discrepancy: Captured $${capturedAmount} vs Expected $${result.expectedAmount}`);
    }

    // 5. ATOMIC BATCH COMMIT
    const batch = admin.firestore().batch();
    
    // Log payment (Idempotent by orderID)
    const paymentRef = admin.firestore().collection("payments").doc(orderID);
    batch.set(paymentRef, {
      userId,
      projectId,
      projectName: result.projectName,
      orderID,
      amount: capturedAmount,
      status: "COMPLETED",
      verified: true,
      capturedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Advance Project State
    batch.update(projectRef, {
      advancePaid: true,
      status: "IN_PROGRESS",
      paymentStatus: "SUCCESS_VERIFIED",
      progress: 10,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return success(res, { status: "VERIFIED", orderID });

  } catch (err) {
    console.error("CRITICAL_SETTLEMENT_FAILED:", err);
    return error(res, err.message);
  }
}
