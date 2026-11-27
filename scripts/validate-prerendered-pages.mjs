import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pages = [
  ['services/real-estate', 'Real Estate AI Automation in India | QuickKitAI'],
  ['services/healthcare', 'Healthcare Clinic AI Automation India | QuickKitAI'],
  ['guides/real-estate-ai-lead-qualification', 'Real Estate AI Lead Qualification Guide | QuickKitAI'],
  ['real-estate-ai-questions', 'Real Estate AI Agent FAQ & Answers | QuickKitAI'],
  ['blog', 'Real Estate AI & AEO Knowledge Hub | QuickKitAI'],
  ['ai-visibility', 'AI Visibility & AEO Services India | QuickKitAI'],
  ['proof-of-value', 'Proof of Value: AI Automation & AEO | QuickKitAI'],
  ['live-demo', 'Live AI Workflow Demonstration | QuickKitAI'],
  ['about', 'About QuickKitAI & Raja AI Systems | India'],
  ['contact', 'Contact QuickKitAI | Book an AI or AEO Pilot'],
  ['seo-audit', 'SEO & AI Search Readiness Audit | QuickKitAI'],
  ['privacy', 'Privacy Policy | QuickKitAI & Raja AI Systems'],
  ['terms', 'Terms of Service | QuickKitAI & Raja AI Systems'],
];

const sitemapPaths = [
  '/',
  '/ai-visibility',
  '/proof-of-value',
  '/live-demo',
  '/services/real-estate',
  '/services/healthcare',
  '/guides/real-estate-ai-lead-qualification',
  '/real-estate-ai-questions',
  '/blog',
  '/seo-audit',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const unesc = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');

for (const [path, title] of pages) {
  const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
  const url = `https://quickkitai.com/${path}`;

  assert.ok(title.length >= 30 && title.length <= 60, `${path} expected title length must be 30-60 chars (got ${title.length})`);
  assert.ok(html.includes(`<title>${esc(title)}</title>`), `${path} should have route-specific title in the initial HTML`);

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  assert.ok(descMatch, `${path} must have meta description`);
  const desc = unesc(descMatch[1]);
  assert.ok(desc.length >= 70 && desc.length <= 160, `${path} meta description must be 70-160 chars (got ${desc.length})`);

  assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), `${path} should have a route-specific canonical in the initial HTML`);
  assert.ok(html.includes('id="seo-prerendered-summary"'), `${path} should have readable initial HTML content`);
  assert.ok(!html.includes('id="seo-home-summary"'), `${path} must strip #seo-home-summary from shell`);

  const h1Matches = html.match(/<h1\b[^>]*>/gi) || [];
  assert.equal(h1Matches.length, 1, `${path} must have strictly 1 <h1> (found ${h1Matches.length})`);

  assert.ok(html.includes('"@type":"WebPage"') && html.includes(`"url":"${url}"`), `${path} should include page-specific WebPage schema`);
  assert.ok(html.includes('"@type":"Article"'), `${path} should include Article schema`);
  assert.ok(html.includes('"@type":"Person"') && html.includes('"name":"Prince (Raja)"'), `${path} should include Person author Prince (Raja)`);
  assert.ok(html.includes('"@type":"BreadcrumbList"'), `${path} should include BreadcrumbList schema`);
  assert.ok(html.includes('2026-11-27'), `${path} should include dateModified 2026-11-27`);
  assert.ok(html.includes('Last updated:'), `${path} should include visible Last updated date`);
  assert.ok(html.includes('Prince (Raja)'), `${path} should include visible author byline`);

  const summaryMatch = html.match(/<main id="seo-prerendered-summary"[\s\S]*?<\/main>/i);
  assert.ok(summaryMatch, `${path} should wrap summary in <main id="seo-prerendered-summary">`);
  const plainText = summaryMatch[0]
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainText.split(' ').filter(Boolean).length;
  assert.ok(wordCount >= 300, `${path} must have >= 300 words (got ${wordCount})`);

  for (const banned of ['8-10 site visits guarantee', 'site-visit guarantee', 'site visits guarantee', 'fully refunded']) {
    assert.ok(!html.toLowerCase().includes(banned), `${path} contains prohibited lead-guarantee phrasing: ${banned}`);
  }

  for (const routeHref of sitemapPaths) {
    assert.ok(html.includes(`href="${routeHref}"`), `${path} must link to sitemap route ${routeHref}`);
  }

  if (path === 'ai-visibility') {
    assert.ok(html.includes('₹15,000') && html.includes('₹25,000') && html.includes('₹20,000'), 'ai-visibility must display Tier 01 (₹15,000) and Tier 02 (₹25,000/month + ₹20,000 setup)');
  }
}

console.log(`Static HTML validation passed for ${pages.length} public routes (strict single H1, 30-60 title, 70-160 description, WebPage+Article+Person+BreadcrumbList+dateModified, >=300 words, zero lead guarantees, 14-route internal links).`);
