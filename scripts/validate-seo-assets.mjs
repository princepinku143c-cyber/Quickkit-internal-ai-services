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
assert.equal(new Set(urls).size, urls.length, 'sitemap URLs must be unique');
for (const u of urls) {
  const parsed = new URL(u);
  assert.equal(parsed.origin, 'https://quickkitai.com', `unexpected sitemap host: ${u}`);
  assert.equal(parsed.search, '', `sitemap URLs should not include tracking query strings: ${u}`);
  assert.equal(parsed.hash, '', `sitemap URLs should not include fragments: ${u}`);
}
for (const path of ['/services/real-estate','/services/healthcare','/guides/real-estate-ai-lead-qualification','/real-estate-ai-questions','/blog','/ai-visibility','/proof-of-value']) {
  assert.ok(urls.includes(`https://quickkitai.com${path}`), `missing important URL from sitemap: ${path}`);
}
assert.match(robots, /User-agent:\s*OAI-SearchBot/i, 'robots.txt should define the OpenAI Search crawler');
assert.match(robots, /Sitemap:\s*https:\/\/quickkitai\.com\/sitemap\.xml/i, 'robots.txt should reference the sitemap');
for (const denied of ['/api/','/scratch/','/admin','/client-portal']) assert.ok(robots.includes(`Disallow: ${denied}`), `robots.txt missing ${denied} deny rule`);
for (const href of urls.filter((u) => !u.endsWith('/privacy') && !u.endsWith('/terms'))) {
  const pathname = new URL(href).pathname;
  if (pathname === '/') continue;
  assert.ok(llms.includes(href), `llms.txt should reference sitemap content URL ${href}`);
}
assert.match(html, /"@type":"Organization"/);
assert.match(html, /"@type":"WebSite"/);
assert.match(html, /"@type":"FAQPage"/);
assert.match(html, /"@type":"SpeakableSpecification"/);
assert.doesNotMatch(html, /"@type":"Service"|"@type":"SearchAction"/, 'shared HTML shell must not assert route-specific schema for every URL');
assert.match(seoMeta, /https:\/\/quickkitai\.com\$\{window\.location\.pathname\}/, 'canonical fallback must use the production host and path');
assert.doesNotMatch(seoMeta, /new Date\(\)\.toISOString\(\)/, 'Article date must not be fabricated at runtime');
assert.match(seoMeta, /https:\/\/quickkitai\.com\/#organization/);
const vercelConfig = JSON.parse(vercelConfigText);
for (const [source, destination] of [
  ['/privacy-policy', 'https://quickkitai.com/privacy'],
  ['/terms-of-service', 'https://quickkitai.com/terms'],
]) {
  assert.ok(
    vercelConfig.redirects.some((rule) => rule.source === source && rule.destination === destination && rule.permanent === true),
    source + ' should permanently redirect to its canonical legal page',
  );
}
for (const path of ['/services/real-estate','/services/healthcare','/guides/real-estate-ai-lead-qualification','/real-estate-ai-questions','/blog','/about','/contact','/ai-visibility','/proof-of-value','/seo-audit','/privacy','/terms']) {
  const routeIndex = vercelConfig.rewrites.findIndex((r) => r.source === path && r.destination === `${path}/index.html`);
  const slashIndex = vercelConfig.rewrites.findIndex((r) => r.source === `${path}/` && r.destination === `${path}/index.html`);
  const fallbackIndex = vercelConfig.rewrites.findIndex((r) => r.destination === '/index.html');
  assert.ok(routeIndex >= 0, `Vercel must route ${path} to its prerendered HTML`);
  assert.ok(slashIndex >= 0, `Vercel must route ${path}/ to its prerendered HTML`);
  assert.ok(routeIndex < fallbackIndex && slashIndex < fallbackIndex, `Specific prerender rewrites for ${path} must precede the SPA fallback`);
}
const spaFallback = vercelConfig.rewrites.find((r) => r.destination === '/index.html');
assert.ok(spaFallback && ['llms','services/real-estate','services/healthcare','guides/real-estate-ai-lead-qualification','real-estate-ai-questions','blog','proof-of-value'].every((route) => spaFallback.source.includes(route)), 'SPA fallback must exclude llms.txt and prerendered routes');
const fallbackMatcher = new RegExp(`^${spaFallback.source}`);
for (const path of ['/services/real-estate','/services/real-estate/index.html','/services/healthcare','/guides/real-estate-ai-lead-qualification/index.html','/real-estate-ai-questions/index.html','/blog/index.html','/proof-of-value','/proof-of-value/index.html','/llms.txt']) assert.ok(!fallbackMatcher.test(path), `SPA fallback must not rewrite static route/file ${path}`);
assert.ok(fallbackMatcher.test('/services/not-a-real-niche'), 'unknown service slugs must still reach the React route handler');
assert.match(app, /<Route path="\/guides\/real-estate-ai-lead-qualification"/);
assert.match(app, /<Route path="\/services\/:niche"/);
assert.match(nichePage, /<Navigate to="\/services\/real-estate" replace\s*\/>/);
for (const [file, contents] of [['PremiumLanding',landing],['LeadForm',leadForm],['RealEstateAIQuestions',faq],['LegalPages',terms],['Hero',hero],['Pricing',pricing.replaceAll('RAJA_DUSSEHRA','')],['DemoBooking',demoBooking],['AdCampaignSection',adCampaign],['CapabilityMatrix',capabilityMatrix]]) {
  assert.doesNotMatch(contents, /Dussehra|locked for life|lifetime lock/i, `${file} has stale or absolute offer wording`);
}
const landingAndMarketingCopy = landing + hero + nichePage + demoBooking + adCampaign + aiAgents;
for (const claim of ['≤ 12 sec', '≤ 12-second response target', '12-Second WhatsApp', '8–15%', '5★']) {
  assert.ok(!landingAndMarketingCopy.toLowerCase().includes(claim.toLowerCase()), `public copy contains an unverified performance claim: ${claim}`);
}
for (const claim of ['50 / day', '8–15%', '5★']) assert.ok(!landing.toLowerCase().includes(claim.toLowerCase()), `landing contains unverified metric: ${claim}`);
assert.doesNotMatch(outreach, /bookings 20-30%|up to 25% more after-hours|80% of their time|3x zyada bookings|triples lead-to-booking rates|response time by 90%/i, 'generated outreach must not make unverified quantified outcome claims');
assert.doesNotMatch(comparisonTable, /90% cheaper|90% faster/i, 'comparison copy must not make unsubstantiated savings claims');
console.log(`SEO asset validation passed: ${urls.length} unique sitemap URLs, crawler policy, llms.txt, shared schema, route registration, and public-offer wording.`);
