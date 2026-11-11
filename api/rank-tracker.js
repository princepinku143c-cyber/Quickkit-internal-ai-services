import admin from "./_lib/firebaseAdmin.js";
import { checkRateLimit } from "./_lib/security.js";

const TAVILY_API_URL = "https://api.tavily.com/search";

const sendError = (res, status, error, code) =>
  res.status(status).json({ error, ...(code ? { code } : {}) });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization");
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return sendError(res, 405, "Method not allowed.");
  }

  const authorization = req.headers && req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return sendError(res, 401, "Sign-in is required.");
  }

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(authorization.slice(7));
    uid = decoded.uid;
    const userSnapshot = await admin.firestore().collection("users").doc(uid).get();
    const userData = userSnapshot.data() || {};
    if (userData.role !== "admin" && decoded.admin !== true) {
      return sendError(res, 403, "Administrator access is required.");
    }
    await checkRateLimit(admin, uid, "rank-tracker", 1);
  } catch (error) {
    if (error && error.status === 429) {
      if (error.retryAfter) res.setHeader("Retry-After", String(error.retryAfter));
      return sendError(res, 429, "Rank tracking rate limit reached. Please retry later.");
    }
    console.error("RANK_TRACKER_AUTH_FAILED", error && error.message || "unknown");
    return sendError(res, 503, "Rank tracking authorization is temporarily unavailable.");
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return sendError(res, 503, "Rank tracking is not configured.", "TAVILY_API_KEY_MISSING");
  }

  const keywords = [
    "AI agents for business",
    "sales automation AI",
    "AI lead generation",
    "business AI automation",
    "custom AI agents",
    "AI CRM integration",
    "multi-agent AI system",
    "AI sales pipeline",
    "AI employee",
    "best AI platform for business"
  ];

  const results = [];
  for (const keyword of keywords) {
    try {
      const response = await fetch(TAVILY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: keyword,
          search_depth: "basic",
          max_results: 5
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        results.push({ keyword, error: "Search provider request failed." });
      } else {
        const data = await response.json();
        const found = data.results?.find(result =>
          typeof result.url === "string" && result.url.includes("quickkitai.com")
        );
        results.push({
          keyword,
          rank: found ? data.results.indexOf(found) + 1 : null,
          found: Boolean(found)
        });
      }
    } catch {
      results.push({ keyword, error: "Search request failed or timed out" });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: keywords.length,
      found: results.filter(result => result.found).length,
      errors: results.filter(result => result.error).length
    }
  });
}
