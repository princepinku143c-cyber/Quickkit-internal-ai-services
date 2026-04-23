
import fetch from "node-fetch";
import admin from "../lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "../lib/paypalAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { orderID, projectName } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization" });

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 1. 🚨 CRITICAL: Duplicate Payment Protection
    const existingPayment = await admin.firestore().collection("payments").doc(orderID).get();
    if (existingPayment.exists) {
      console.warn(`Double Capture Prevented for Order ID: ${orderID}`);
      return res.status(400).json({ error: "Transaction already processed. Access denied." });
    }

    const accessToken = await getPayPalAccessToken();

    // 2. Capture the payment
    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    // 3. 🚨 STRENGTHENED: Validation logic
    if (!data || data.status !== "COMPLETED") {
       console.error("Payment Capture Failed Audit:", data);
       throw new Error(`Payment verification failed. Current Status: ${data?.status || 'UNKNOWN'}`);
    }

    // 4. Atomic CRM Update
    const batch = admin.firestore().batch();
    
    // Log payment
    const paymentRef = admin.firestore().collection("payments").doc(orderID);
    batch.set(paymentRef, {
      userId,
      projectName,
      orderID,
      amount: data.purchase_units[0].payments.captures[0].amount.value,
      status: "COMPLETED",
      raw_payload: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Initialize Project
    const projectRef = admin.firestore().collection("projects").doc();
    batch.set(projectRef, {
      userId,
      projectName,
      status: "IN_PROGRESS",
      paymentStatus: "ADVANCE_PAID",
      sourceOrderId: orderID,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    console.log(`✅ Payment Captured for User ${userId}: ${orderID}`);
    res.status(200).json(data);

  } catch (err) {
    console.error("Capture Runtime Error:", err);
    res.status(500).json({ error: err.message });
  }
}
