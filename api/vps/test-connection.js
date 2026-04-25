import { success, error } from '../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  const { endpoint, token } = req.body;

  if (!endpoint) return error(res, "Secure endpoint required for telemetry check.", 400);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

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
        throw new Error(`VPS Cluster Offline (Status: ${response.status})`);
    }

    return success(res, { 
        status: "CONNECTED",
        node: "Optimal",
        version: "1.2.0-Alpha-Stable"
    });

  } catch (err) {
    console.error("VPS_HEALTH_CRASH:", err);
    return error(res, err.message);
  }
}
