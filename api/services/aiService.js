import fetch from "node-fetch";

/**
 * Hardened AI Intelligence Service.
 * Uses Google Gemini Pro for Industrial-grade stability.
 */
export const askAI = async (messages) => {
  const safeHistory = (Array.isArray(messages) ? messages : []).slice(-8); 
  const lastMsg = safeHistory[safeHistory.length - 1]?.content || '';
  
  if (!lastMsg || lastMsg.length > 3000) {
    throw new Error("Neural payload exceeds safety constraints.");
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI Infrastructure Offline: Missing API Key.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); 

  try {
    // Gemini 1.5 Flash - Ultra fast and reliable for scoping
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Transform chat history to Gemini format
    const contents = safeHistory.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents,
        generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("GEMINI_NODE_ERROR:", errData);
        throw new Error(`Intelligence Node Failure: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) throw new Error("Neural node returned empty response.");
    return reply;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("Neural link timeout.");
    throw err;
  }
};
