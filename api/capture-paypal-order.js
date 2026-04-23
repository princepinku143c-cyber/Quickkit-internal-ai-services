
import fetch from "node-fetch";
import admin from "../lib/firebaseAdmin";
import { getPayPalAccessToken, BASE_URL } from "../lib/paypalAdmin";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Mission Critical Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized: Access Denied" });

  const { orderID, projectName } = req.body;
  if (!orderID) return res.status(400).json({ message: "Invalid Request: Missing Order ID" });

  try {
    // 2. Authenticate the Requester
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const accessToken = await getPayPalAccessToken();

    // 3. Capture Payment via PayPal
    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data.status === "COMPLETED") {
      const amount = data.purchase_units[0].payments.captures[0].amount.value;

      // 4. 🔥 ATOMIC IDEMPOTENCY: Use OrderID as DocID to prevent duplicates
      const batch = admin.firestore().batch();
      
      const paymentRef = admin.firestore().collection("payments").doc(orderID);
      batch.set(paymentRef, {
        userId,
        orderID,
        projectName,
        amount,
        status: "COMPLETED",
        type: "ADVANCE",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // 5. Initialize Project State
      const projectRef = admin.firestore().collection("projects").doc(); // Unique project ID
      batch.set(projectRef, {
        userId,
        projectName,
        orderID, // Link back to payment
        status: "PROJECT_STARTED",
        paymentStatus: "ADVANCE_PAID",
        setupFee: (Number(amount) * 10).toFixed(2), // Total calculated from advance
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();
      console.log(`✅ Payment Captured for Order: ${orderID}. Project Initialized.`);
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Capture Logic Failed:", err);
    res.status(500).json({ error: err.message });
  }
}
