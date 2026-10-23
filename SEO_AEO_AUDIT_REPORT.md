# QuickKitAI / Raja AI Systems — SEO & AEO Readiness Audit

**Audit date:** 23 October 2026  
**Repository:** `princepinku143c-cyber/Quickkit-internal-ai-services`  
**Audit branch:** `aeo/quickkitai-readiness`  
**Production status:** No changes from this branch have been merged into `main` or intentionally deployed to the production domain as part of this audit.

## Executive summary

This is a foundation pass, not a completed AEO campaign and not a guarantee of inclusion in ChatGPT, Gemini, Perplexity, Google, or another search surface. The branch adds optional LLM-facing guidance, improves crawler directives, aligns primary homepage/service messaging to real estate while preserving healthcare as a secondary service, and updates sitemap/metadata consistency. Search visibility and rankings have not been measured yet.

## Work prepared on the audit branch

- Added `public/llms.txt` with a factual description of the business, primary public pages, and limits on claims about integrations/results.
- Added an explicit `OAI-SearchBot` group to `public/robots.txt`.
- Ensured the named crawler groups and wildcard rules disallow private/internal paths including `/scratch/`, along with dashboard/admin/client/API paths.
- Changed homepage SEO metadata to make real-estate automation the primary positioning and healthcare automation a secondary service.
- Aligned the homepage React-rendered metadata with the HTML shell metadata.
- Clarified the real-estate service page description while retaining the healthcare service as secondary.
- Added `/services/healthcare` to `public/sitemap.xml` because a matching route exists.
- Changed blog listing metadata to use the actual `BLOG_POSTS.length` rather than hard-coded article counts.
- Updated the shared SEO metadata helper so titles and Organization structured data consistently identify **Raja AI Systems**, with **QuickKit AI** as an alternate name.
- Added this report to record verified work and remaining blockers.

## Important findings still to resolve

### High priority — blog navigation and content quality

The blog listing links each card to `/blog/{id}`, but the current route table only registers `/blog`; the catch-all route redirects unknown paths to the homepage. The detail links therefore do not resolve to individual article pages.

The `BLOG_POSTS` dataset contains 87 entries. Several later `excerpt` values appear to contain raw front matter, drafting notes, or prompt-like text rather than clean reader-facing summaries. Do not generate/index 87 article URLs from this data until article content and routes are cleaned and validated. Recommended next step: build a proper blog detail route/template, clean each published article body and excerpt, and add only genuine canonical article URLs to the sitemap.

### High priority — search-engine rendering and route-level metadata

This is a Vite + React single-page application. Several page-specific titles, descriptions, canonicals, and structured-data blocks are managed through React Helmet. The source audit cannot prove that every crawler receives the final rendered metadata in its initial HTML. Consider pre-rendering/static generation or server-side rendering for important public landing pages after a build/route test. Do not claim this is resolved by the current metadata changes alone.

### High priority — dependency security review

The latest inspected Vercel build log reported **21 npm audit findings (10 moderate and 11 high)** while installing 371 packages. The build log did not include the full package/advisory breakdown in the inspected section. Do not blindly run `npm audit fix --force`, because forced updates can introduce breaking changes. Before production merge, run a full dependency audit, identify direct versus transitive vulnerable packages, apply compatible targeted updates on the branch, then rebuild and retest.

### High priority — validate the latest deployment

Vercel marked the preview for commit `9ba7ba51a8146f4ad248f99ab24e1c49ece84da0` as **READY**. Later branch commits change robots rules, shared metadata, and this report, so that READY status is not proof that the latest branch head has built successfully. Check the deployment attached to the newest commit and test these exact paths on that deployment:
- `/`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/services/real-estate`
- `/services/healthcare`
- `/real-estate-ai-questions`
- `/blog`
- `/blog/1` (expected to be a known routing blocker until the blog detail route is fixed)

The Vercel API status confirms a deployment build state; it does not, by itself, prove every public URL returns the intended HTTP response or that each page works on mobile.

### Measurement setup — not completed

No Google Search Console performance/indexing baseline or AI answer/citation baseline has been established in this audit. Setup needs the site owner to verify the property and grant appropriate access.

## Validation checklist

- [x] Audit changes isolated on a dedicated branch.
- [x] `llms.txt` added to the public directory.
- [x] Explicit OpenAI search crawler policy present in the branch.
- [x] Private paths consistently disallowed for the named crawler groups.
- [x] Homepage and real-estate service copy prioritize real estate without deleting healthcare as a secondary service.
- [x] Sitemap includes the existing real-estate and healthcare service routes.
- [x] Shared metadata/schema helper uses consistent organization naming.
- [x] Preview build executed the Vite production build and transformed 1,786 modules (latest deployment completion status still needs confirmation).
- [ ] Latest branch-head Vercel deployment reaches READY.
- [ ] Full npm audit results reviewed and compatible dependency fixes applied/tested.
- [ ] Live/preview HTTP responses confirmed for robots, sitemap, and llms file.
- [ ] All sitemap URLs return the intended status and canonical URL.
- [ ] Blog detail route repaired and article content audited before individual posts are indexed.
- [ ] Structured data validated with an appropriate testing tool.
- [ ] Google Search Console property verified; sitemap submitted; indexing/performance baseline saved.
- [ ] AI-search prompt set created and baseline citations recorded across ChatGPT Search, Gemini, and Perplexity.

## Reporting rules

- Do not provide a made-up percentage chance of ranking or being cited.
- Track technical checklist completion separately from search visibility.
- For AI-search measurement, use a fixed set of relevant prompts and record whether the business is cited, cited URL, position/context, date, and platform. Repeat the same prompt set over time, recognising answers can vary.
- For search-engine measurement, compare clicks, impressions, CTR, average position, indexed pages, and qualified enquiries over comparable date ranges.
- Do not claim rankings, citations, leads, revenue, or ROI are guaranteed.

## Rollout recommendation

Keep this work on the audit branch until the newest preview is READY and the priority findings above have been resolved or explicitly accepted. Review the final diff and test URLs before merging. Production merge/deployment remains a separate approval step.
