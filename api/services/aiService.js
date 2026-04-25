import fetch from "node-fetch";

export const askAI = async (messages) => {
  // Security & Stability Guards (Verify last message)
  const lastMsg = Array.isArray(messages) ? messages[messages.length - 1]?.content : '';
  if (!lastMsg || lastMsg.length > 3000) throw new Error("Neural link payload exceeds safety limits (Max 3000 chars).");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds link limit

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
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "OpenRouter Node Overload");
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "Neural link stable. I am ready for analysis.";

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("Neural link timeout. Please simplify the request.");
    throw err;
  }
};
