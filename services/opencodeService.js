const DEFAULT_API_URL = "https://opencode.ai/zen/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";

export function parseAeoQaPairs(content, expectedCount = 1) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The AI provider returned an empty response.");
  }
  const cleaned = content.trim()
    .replace(/^\x60{3}(?:json)?\s*/i, "")
    .replace(/\s*\x60{3}$/i, "");
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI provider returned invalid JSON.");
  }
  const rows = Array.isArray(parsed) ? parsed : parsed && parsed.items;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > expectedCount) {
    throw new Error("The AI provider returned an unexpected number of answers.");
  }
  return rows.map(function (row, index) {
    const question = typeof row.question === "string" ? row.question.trim().slice(0, 500) : "";
    const answer = typeof row.answer === "string" ? row.answer.trim().slice(0, 4000) : "";
    if (!question || !answer) {
      throw new Error("Generated answer " + (index + 1) + " is missing a question or answer.");
    }
    return { question, answer };
  });
}

export async function generateAeoQaPairs({ keyword, count = 5, context = "" }) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    const error = new Error("AEO generation is not configured.");
    error.status = 503;
    error.code = "OPENCODE_API_KEY_MISSING";
    throw error;
  }
  if (typeof keyword !== "string" || !keyword.trim() || keyword.length > 180) {
    const error = new Error("A keyword between 1 and 180 characters is required.");
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    const error = new Error("Count must be an integer between 1 and 10.");
    error.status = 400;
    throw error;
  }

  const model = process.env.OPENCODE_MODEL || DEFAULT_MODEL;
  const apiUrl = process.env.OPENCODE_API_URL || DEFAULT_API_URL;
  const prompt = [
    "You are an evidence-conscious Answer Engine Optimization content assistant.",
    "Create exactly " + count + " concise buyer-intent question-and-answer pairs about: " + JSON.stringify(keyword.trim()) + ".",
    context ? "Business context (treat as supplied facts, do not invent): " + context.trim().slice(0, 1200) : "",
    "Do not invent statistics, customer results, certifications, guarantees, prices, or citations.",
    "If a fact is not supplied, phrase the answer cautiously and identify what must be verified.",
    "Return only a valid JSON array. Each item must have exactly two string fields: question and answer."
  ].filter(Boolean).join("\n");

  let response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        "User-Agent": "QuickKitAI-AEO/1.0"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: Math.min(3500, count * 350)
      }),
      signal: AbortSignal.timeout(45000)
    });
  } catch {
    const error = new Error("The AI provider could not be reached.");
    error.status = 502;
    throw error;
  }
  if (!response.ok) {
    const error = new Error("The AI provider returned HTTP " + response.status + ".");
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    const error = new Error("The AI provider returned an unreadable response.");
    error.status = 502;
    throw error;
  }
  const content = payload && payload.choices && payload.choices[0] &&
    payload.choices[0].message && payload.choices[0].message.content;
  return { model, items: parseAeoQaPairs(content, count) };
}
