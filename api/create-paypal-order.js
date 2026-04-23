
import fetch from "node-fetch";
import admin from "../lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "../lib/paypalAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized: Session Missing" });
  
  const { amount, projectName } = req.body;

  // 2. 🚨 CRITICAL: Amount Validation
  const validAmount = Number(amount);
  if (isNaN(validAmount) || validAmount <= 0) {
    console.error("Payment Attack Detected: Invalid Amount", amount);
    return res.status(400).json({ error: "Invalid payment amount. Access Denied." });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);

    const accessToken = await getPayPalAccessToken();

    // 3. Create Order
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
    
    if (data.error || !data.id) {
       console.log("Create Order Trace:", data);
       throw new Error(data.error_description || "PayPal order creation failed.");
    }

    console.log(`✅ Order Created: ${data.id} | Amount: ${validAmount} USD`);
    res.status(200).json(data);

  } catch (err) {
    console.error("Order Creation Failed:", err);
    res.status(500).json({ error: err.message });
  }
}
