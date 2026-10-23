# QuickKitAI / Raja AI Systems — SEO & AEO Readiness Audit

**Audit date:** 23 October 2026  
**Repository:** `princepinku143c-cyber/Quickkit-internal-ai-services`  
**Audit branch:** `aeo/quickkitai-readiness`  
**Production status:** This branch has not been merged into `main`; no production deployment was intentionally triggered as part of this audit.

## Executive summary

This is a technical and content foundation pass, not a completed AEO campaign and not a guarantee of inclusion in ChatGPT, Gemini, Perplexity, Google, or another search surface. The branch adds optional LLM-facing guidance, crawler rules, real-estate-focused metadata, a practical real-estate guide, and a deployment checklist. Search visibility and rankings have not been measured with Search Console or a repeatable AI-citation test set.

## Work prepared on the audit branch

- Added `public/llms.txt` with a factual description of the business, primary public pages, and limits on claims about integrations/results.
- Added an explicit `OAI-SearchBot` group to `public/robots.txt`.
- Ensured named crawler groups and the wildcard rules disallow private/internal paths including `/scratch/`, dashboard/admin/client/API paths.
- Changed homepage SEO metadata to make real-estate automation the primary positioning and healthcare automation a secondary service.
- Aligned homepage React-rendered metadata with the HTML shell metadata.
- Clarified the real-estate service page description while retaining healthcare as a secondary service.
- Added `/services/healthcare` and `/guides/real-estate-ai-lead-qualification` to `public/sitemap.xml`; both routes are registered in the app.
- Added a useful public guide on real-estate AI lead qualification in India, including an Article schema, FAQ schema, internal links, and practical safety/measurement guidance.
- Added the guide link to the real-estate service page and `llms.txt`.
- Changed blog listing metadata to use the actual `BLOG_POSTS.length` rather than hard-coded article counts.
- Cleaned 74 malformed blog card excerpts (IDs 11–84) and removed nonfunctional `/blog/{id}` links until complete article pages exist.
- Aligned shared SEO titles and Organization structured data with **Raja AI Systems**, with **QuickKit AI** as an alternate name.
- Removed route-mismatched global `Service` and `FAQPage` JSON-LD from the shared HTML shell; route-specific service/article/FAQ schema is managed by the relevant page components instead.
- Normalized fallback canonicals to the production `https://quickkitai.com` hostname and pathname, excluding query-string tracking parameters and fragments.
- Added stable `@id` values for Organization and WebSite structured data so the static shell and React Helmet metadata can reference the same entities.
- Removed the automatic current-time `datePublished` fallback from generic Article schema; publication dates are emitted only when explicitly supplied.
- Replaced the no-JavaScript fallback's time-sensitive Dussehra pilot pricing with non-promotional service-scope copy so the static fallback does not advertise a potentially expired offer.
- Added a top-level React `Suspense` boundary around lazy-loaded routes to support proper loading of lazy pages.
- Added this report to record verified work and remaining blockers.

## Important findings still to resolve

### High priority — blog navigation and content quality

The blog listing links cards to `/blog/{id}`, but the current route table only registers `/blog`; the catch-all route redirects unknown paths to the homepage. Those detail links therefore do not resolve to individual article pages.

The `BLOG_POSTS` dataset contains 87 entries. Several later `excerpt` values appear to contain raw front matter, drafting notes, or prompt-like text rather than clean reader-facing summaries. Do not generate or index 87 article URLs from this data until article bodies and excerpts are cleaned and detail routes are implemented. The new guide is a separate, authored public page; it does not repair the existing blog-detail route.

### High priority — search-engine rendering and route-level metadata

This is a Vite + React single-page application. Several page-specific titles, descriptions, canonicals, and structured-data blocks are managed through React Helmet. The source audit cannot prove that every crawler receives final route-specific metadata in its initial HTML. Consider pre-rendering/static generation or server-side rendering for important public landing pages after build/route tests. Do not claim that the current metadata edits solve this on their own.

The static HTML shell now keeps only site-wide Organization and WebSite structured data, with stable `@id` values. The global Service and FAQPage blocks were removed because the same SPA shell is served for deep routes and could make unrelated URLs inherit the wrong page schema. Shared React SEO metadata now uses the production hostname for fallback canonicals, removes tracking/query strings, and no longer invents an Article publication date when none is supplied. Route-specific schema still needs to be checked in rendered output for the homepage, service pages, guide and FAQ page.

### High priority — dependency security review

The inspected Vercel install log reported **21 npm audit findings (10 moderate and 11 high)** while installing 371 packages. The inspected log section did not include the full package/advisory breakdown. Before production merge, run a full dependency audit, identify direct versus transitive vulnerable packages, apply compatible targeted updates on the branch, then rebuild and retest. Do not blindly run `npm audit fix --force`, since forced upgrades can introduce breaking changes.

### High priority — validate the latest deployment and public URLs

A Vercel preview for commit `f8bcdbf7bc78299a03dab90bb567b385e261d1ad` was marked **READY** and its Vite build transformed 1,786 modules. Further code and documentation commits followed, so that status is not proof that the current branch head has built successfully. Check the deployment attached to the latest commit and test these paths:
- `/`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/services/real-estate`
- `/services/healthcare`
- `/guides/real-estate-ai-lead-qualification`
- `/real-estate-ai-questions`
- `/blog`
- `/blog/1` (known routing blocker until the blog-detail route is fixed)

The Vercel API build state does not by itself prove that each public URL returns the intended HTTP status, the correct canonical, or the intended rendered page. Direct HTTP checks could not be completed from the current audit environment, so these remain pending.

### Initial discoverability observation — not a ranking baseline

A public web-search lookup returned the main `quickkitai.com` homepage and showed it had been crawled in the previous week. The specific lookup did not surface separate service/FAQ URL results; that is not proof those pages are unindexed and does not establish Google ranking or AI-platform citation status. A repeatable Search Console and AI-answer baseline is still required.

### Published performance and offer claims

The public homepage surfaces numerical claims and a time-limited pilot offer (for example, response-time/lead workflow metrics and visit/consultation commitments). Before using these in client proposals, confirm the precise definition, measurement method, conditions, evidence, and expiry date. Label targets as targets, not measured customer outcomes, and ensure the written SLA matches the site.

### Measurement setup — not completed

No verified Google Search Console performance/indexing baseline or repeatable AI answer/citation baseline has been established in this audit. The site owner must verify the Search Console property and grant appropriate access before these metrics can be measured.

## Validation checklist

- [x] Changes isolated on a dedicated branch.
- [x] `llms.txt` added and linked to the practical guide.
- [x] Explicit OpenAI search crawler policy present.
- [x] Private paths consistently disallowed for the named crawler groups.
- [x] Homepage and real-estate service copy prioritize real estate without deleting healthcare as a secondary service.
- [x] Sitemap includes the existing real-estate and healthcare service routes and the new guide.
- [x] Shared metadata/schema helper uses consistent organization naming.
- [x] Removed global Service/FAQ schema from the shared HTML shell and removed time-sensitive Dussehra pricing from the no-JavaScript fallback.
- [x] Normalized fallback canonical URLs to the production domain and added stable IDs for global Organization/WebSite schema.
- [x] Removed dynamic current-time publication dates from generic Article schema.
- [x] A practical real-estate lead qualification guide is authored and route-registered.
- [x] A React `Suspense` boundary is now present around lazy-loaded routes.
- [ ] Latest branch-head Vercel deployment reaches READY after the newest canonical/schema cleanup commits.
- [ ] Full npm audit findings reviewed and compatible dependency fixes applied/tested.
- [ ] Live/preview HTTP responses confirmed for robots, sitemap, and llms file.
- [ ] All sitemap URLs return the intended status and canonical URL.
- [ ] Blog detail route repaired and article content audited before individual posts are indexed.
- [ ] Route-specific rendered metadata and structured data validated on each important page.
- [ ] Search Console property verified; sitemap submitted; indexing/performance baseline recorded.
- [ ] AI-search prompt set created and baseline citations recorded across ChatGPT Search, Gemini, and Perplexity.
- [ ] Published performance and seasonal-offer claims reviewed against supporting evidence and contract terms.

## Reporting rules

- Do not give a made-up percentage chance of ranking or being cited.
- Track technical checklist completion separately from search visibility.
- For AI-search measurement, use a fixed set of relevant prompts and record whether the business is cited, the cited URL, context/position, date, and platform. Repeat the same prompt set over time because answers vary.
- For search-engine measurement, compare clicks, impressions, CTR, average position, indexed pages, and qualified enquiries over comparable date ranges.
- Do not claim rankings, citations, leads, revenue, or ROI are guaranteed.

## Rollout recommendation

Keep this work on the audit branch until the newest preview is READY and the priority findings above have been resolved or explicitly accepted. Review the final diff and test URLs before merging. Production merge/deployment remains a separate approval step.
