
import fetch from "node-fetch";
import admin from "../lib/firebaseAdmin.js";
import { getPayPalAccessToken, BASE_URL } from "../lib/paypalAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Mandatory Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized: Missing Session Token" });
  
  const { amount, projectName } = req.body;

  // 2. Strict Amount Validation
  const validAmount = Number(amount);
  if (isNaN(validAmount) || validAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount verification failed." });
  }

  try {
    // 3. Verify Identity before Triggering Payment
    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);

    const accessToken = await getPayPalAccessToken();

    // 4. Create Order with Advanced Metadata
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
            value: validAmount.toFixed(2) // Ensure 2 decimal places
          },
          description: `QuickKit AI Deployment: ${projectName || 'Custom AI Agent'}`
        }]
      })
    });

    const data = await response.json();
    
    if (data.error || !data.id) {
       console.error("PayPal API Error:", data);
       throw new Error("Failed to initialize PayPal order.");
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Order Creation Failed:", err);
    res.status(500).json({ error: err.message });
  }
}
