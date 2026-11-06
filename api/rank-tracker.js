const TAVILY_API_URL = "https://api.tavily.com/search";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Rank tracking is not configured",
      code: "TAVILY_API_KEY_MISSING"
    });
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
        results.push({ keyword, error: `Search provider returned HTTP ${response.status}` });
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

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
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
