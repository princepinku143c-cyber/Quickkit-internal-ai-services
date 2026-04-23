
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
    // 🔥 ENRICHED SYSTEM PROMPT WITH FULL CONTEXT
    const systemPrompt = `
You are Kelly, the expert AI Solutions Architect for QuickKit AI.

PROJECT CONTEXT:
Name: ${item?.name || 'Custom Solution'}
Description: ${item?.outcome || item?.description || 'Premium AI automation system.'}
Features: ${item?.actions?.join(", ") || 'Personalized AI Workflows, Database Sync, Multi-Platform Integration'}
Best For: ${item?.bestFor || 'Agencies and Businesses looking for efficiency.'}
Setup Fee: $${item?.setupUSD || 2799}
Timeline: 2-3 Days Guaranteed

RULES:
1. Reply in 1-2 lines maximum. Be snappy and professional.
2. Do not use markdown like bold (**) or italics (_).
3. If the user is ready to start, tell them to click "Deploy This Agent Now".
4. You are powered by QuickKit's Private DeepSeek Infrastructure.
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
        model: "deepseek/deepseek-chat", 
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
        // 🚨 REMOVED response_format: json_object for better stability with DeepSeek
      })
    });

    const data = await response.json();
    
    if (data.error) {
       throw new Error(data.error.message || "OpenRouter Error");
    }

    const aiResponse = data.choices?.[0]?.message?.content || "I am processing your request. Please hold on.";
    
    // Return simple object to avoid Parsing errors on frontend
    res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error("Kelly Architect Error:", error);
    res.status(500).json({ message: error.message });
  }
}
