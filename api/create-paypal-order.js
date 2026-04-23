
import fetch from "node-fetch";
import admin from "../lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "../lib/paypalAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Mandatory Security Check (Firebase ID Token)
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized: Missing Session Token" });
  
  const { amount, projectName } = req.body;

  try {
    // 2. Verify Identity
    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);

    const accessToken = await getPayPalAccessToken();

    // 3. Create Order
    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: Number(amount).toFixed(2)
          },
          description: `QuickKit AI Deployment: ${projectName || 'Custom AI Agent'}`
        }]
      })
    });

    const data = await response.json();
    if (data.error || !data.id) throw new Error(data.error_description || "PayPal order creation failed.");

    res.status(200).json(data);

  } catch (err) {
    console.error("Order Creation Failed:", err);
    res.status(500).json({ error: err.message });
  }
}
