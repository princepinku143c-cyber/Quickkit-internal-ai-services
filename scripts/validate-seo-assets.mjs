import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const [sitemap, robots, llms, html, seoMeta, app, nichePage, landing, leadForm, faq, terms, hero, pricing, demoBooking, adCampaign, capabilityMatrix, comparisonTable, outreach, aiAgents, vercelConfigText] = await Promise.all([
  read('public/sitemap.xml'), read('public/robots.txt'), read('public/llms.txt'), read('index.html'),
  read('components/SeoMeta.tsx'), read('App.tsx'), read('components/PublicNichePage.tsx'),
  read('components/PremiumLanding.tsx'), read('components/LeadForm.tsx'), read('components/RealEstateAIQuestions.tsx'),
  read('components/legal/LegalPages.tsx'), read('components/Hero.tsx'), read('components/Pricing.tsx'),
  read('components/DemoBooking.tsx'), read('components/AdCampaignSection.tsx'), read('components/RealEstateCapabilityMatrix.tsx'),
  read('components/ComparisonTable.tsx'), read('api/outreach.js'), read('components/AIAgents.tsx'), read('vercel.json'),
]);

assert.match(sitemap, /^<\?xml\s+version=/, 'sitemap needs an XML declaration');
assert.match(sitemap, /<urlset[\s>]/, 'sitemap needs a urlset root');
assert.match(sitemap, /<\/urlset>\s*$/, 'sitemap root must close');
const urls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((m) => m[1]);
assert.ok(urls.length >= 10, `expected at least 10 sitemap URLs, got ${urls.length}`);
assert.equal(new Set(urls).size, urls.length¶»§q«^