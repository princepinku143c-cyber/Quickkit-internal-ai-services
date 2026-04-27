import fetch from "node-fetch";

/**
 * Hardened AI Intelligence Service.
 * Implements context pruning, token constraints, and industrial timeout guards.
 */
export const askAI = async (messages) => {
  // 1. Payload Sanitization & Context Pruning (Save Costs + Stay Relevant)
  const safeHistory = (Array.isArray(messages) ? messages : []).slice(-6); 
  const lastMsg = safeHistory[safeHistory.length - 1]?.content || '';
  
  if (!lastMsg || lastMsg.length > 2000) {
    throw new Error("Neural payload exceeds safety constraints (Max 2000 chars).");
  }

  // 2. Industrial Timeout Guard (10s for Vercel Hobby stability)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); 

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_ADMIN_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quickkitai.com",
        "X-Title": "QuickKit AI"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: safeHistory.map(m => ({
            role: m.role || 'user',
            content: m.content || ''
        })),
        max_tokens: 300, // Strict token control to optimize costs
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Intelligence Node Failure: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    
    if (!reply) throw new Error("Empty intelligence response generated.");
    return reply;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("Intelligence link timeout: Request was too complex for current node.");
    throw err;
  }
};
