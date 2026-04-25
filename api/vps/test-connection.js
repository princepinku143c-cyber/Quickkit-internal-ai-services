
import admin from "../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { endpoint, token } = req.body;

  if (!endpoint) {
    return res.status(400).json({ status: "DISCONNECTED", message: "Missing endpoint" });
  }

  try {
    console.log(`🚀 [VPS_HEALTH] Testing connection to: ${endpoint}`);
    
    // Timeout-wrapped fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`VPS responded with ${response.status}: ${text}`);
    }

    return res.status(200).json({ 
        status: "CONNECTED",
        latency: "Optimal",
        version: "1.2.0-Alpha"
    });
  } catch (err) {
    console.error("❌ [VPS_HEALTH_ERROR]:", err.message);
    return res.status(200).json({ 
        status: "DISCONNECTED", 
        error: err.message 
    });
  }
}
