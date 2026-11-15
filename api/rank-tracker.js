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

export default async function handler(req, res) {
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

  const results = [];
  for (const keyword of KEYWORDS) {
    try {
      const response = await fetch(TAVILY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: keyword,
          search_depth: "basic",
          max_results: 5,
        }),
      });

      if (!response.ok) {
        results.push({ keyword, rank: null, found: false, error: "Search provider request failed" });
      } else {
        const data = await response.json();
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

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return res.json({
    timestamp: new Date().toISOString(),
    results,
    summary: { total: KEYWORDS.length, found: results.filter((item) => item.found).length },
  });
}
