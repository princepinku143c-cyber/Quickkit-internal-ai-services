
import admin from '../lib/firebaseAdmin';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Verify Auth
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userId = decoded.uid;

    const { agentId, details } = req.body;

    // 2. 🔥 SYSTEM AI CALL (Using ADMIN Key, not client)
    // We use OpenRouter with a powerful model (Claude 3.5 Sonnet or GPT-4o) 
    // to generate the actual deployment configuration.
    
    const OPENROUTER_ADMIN_KEY = process.env.OPENROUTER_ADMIN_KEY;
    
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_ADMIN_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quickkitai.com",
        "X-Title": "QuickKit Admin System"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: "You are the QuickKit Deployment Engine. Create a technical deployment plan for an AI Agent."
          },
          {
            role: "user",
            content: `Deploy Agent: ${agentId}. Context: ${JSON.stringify(details)}`
          }
        ]
      })
    });

    const aiData = await aiRes.json();
    const plan = aiData.choices?.[0]?.message?.content || "No plan generated.";

    // 3. Save to Firestore for the user to see in their Dashboard
    await admin.firestore().collection('deployments').add({
      userId,
      agentId,
      status: 'PROVISIONING',
      plan,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // 4. Update User Credits (Deduct for deployment)
    await admin.firestore().collection('users').doc(userId).update({
      credits: admin.firestore.FieldValue.increment(-100) // Deployment cost
    });

    res.json({ success: true, plan });

  } catch (e) {
    console.error("Deployment failed:", e);
    res.status(500).json({ message: e.message });
  }
}
