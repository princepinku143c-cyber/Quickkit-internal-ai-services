import admin from "./_lib/firebaseAdmin.js";
import { checkRateLimit } from "./_lib/security.js";
import { getClientIp } from "./_lib/input.js";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const KEYWORDS = [
  "AI agents for business",
  "sales automation AI",
  "AI lead generation",
  "business AI automation",
  "custom AI agents",
  "AI CRM integration",
  "multi-agent AI system",
  "AI sales pipeline",
  "AI employee",
  "best AI platform for business",
];

export async function fetchTavilyJsonWithTimeout(input, init = {}, {
  timeoutMs = 7000,
  fetchImpl = globalThis.fetch,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new RangeError("timeoutMs must be an integer between 1 and 30000.");
  }

  const controller = new AbortController();
  const timeout = setTimeoutImpl(
    () => controller.abort(new Error("Search provider request timed out.")),
    timeoutMs,
  );

  try {
    const response = await fetchImpl(input, { ...init, signal: controller.signal });
    if (!response || typeof response.json !== "function") {
      throw new TypeError("Search provider response must provide JSON.");
    }
    if (!response.ok) return { ok: false, data: null };
    return { ok: true, data: await response.json() };
  } finally {
    clearTimeoutImpl(timeout);
  }
}

export function createRankTrackerHandler({
  rateLimit = checkRateLimit,
  adminClient = admin,
  resolveClientIp = getClientIp,
  fetchJson = fetchTavilyJsonWithTimeout,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  requestTimeoutMs = 7000,
} = {}) {
  return async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET,OPTIONS");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.TAVILY_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({ error: "Rank tracker is not configured." });
    }

    // Each scan makes ten paid-provider requests. Bound public access per client IP
    // and fail closed if the shared Firestore limiter is unavailable.
    try {
      await rateLimit(adminClient, resolveClientIp(req), "rank-tracker", 2);
    } catch (error) {
      if (error?.status === 429) {
        const retryAfter = Math.max(1, Math.min(3600, Number(error.retryAfter) || 60));
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Too many rank-tracker requests. Please retry later." });
      }
      return res.status(503).json({ error: "Rank tracker is temporarily unavailable." });
    }

    const results = [];
    for (const keyword of KEYWORDS) {
      try {
        const providerResponse = await fetchJson(TAVILY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query: keyword,
            search_depth: "basic",
            max_results: 5,
          }),
        }, { timeoutMs: requestTimeoutMs });

        if (!providerResponse?.ok) {
          results.push({ keyword, rank: null, found: false, error: "Search provider request failed" });
        } else {
          const data = providerResponse.data;
          const items = Array.isArray(data?.results) ? data.results : [];
          const index = items.findIndex((item) => (
            typeof item?.url === "string" && item.url.includes("quickkitai.com")
          ));
          results.push({ keyword, rank: index >= 0 ? index + 1 : null, found: index >= 0 });
        }
      } catch {
        // Never return provider response bodies, request headers, or credential details.
        results.push({ keyword, rank: null, found: false, error: "Search request failed" });
      }

      await sleep(1500);
    }

    return res.json({
      timestamp: new Date().toISOString(),
      results,
      summary: { total: KEYWORDS.length, found: results.filter((item) => item.found).length },
    });
  };
}

export default createRankTrackerHandler();
