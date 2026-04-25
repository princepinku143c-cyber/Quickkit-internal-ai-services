
import admin from '../lib/firebaseAdmin.js';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_ADMIN_KEY;
const GUEST_MESSAGE_LIMIT = 20;

const MODELS = [
  "deepseek/deepseek-chat",
  "meta-llama/llama-3-8b-instruct" // High performance + Low Cost Fallback
];

const SYSTEM_PROMPT = `You are Kelly, Senior AI Architect at QuickKit.
Goal: Convert user into a paying client.
Rules: 1–2 lines only. No fluff. Always guide toward deployment. Highlight speed (2–3 days). Mention: $299 advance to start immediately.
Tone: Confident, expert, persuasive.
Never: Talk about AI models, OpenRouter, or give long explanations.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { message, history } = req.body;
  const authHeader = req.headers.authorization;

  // 1. ROBUST IDENTITY & SECURITY
  if (!message || message.length > 2000) {
    return res.status(400).json({ message: "Request too verbose or invalid." });
  }

  let userId = null;
  let isGuest = true;
  let userData = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      userId = decoded.uid;
      isGuest = false;
      
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      userData = userDoc.exists ? userDoc.data() : null;
    } catch (e) {
      console.warn("Auth sync failure.");
    }
  }

  // 2. GUEST FINGERPRINTING & RATE LIMITS
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'cluster';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const guestId = (rawIp + userAgent).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);

  if (isGuest) {
    const guestRef = admin.firestore().collection("guest_usage").doc(guestId);
    const guestDoc = await guestRef.get();
    let count = guestDoc.exists ? (guestDoc.data().count || 0) : 0;

    if (count >= GUEST_MESSAGE_LIMIT) {
      return res.status(403).json({ message: "LIMIT_REACHED", action: "LOGIN_REQUIRED" });
    }
    await guestRef.set({ count: count + 1, lastActive: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  } else {
    // CREDIT & SPEED CHECK
    if (!userData || (userData.credits || 0) <= 0) {
      return res.status(402).json({ message: "Neural credits depleted. Please recharge." });
    }
    
    // 2-Second Interaction Guard
    const lastCall = userData?.lastAiInteraction?.toMillis() || 0;
    if (Date.now() - lastCall < 2000) {
       return res.status(429).json({ message: "Calibrating systems. Please wait 2s." });
    }
  }

  // 3. AI ORCHESTRATION (STABLE)
  const OPENROUTER_ADMIN_KEY = process.env.OPENROUTER_ADMIN_KEY;
  if (!OPENROUTER_ADMIN_KEY) return res.status(500).json({ message: "Intelligence Node Offline. Admin config required." });

  const messagesSafe = (history || []).slice(-10).map(m => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 500)
  }));

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_ADMIN_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quickkitai.com",
        "X-Title": "QuickKit AI"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messagesSafe,
          { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "Neural link stable. I am ready for architectural scoping.";

    // Simple Billing
    if (userId && !isGuest) {
      await admin.firestore().collection('users').doc(userId).update({
        credits: admin.firestore.FieldValue.increment(-1),
        lastAiInteraction: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("KELLY_CRASH:", error);
    return res.status(502).json({ message: "Neural link timeout. Please retry." });
  }
}
