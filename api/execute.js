import admin from './_lib/firebaseAdmin';
import fetch from 'node-fetch';

const ALLOWED = ["ls", "uptime", "df", "whoami", "pwd"];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;
    const { command } = req.body;

    if (!command) return res.status(400).json({ message: "No command provided" });

    // 🛡️ SECURITY BLOCK
    if (command.length > 100) return res.status(400).json({ message: "Command too long" });
    if (command.includes(";") || command.includes("&&") || command.includes("|") || command.includes(">")) {
      return res.status(403).json({ message: "Chained commands or redirects are blocked for security" });
    }

    const safeCommand = command.toLowerCase().trim();
    const isAllowed = ALLOWED.some(cmd => safeCommand === cmd || safeCommand.startsWith(cmd + " "));

    if (!isAllowed) {
      return res.status(403).json({ message: "Command not in security whitelist" });
    }

    // 💰 CREDIT SYSTEM (Safe Transaction)
    const userRef = admin.firestore().collection('users').doc(userId);
    try {
        await admin.firestore().runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists) throw new Error("User record missing");
          
          const credits = userDoc.data().credits || 0;
          if (credits < 10) throw new Error("Insufficient credits (10 required)");
          
          t.update(userRef, { credits: credits - 10 });
        });
    } catch (txError) {
        return res.status(402).json({ message: txError.message });
    }

    // 🔑 GET VPS CONFIG
    const snap = await admin.firestore().collection('users').doc(userId).collection('private').doc('settings').get();
    if (!snap.exists) return res.status(400).json({ message: "VPS not configured in Settings" });

    const { vpsEndpoint, vpsToken } = snap.data();
    if (!vpsEndpoint) return res.status(400).json({ message: "VPS Endpoint missing" });

    // ⚡ EXECUTION
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(vpsEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vpsToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ command }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const output = await response.text();

    // 🧾 LOGGING
    await admin.firestore().collection('execution_logs').add({
      user: userId,
      command,
      outputPreview: output.slice(0, 500),
      status: response.ok ? "success" : "error",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ output });

  } catch (e) {
    console.error("Execution Error:", e);
    return res.status(500).json({ message: "Backend execution failed" });
  }
}
