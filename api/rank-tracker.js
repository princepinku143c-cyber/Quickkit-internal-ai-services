export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    console.error("TAVILY_API_KEY is not configured for this environment.");
    return res.status(503).json({ error: "Search provider is not configured." });
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
    "best AI platform for business",
  ];
  const results = [];

  for (const kw of keywords) {
    try {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: kw,
          search_depth: "basic",
          max_results: 5,
        }),
      });

      if (!resp.ok) {
        results.push({ keyword: kw, error: "Search provider request failed." });
      } else {
        const data = await resp.json();
        const found = data.results?.find((r) => r.url?.includes("quickkitai.com"));
        results.push({
          keyword: kw,
          rank: found ? data.results.indexOf(found) + 1 : null,
          found: !!found,
        });
      }
    } catch {
      results.push({ keyword: kw, error: "Search provider request failed." });
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "https://quickkitai.com");
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: keywords.length,
      found: results.filter((result) => result.found).length,
      errors: results.filter((result) => result.error).length,
    },
  });
}
