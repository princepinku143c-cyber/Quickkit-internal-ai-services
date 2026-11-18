import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QuickKitDailyMonitor/1.0'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          durationMs: Date.now() - start,
          contentLength: data.length,
          body: data
        });
      });
    }).on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
  });
}

export async function runDailyMonitoring(targetDomain = 'quickkitai.com') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting Automated Daily Health & AEO Audit for ${targetDomain}...`);

  const [home, robots, llms, sitemap] = await Promise.all([
    fetchUrl(`https://${targetDomain}/`),
    fetchUrl(`https://${targetDomain}/robots.txt`),
    fetchUrl(`https://${targetDomain}/llms.txt`),
    fetchUrl(`https://${targetDomain}/sitemap.xml`)
  ]);

  // Schema Audit
  let schemaEntities = [];
  if (home.body) {
    const match = home.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed['@graph']) {
          schemaEntities = parsed['@graph'].map(e => e['@type']);
        }
      } catch (e) {
        console.error('Schema JSON parse failed');
      }
    }
  }

  // AEO & Bot Crawl Audit
  const aeoReady = robots.body?.includes('OAI-SearchBot') && robots.body?.includes('PerplexityBot');
  const llmsActive = llms.status === 200 && (llms.contentLength > 1000);

  const report = {
    timestamp,
    targetDomain,
    health: {
      homepageStatus: home.status,
      loadTimeMs: home.durationMs,
      speedScore: home.durationMs < 1500 ? 'OPTIMAL (<1.5s)' : 'WARNING (>1.5s)',
      sitemapStatus: sitemap.status,
      robotsStatus: robots.status,
      llmsStatus: llms.status
    },
    schema: {
      status: schemaEntities.length >= 3 ? 'PASS' : 'WARNING',
      detectedEntities: schemaEntities
    },
    aeoCitationReadiness: {
      llmsTxtDeployed: llmsActive,
      aiSearchBotsAllowed: aeoReady,
      readinessScore: (llmsActive && aeoReady) ? '100% READY' : 'PARTIAL'
    }
  };

  console.log('Daily Audit Summary:', JSON.stringify(report, null, 2));

  // Save to daily logs
  try {
    const logDir = path.resolve('data');
    await fs.mkdir(logDir, { recursive: true });
    const logPath = path.join(logDir, 'daily_monitoring_log.json');
    let existing = [];
    try {
      const cur = await fs.readFile(logPath, 'utf8');
      existing = JSON.parse(cur);
    } catch {}
    existing.unshift(report);
    // keep last 30 reports
    await fs.writeFile(logPath, JSON.stringify(existing.slice(0, 30), null, 2), 'utf8');
    console.log(`Report successfully logged to ${logPath}`);
  } catch (err) {
    console.error('Failed to write log file:', err.message);
  }

  return report;
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('daily-rank-and-aeo-monitor.mjs')) {
  runDailyMonitoring();
}
