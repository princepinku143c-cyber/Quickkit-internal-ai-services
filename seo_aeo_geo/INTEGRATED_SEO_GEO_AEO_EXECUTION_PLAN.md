# QuickKitAI — Integrated SEO + GEO + AEO Execution Plan

Purpose: Build one evidence-led discoverability program for traditional web search and AI answer/search experiences. This plan does not promise a specific position, citation, recommendation, traffic or revenue outcome.

## 1. Three disciplines and their deliverables

### SEO — Search Engine Optimization
- Technical: HTTP status, crawl access, robots policy, sitemap coverage, canonicals, redirects, mobile rendering, Core Web Vitals, broken links and indexability.
- On-page: unique titles/descriptions, one clear H1, search-intent alignment, descriptive image alt text and useful internal links.
- Content: focused service pages, detailed implementation guides, comparisons only when factual and current, and complete original articles.
- Measurement: Google Search Console and Bing Webmaster impressions, clicks, queries, indexed URLs and conversions. Search-console ownership and current metrics must be verified by the site owner.

### GEO — Generative Engine Optimization
- Entity: consistent brand name, domain, services, ownership, contact information and geographic service scope.
- Evidence: original guides, dated case studies, named authors where appropriate, transparent methodology and verifiable customer outcomes only after permission.
- Authority: legitimate industry profiles, partner/vendor references, expert contributions, earned press and relevant citations. No purchased/spam backlinks, fake reviews or fabricated profiles.
- Consistency: keep website, approved social profiles, business directories and partner references factually aligned.
- Measurement: source citations, entity disambiguation, brand mentions and referral traffic; record the source and date.

### AEO — Answer Engine Optimization
- Answer pages: answer one real buyer question clearly, then provide context, steps, constraints and source links.
- Structured data: use only schema types that match visible content; validate markup and avoid fabricated reviews, ratings or FAQ content.
- Crawl access: allow the relevant search crawlers and verify CDN/WAF/firewall access; training crawlers and search crawlers can be separate.
- Prompt benchmark: run fixed prompts separately on ChatGPT Search, Gemini and Perplexity (and Claude/Google surfaces when in scope); retain full answers and citations.
- Classification: distinguish MENTIONED, RECOMMENDED, CITED, ABSENT, AMBIGUOUS and NOT_ASSESSED. Separately record SUCCESS, ERROR, BLOCKED and NOT_RUN.

## 2. Existing repository evidence (not live ranking proof)

The current main branch contains public/robots.txt, public/sitemap.xml and public/llms.txt; shared Organization/WebSite schema in index.html; route metadata/prerender generation; a real-estate Q&A page and lead qualification guide; and a 60-prompt benchmark pack in the AEO measurement branch.

This confirms code assets exist. It does not prove Google/Bing indexing, live crawler access through the CDN, an AI platform citation, or production-grade automated monitoring. The 60 prompts have not yet been completed as live observations.

## 3. Priority execution sequence

1. Validate build, static HTML, canonical URLs, route rewrites, sitemap, robots and llms file on a Vercel preview.
2. Verify Google Search Console and Bing Webmaster ownership; submit the sitemap and capture a dated baseline.
3. Run the 60-prompt baseline as 60 separate prompts on each selected platform; capture answers and source URLs.
4. Review actual gaps and write/approve service pages, question pages and original guides based on buyer intent.
5. Build legitimate authority: accurate company profiles, partner/vendor references, authored expert contributions, earned press and approved case studies.
6. Apply technical/content/schema changes on a branch, validate them, and stage for owner review before production.
7. Repeat the same queries and prompts; compare like-for-like results and report changes with evidence.
8. Only automate recurring collection after provider access, terms, rate limits, data retention and failure states are implemented and tested.

## 4. Current limitations to state honestly

- No guaranteed Google ranking or LLM recommendation/citation.
- Search Console/Bing Webmaster live account data is not verified by repository checks.
- AI prompt testing is currently a human-run measurement process; do not label it automated.
- Multi-tenant client dashboard, automated LLM connectors and evidence database require separate implementation and acceptance testing.
- External authority cannot be manufactured in code. It requires real public references, relationships, useful work and time.

## 5. Official operational references

- Google Search Central: https://developers.google.com/search/docs
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters
- OpenAI crawler guidance: https://developers.openai.com/api/docs/bots
- Anthropic crawler guidance: https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
