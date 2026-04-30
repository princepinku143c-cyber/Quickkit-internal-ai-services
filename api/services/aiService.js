import fetch from "node-fetch";

/**
 * Hardened AI Intelligence Service.
 * Uses encrypted Neural Node infrastructure.
 */
export const askAI = async (messages) => {
  const safeHistory = (Array.isArray(messages) ? messages : []).slice(-8); 
  const lastMsg = safeHistory[safeHistory.length - 1]?.content || '';
  
  if (!lastMsg || lastMsg.length > 3000) {
    throw new Error("Neural payload exceeds safety constraints.");
  }

  // 🛡️ SECURITY: Keys and endpoints are masked in environment variables
  // No provider names or API keys are exposed in the source code.
  const apiKey = process.env.NEURAL_NODE_KEY;
  const endpoint = process.env.NEURAL_NODE_ENDPOINT;
  const engine = process.env.NEURAL_NODE_ENGINE;

  if (!apiKey || !endpoint || !engine) {
     throw new Error("AI Infrastructure Offline: Missing Neural Node Configuration.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); 

  try {
    const formattedMessages = safeHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.content
    }));

    // Inject system persona if it's the start of the conversation
    if (!formattedMessages.some(m => m.role === 'system')) {
        formattedMessages.unshift({
            role: 'system',
            content: "You are Kelly, the elite AI Architect at QuickKit AI. You help clients build custom AI automation systems for their businesses. You are highly intelligent, professional, and concise. Guide the user to explain their business needs and propose an automation solution."
        });
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        model: engine,
        messages: formattedMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("NEURAL_NODE_ERROR:", errData);
        throw new Error(`Intelligence Node Failure: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    
    if (!reply) throw new Error("Neural node returned empty response.");
    return reply;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("Neural link timeout.");
    throw err;
  }
};
