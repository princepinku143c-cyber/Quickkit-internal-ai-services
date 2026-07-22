const TAVILY_KEY = "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";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const keywords = ["AI agents for business","sales automation AI","AI lead generation","business AI automation","custom AI agents","AI CRM integration","multi-agent AI system","AI sales pipeline","AI employee","best AI platform for business"];
  const results = [];
  for (const kw of keywords) {
    try {
      const resp = await fetch("https://api.tavily.com/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:TAVILY_KEY,query:kw,search_depth:"basic",max_results:5})});
      const data = await resp.json();
      const found = data.results?.find(r => r.url?.includes("quickkitai.com"));
      results.push({keyword:kw,rank:found?data.results.indexOf(found)+1:null,found:!!found});
    } catch(e) { results.push({keyword:kw,error:e.message}); }
    await new Promise(r => setTimeout(r, 1500));
  }
  res.setHeader("Access-Control-Allow-Origin","*");
  res.json({timestamp:new Date().toISOString(),results,summary:{total:keywords.length,found:results.filter(r=>r.found).length}});
};