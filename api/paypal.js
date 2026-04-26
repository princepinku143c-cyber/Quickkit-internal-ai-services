import fetch from "node-fetch";
import admin from "./_lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "./_lib/paypalAdmin.js";
import { success, error } from "./_lib/response.js";

/**
 * Unified PayPal Settlement Engine.
 * Handles: Create, Capture, and Webhook verification.
 */
export default async function handler(req, res) {
  const { action } = req.query;

  // Webhook is always POST and handled differently (No Auth Token)
  if (action === 'webhook') {
    if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);
    return handleWebhook(req, res);
  }

  // Security for Create/Capture
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "Missing Authorization", 401);

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (action === 'create') {
      return handleCreate(req, res, userId);
    } else if (action === 'capture') {
      return handleCapture(req, res, userId);
    } else {
      return error(res, "Invalid Action", 400);
    }
  } catch (err) {
    console.error("PAYPAL_ENGINE_CRASH:", err);
    return error(res, err.message);
  }
}

async function handleCreate(req, res, userId) {
  const { amount, projectName } = req.body;
  const validAmount = Number(amount);
  if (isNaN(validAmount) || validAmount <= 0) return error(res, "Invalid Amount", 400);

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: validAmount.toFixed(2)
        },
        description: `QuickKit AI Deployment: ${projectName || 'Custom AI Agent'}`
      }]
    })
  });

  const data = await response.json();
  if (data.error || !data.id) throw new Error(data.error_description || "PayPal order creation failed.");
  return success(res, data);
}

async function handleCapture(req, res, userId) {
  const { orderID, projectId } = req.body;
  if (!projectId) throw new Error("Project ID mapping missing.");

  // Transaction Lock
  const projectRef = admin.firestore().collection('projects').doc(projectId);
  const result = await admin.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(projectRef);
    if (!doc.exists) throw new Error("Build record not found.");
    const project = doc.data();
    if (project.userId !== userId) throw new Error("Authorization mismatch.");
    if (project.advancePaid) throw new Error("Payment already finalized.");
    const expectedAmount = (project.price * 0.1).toFixed(2);
    return { expectedAmount, projectName: project.projectName };
  });

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  if (data.status !== "COMPLETED") throw new Error(`Verification failure: ${data.status}`);

  const capturedAmount = data.purchase_units[0].payments.captures[0].amount.value;
  if (capturedAmount !== result.expectedAmount) {
     throw new Error(`Financial Discrepancy: Captured $${capturedAmount} vs Expected $${result.expectedAmount}`);
  }

  const batch = admin.firestore().batch();
  const paymentRef = admin.firestore().collection("payments").doc(orderID);
  batch.set(paymentRef, {
    userId, projectId, projectName: result.projectName, orderID,
    amount: Number(capturedAmount), status: "COMPLETED", verified: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  batch.update(projectRef, {
    advancePaid: true,
    status: "IN_PROGRESS",
    paymentStatus: "SUCCESS_VERIFIED",
    progress: 10,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
  return success(res, { status: "VERIFIED", orderID });
}

async function handleWebhook(req, res) {
  const event = req.body;
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const resource = event.resource;
    const orderID = resource.supplementary_data?.related_ids?.order_id || resource.id;
    
    const paymentSnap = await admin.firestore().collection('payments').doc(orderID).get();
    if (paymentSnap.exists) {
        const pData = paymentSnap.data();
        if (!pData.webhookVerified) {
            await paymentSnap.ref.update({
                webhookVerified: true,
                webhookCapturedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            if (pData.projectId) {
                await admin.firestore().collection('projects').doc(pData.projectId).update({
                    paymentStatus: "WEBHOOK_CONFIRMED"
                }).catch(() => {});
            }
        }
    }
  }
  return success(res, { acknowledged: true });
}
