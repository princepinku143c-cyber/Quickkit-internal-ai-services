import admin from './_lib/firebaseAdmin';
import crypto from 'crypto';

const AES_KEY = process.env.AES_SECRET_KEY;
const AES_IV = process.env.AES_SECRET_IV;

function decryptToken(encryptedHex) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(AES_KEY), Buffer.from(AES_IV));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    throw new Error("CRITICAL: Token decryption failed");
  }
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const settingsSnap = await admin.firestore().collection('users').doc(userId).collection('private').doc('settings').get();
    if (!settingsSnap.exists) return res.status(404).json({ message: 'VPS not configured' });

    const { vpsEndpoint: endpoint, vpsToken: encryptedToken } = settingsSnap.data();
    const token = decryptToken(encryptedToken);

    // REAL PING (POST with echo command + Timeout)
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000); // 8s timeout for ping

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ command: "echo ping_ok" }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(tid);

    if (!response || !response.ok) {
       return res.status(500).json({ status: 'offline', message: 'VPS unreachable or command rejected' });
    }

    const text = await response.text();
    if (!text.includes('ping_ok')) {
       return res.status(500).json({ status: 'limited', message: 'VPS reachable but command execution failed' });
    }

    return res.status(200).json({ status: 'online', message: 'VPS connected & verified' });

  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
