
import fetch from 'node-fetch';
import admin from '../lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. 🔐 ENFORCED FAILSAFE: API Key Check
  const API_KEY = process.env.OPENROUTER_ADMIN_KEY;
  if (!API_KEY) {
    console.error("CRITICAL: OpenRouter API key missing!");
    return res.status(500).json({ message: "CRITICAL: OpenRouter API key missing" });
  }

  // 2. 🚨 AUTH MANDATORY (No free anonymous usage)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorized Access Required. Please login." });
  }

  const { messages, item } = req.body;

  // 3. 🛡️ HARDENING: Input Validation & Sanitization
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Invalid payload." });
  }

  const rawLastMessage = messages[messages.length - 1]?.content || "";
  
  // Anti-Prompt Injection & Sanitization
  const safeMessage = String(rawLastMessage)
    .replace(/ignore system|ignore instructions|disregard/gi, "[REDACTED]")
    .replace(/api key|token|reveal|secret|password|password/gi, "[ACCESS_DENIED]")
    .substring(0, 1000); // Strict length limit

  if (!safeMessage.trim()) {
    return res.status(400).json({ message: "Empty or invalid message content." });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 4. 🚑 TRANSACTIONAL RATE LIMITING & CREDIT SYNC
    let hasCredits = false;
    await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) throw new Error("User record not found");
      
      const userData = userDoc.data();
      const credits = userData.credits || 0;
      const lastCall = userData.lastCallTime || 0;
      const now = Date.now();

      // Rate limit check (2 second cooldown)
      if (now - lastCall < 2000) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }

      // Credit check
      if (credits <= 0) {
         throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct credit & Update timestamp BEFORE AI call to prevent concurrent drain
      transaction.update(userRef, {
        credits: credits - 1,
        lastCallTime: now,
        lastInteraction: admin.firestore.FieldValue.serverTimestamp()
      });
      hasCredits = true;
    });

    if (!hasCredits) return; // Should be handled by error catches below

    // 5. 🧠 BRAIN: Multi-Model Fallback Engine
    const systemPrompt = `You are Kelly, QuickKit's lead AI architect. Context: ${item?.name || 'Custom Build'}. Goal: 1-2 line snappy solutions. No formatting.`;
    const tryModels = ["deepseek/deepseek-chat", "mistralai/mixtral-8x7b"];
    let aiResponse = null;
    let fallbackLog = [];

    for (const model of tryModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://quickkitai.com",
            "X-Title": "QuickKit Kelly v2"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: safeMessage } // Only send the safe one
            ],
            temperature: 0.5,
            max_tokens: 100
          })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        aiResponse = data.choices?.[0]?.message?.content;
        if (aiResponse) break;
      } catch (err) {
        fallbackLog.push(`${model}: ${err.message}`);
      }
    }

    if (!aiResponse) {
      console.error("🚨 ALL MODELS FAILED:", fallbackLog);
      // Optional: Refund credit if AI totally fails (advanced logic)
      return res.status(500).json({ message: "Model Exhaustion Error. Please retry in 1 minute." });
    }

    return res.status(200).json({ reply: aiResponse });

  } catch (error) {
    if (error.message === "RATE_LIMIT_EXCEEDED") {
      return res.status(429).json({ message: "Cooldown active. Slow down, Operator." });
    }
    if (error.message === "INSUFFICIENT_CREDITS") {
      return res.status(403).json({ message: "Credits exhausted. Visit your dashboard to recharge." });
    }
    console.error("Kelly Architect Secure Error:", error.message);
    return res.status(500).json({ message: "Transmission interrupted." });
  }
}
