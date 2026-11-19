import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * GEO & Citability Audit Engine (Inspired by zubair-trabzada/geo-seo-claude)
 * Evaluates website readiness for ChatGPT, Perplexity, Claude, Gemini & Google AI Overviews.
 */

async function fetchUrl(targetUrl, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; QuickKitGEOBot/1.0; +https://quickkitai.com/llms.txt)'
        },
        timeout: timeoutMs
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    } catch (e) {
      reject(e);
    }
  });
}

export async function runGeoAudit(targetDomain = 'https://quickkitai.com') {
  console.log(`\n======================================================`);
  console.log(`🚀 RUNNING GEO & AI CITABILITY AUDIT FOR: ${targetDomain}`);
  console.log(`======================================================\n`);

  const results = {
    domain: targetDomain,
    timestamp: new Date().toISOString(),
    scores: {
      aiCrawlerReadiness: 0,
      schemaArchitecture: 0,
      citabilityStructure: 0,
      technicalPerformance: 0,
      compositeScore: 0
    },
    findings: [],
    checklist: []
  };

  // 1. Check AI Crawler Readiness (robots.txt, llms.txt, llms-full.txt)
  try {
    const robots = await fetchUrl(`${targetDomain}/robots.txt`);
    if (robots.statusCode === 200) {
      const allowsAi = robots.body.includes('GPTBot') || robots.body.includes('PerplexityBot') || robots.body.includes('ClaudeBot');
      results.checklist.push({ item: 'robots.txt AI Crawlers Configured', status: allowsAi ? 'PASS' : 'WARN', points: allowsAi ? 15 : 10 });
      results.scores.aiCrawlerReadiness += allowsAi ? 15 : 10;
    } else {
      results.checklist.push({ item: 'robots.txt Available', status: 'FAIL', points: 0 });
    }
  } catch (e) {
    results.checklist.push({ item: 'robots.txt Fetch', status: 'FAIL', points: 0, error: e.message });
  }

  try {
    const llms = await fetchUrl(`${targetDomain}/llms.txt`);
    if (llms.statusCode === 200 && llms.body.length > 50) {
      results.checklist.push({ item: 'llms.txt Protocol Active', status: 'PASS', points: 15 });
      results.scores.aiCrawlerReadiness += 15;
    } else {
      results.checklist.push({ item: 'llms.txt Protocol Active', status: 'FAIL', points: 0 });
    }
  } catch (e) {
    results.checklist.push({ item: 'llms.txt Fetch', status: 'FAIL', points: 0 });
  }

  // 2. Main Page Audit (HTML, Schema, Citability)
  try {
    const start = Date.now();
    const page = await fetchUrl(targetDomain);
    const latency = Date.now() - start;

    // Latency
    if (latency < 1500) {
      results.checklist.push({ item: `Core Web Vitals (<1.5s Response): ${latency}ms`, status: 'PASS', points: 20 });
      results.scores.technicalPerformance += 20;
    } else {
      results.checklist.push({ item: `Latency Optimization Needed: ${latency}ms`, status: 'WARN', points: 10 });
      results.scores.technicalPerformance += 10;
    }

    // Schema Check
    const hasSchema = page.body.includes('application/ld+json');
    const hasGraph = page.body.includes('@graph');
    const hasOrg = page.body.includes('Organization') || page.body.includes('LocalBusiness');
    const hasFAQ = page.body.includes('FAQPage');

    if (hasSchema) {
      let schemaPoints = 10;
      if (hasGraph) schemaPoints += 10;
      if (hasOrg) schemaPoints += 5;
      if (hasFAQ) schemaPoints += 5;
      results.checklist.push({ item: 'JSON-LD Structured Schema (@graph, Org, FAQ)', status: 'PASS', points: schemaPoints });
      results.scores.schemaArchitecture += schemaPoints;
    } else {
      results.checklist.push({ item: 'JSON-LD Schema Missing', status: 'FAIL', points: 0 });
    }

    // Citability & Content
    const hasCanonical = page.body.includes('rel="canonical"');
    const hasBLUF = page.body.includes('h1') && (page.body.includes('AI') || page.body.includes('Systems'));
    let citabilityPoints = 0;
    if (hasCanonical) citabilityPoints += 10;
    if (hasBLUF) citabilityPoints += 10;
    results.checklist.push({ item: 'Canonical Link & BLUF Headings for AI Citations', status: 'PASS', points: citabilityPoints });
    results.scores.citabilityStructure += citabilityPoints;

  } catch (e) {
    results.checklist.push({ item: 'Target Domain Access', status: 'FAIL', points: 0, error: e.message });
  }

  // Calculate Composite Score
  results.scores.compositeScore = 
    results.scores.aiCrawlerReadiness + 
    results.scores.schemaArchitecture + 
    results.scores.citabilityStructure + 
    results.scores.technicalPerformance;

  console.log(`\n📊 AUDIT RESULTS SUMMARY:`);
  console.log(`------------------------------------------------------`);
  console.log(`• AI Crawler Readiness:   ${results.scores.aiCrawlerReadiness} / 30`);
  console.log(`• Schema Architecture:    ${results.scores.schemaArchitecture} / 30`);
  console.log(`• Citability Structure:   ${results.scores.citabilityStructure} / 20`);
  console.log(`• Technical Performance:  ${results.scores.technicalPerformance} / 20`);
  console.log(`------------------------------------------------------`);
  console.log(`🎯 COMPOSITE GEO SCORE:    ${results.scores.compositeScore} / 100\n`);

  results.checklist.forEach(c => {
    const symbol = c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${symbol} [${c.status}] ${c.item} (+${c.points} pts)`);
  });

  return results;
}

// Allow CLI execution: `node scripts/geo-seo-audit.mjs [url]`
const target = process.argv[2] || 'https://quickkitai.com';
runGeoAudit(target).catch(console.error);
