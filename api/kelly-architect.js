
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { messages, item } = req.body;

  // 🚨 SECURITY: API Key stays on the server
  const ADMIN_OPENROUTER_KEY = process.env.OPENROUTER_ADMIN_KEY;

  if (!ADMIN_OPENROUTER_KEY) {
    return res.status(500).json({ message: "System Configuration Error: Admin Key Missing" });
  }

  try {
    const systemPrompt = `You are Kelly, the AI Solutions Architect for QuickKit AI. 
    You are professional, snappy, and expert in AI automation.
    Your goal is to help the user understand how the ${item?.name || 'requested automation'} will be built.
    
    CRITICAL:
    1. Model: You are using DeepSeek V3 (powered by QuickKit Admin).
    2. Pricing: Simple: $799, Pro: $1599, Enterprise: $3499.
    3. Timeline: ALWAYS 2-3 Days.
    4. Style: Snappy, 1-2 sentences max. No markdown formatting like bold/italics unless necessary for code.
    
    If the user asks to "Deploy" or "Finalize", tell them to click the "Deploy Now" button on the screen.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ADMIN_OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quickkitai.com",
        "X-Title": "QuickKit Kelly Architect"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // DeepSeek V3 is incredibly cheap and smart
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    // Safety check for OpenRouter response
    if (data.error) {
       throw new Error(data.error.message || "OpenRouter Error");
    }

    const aiResponse = data.choices?.[0]?.message?.content || "{}";
    res.status(200).json(JSON.parse(aiResponse));

  } catch (error) {
    console.error("Kelly Architect Error:", error);
    res.status(500).json({ message: error.message });
  }
}
