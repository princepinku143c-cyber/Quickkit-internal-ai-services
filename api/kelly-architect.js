import admin from './_lib/firebaseAdmin.js';
import { askAI } from './services/aiService.js';
import { success, error } from './_lib/response.js';
import { checkRateLimit } from './_lib/security.js';

const SYSTEM_PROMPT = `You are Kelly, the lead AI Architect at QuickKit. 
Your goal is to scoping automation solutions. 
Keep responses highly technical, concise, and conversion-focused.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  const authHeader = req.headers.authorization;
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

  try {
    let userId = 'GUEST';
    if (idToken) {
       const decoded = await admin.auth().verifyIdToken(idToken);
       userId = decoded.uid;
    }

    // 1. Rate Limit Check (5s for AI to protect tokens)
    const rate = await checkRateLimit(userId, userId === 'GUEST' ? 10000 : 5000);
    if (!rate.allowed) return error(res, `Neural link stabilizing. Retry in ${Math.ceil(rate.retryIn / 1000)}s.`, 429);

    const { message, history } = req.body;

    const messagesSafe = (Array.isArray(history) ? history : []).slice(-8).map(m => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 500)
    }));

    const aiReply = await askAI([
        { role: "system", content: SYSTEM_PROMPT },
        ...messagesSafe,
        { role: "user", content: message }
    ]);

    // Simple Billing
    if (userId) {
      await admin.firestore().collection('users').doc(userId).update({
        credits: admin.firestore.FieldValue.increment(-1),
        lastAiInteraction: admin.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }

    return success(res, { reply: aiReply });

  } catch (err) {
    console.error("KELLY_API_CRASH:", err);
    return error(res, err.message, 502);
  }
}
