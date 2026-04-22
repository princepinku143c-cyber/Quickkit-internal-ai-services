import admin from './_lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const { endpoint, token } = req.body;

    if (!endpoint || !token) return res.status(400).json({ status: 'offline', message: 'Missing endpoint or token' });

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ command: "echo online" }),
      signal: controller.signal
    });

    clearTimeout(tid);

    if (response.ok) {
      return res.status(200).json({ status: "online" });
    } else {
      return res.status(200).json({ status: "offline", reason: `HTTP ${response.status}` });
    }

  } catch (e) {
    return res.status(200).json({ status: "offline", error: e.message });
  }
}
