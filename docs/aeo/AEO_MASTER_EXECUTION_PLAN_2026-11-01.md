# QuickKitAI / Raja AI Systems — Master AEO & Business Readiness Execution Plan
**Plan date:** 2026-11-01 (Asia/Kolkata)  
**Repository:** princepinku143c-cyber/Quickkit-internal-ai-services  
**Working branch:** `aeo/measurement-pack-20261101`  
**Base:** `main` at `162436716c596e6104fbd9776c647245b81faa9d`  
**Status:** Reconciled plan; execution not yet complete.

## 1. Executive truth — where the project really stands

QuickKitAI is **not starting from zero**, and the public website has already received a real AEO/SEO technical release. However, the complete commercial funnel and the repeatable AEO measurement-and-delivery engine are **not yet certified production-ready**.

### Confirmed completed
- PR #18 merged to `main`; production Vercel deployment `dpl_7DiCJrcabb97qfSANTb8Y8wSUfqB` is READY on `quickkitai.com`.
- Production verification record: 14/14 sitemap routes HTTP 200; `robots.txt`, `sitemap.xml`, `llms.txt` all HTTP 200; 17/17 route/resource smoke checks; 13/13 sampled JSON-LD blocks parse; homepage unsupported metrics and ambiguous generic ₹9,999 SoftwareApplication offer removed.
- Build, TypeScript, SEO/prerender validators, npm audit (0 vulnerabilities), and security input regression tests passed in the recorded release.
- Internal Plan 3 Growth engine was executed against the owned QuickKitAI domain: pipeline PASS, internal score 100/100 across five dimensions, 60 prompts + 8 FAQ work items + 4 technical fix batches generated in a controlled no-client-data simulation; production publish gate correctly blocked by design.
- Historical Search Console snapshot (2026-10-01 to 2026-10-27) recorded 8 impressions and average position 5.5 for a returned row labelled `quickkit`; this is a tiny, incomplete observation, not a reliable SEO baseline. GA4 API read returned zero rows for the queried range; that does not prove zero traffic.
- AEO V2 real-estate prompt inventory: 60/60 records, IDs RE-001–RE-060, 40 non-branded / 10 branded / 10 competitor. Original and V2 prompts have now been reconciled side by side.

### Partially complete / not proven
- Current AEO V2 prompt pack is still `DRAFT_FOR_OWNER_REVIEW`; it is not a frozen production monitoring set.
- Competitor candidates have sources, but the final competitor set is not owner-approved.
- Observation schema exists, but it has not yet been validated against a persisted corpus of genuine platform answers.
- A previous preview branch passed 17/17 HTTP smoke checks and 13/13 sampled JSON-LD syntax checks; this was not a graphical browser acceptance test.
- Current PR #19 has the measurement pack and an SEOAudit component change. It remains draft and unmerged. The latest preview build for the newest side-by-side commit is BUILDING; an earlier commit preview is READY.
- The screenshots show the Request Your Pilot form returning “Unable to submit the request right now” on a Vercel preview hostname. The screenshots do not establish the backend cause and do not prove the same failure occurs on the canonical production domain.

### Not completed / not claimed
- Genuine ChatGPT, Gemini, and Perplexity observation set.
- AI mention, recommendation, citation, and competitor rates based on real captured answers.
- Durable evidence store, operational dashboard, scheduled runs, retry/deduplication, alerts, and audit history.
- Full visual browser acceptance of all key pages and the production lead form.
- Verified end-to-end lead delivery to CRM/email/WhatsApp, sales follow-up, booking, payment, and revenue attribution.
- Full security/tenant-isolation acceptance of the complete AEO workflow.
- External client outcomes, rankings, citations, qualified leads, bookings, revenue, or ROI.

## 2. Business scope — keep the two offers distinct

The business context has two related but distinct offers recorded in project material:
1. **Real-estate automation pilot:** ₹35,000 pilot setup; ₹1,20,000 monthly management from Day 30; up to 3 pilot clients. This appears in the Request Your Pilot UI screenshot.
2. **AI Visibility Growth (AEO) offer:** ₹75,000 setup + ₹1,20,000/month, up to 60 tracked prompts/month, up to 8 answer/FAQ work items/month and up to 4 approved technical fix batches/month.

Do not silently merge these into one price or imply they are the same product. Before final sales release, verify the exact product name, inclusions, billing start, exclusions, and signed-agreement terms for each.

Primary business positioning remains real-estate automation in India; healthcare is secondary/project-scoped. The AEO work supports discoverability and measurement; it does not itself deliver the complete CRM/WhatsApp/lead operations product.

## 3. Workstreams and current status

| Workstream | Current status | Remaining acceptance evidence |
|---|---|---|
| A. Website / SEO technical foundation | Production technical release PASS | Fresh browser pass; Search Console index/performance review |
| B. AEO technical readiness | Core crawl files/routes and sampled schema verified | All-route canonical/schema semantics; Google Search generative AI control and report review |
| C. Real-estate prompt inventory | 60 V2 rows reconciled | Resolve persona drift RE-009/RE-010; owner freeze |
| D. Competitor intelligence | Draft candidates sourced | Verify product-level overlap, official sources and final shortlist |
| E. Live AI observation | Not run | Genuine ChatGPT/Gemini/Perplexity answer captures |
| F. Evidence data layer | Schema drafted | Persistence, evidence files, validation, access controls |
| G. Dashboard and reporting | Not built/proven | Real metrics, denominator, time window, platform filters |
| H. Automation | Runbook drafted | Scheduler, retry, dedupe, failure alerts and run history |
| I. Content/technical action loop | Scope defined (8 FAQ + 4 fix batches/month) | Generate from real observations, staging QA and re-audit |
| J. Business lead funnel | Screenshot defect on preview; production form unverified | Submit safely on staging and canonical production; prove delivery and owner notification |
| K. CRM / WhatsApp / sales operations | Not end-to-end certified in current evidence | Consent, routing, follow-up, opt-out, human handoff and CRM record tests |
| L. Release/security governance | PR #19 draft; not merged | CI, preview QA, approval gate, tenant isolation, rollback and final release evidence |

## 4. AEO strategy — actual sequence

### Phase 0 — Baseline truth and scope lock
**Status: substantially complete**
- Preserve the 60 original IDs.
- Compare old and V2 prompt wording side by side.
- Separate technical readiness, platform mention, recommendation, citation, Google ranking, website traffic, lead, booking, revenue and ROI.
- Lock locale, platform surface, capture method and observation window.
- Freeze V2 only after review of RE-009/RE-010 persona changes and competitor scope.

### Phase 1 — Competitor and entity evidence
**Estimate: 0.5–1 working day**
- Verify QuickKitAI / Raja AI Systems name, canonical domain, real-estate services, service boundaries, plan prices and proof.
- Validate each proposed competitor from official product pages; classify real-estate-native CRM vs horizontal CRM vs managed service vs in-house option.
- Record canonical URL, exact overlap, evidence excerpt, checked date and confidence.
- Do not claim that a candidate is a direct competitor or “best” without evidence.

### Phase 2 — Live AI visibility baseline
**Estimate: 1–2 working days for the first 15-prompt pilot; full 60-prompt cycle depends on access and capture method**
- Pilot 15 prompts first, then expand to all 60.
- Platforms: ChatGPT Search, Gemini, Perplexity; add Google AI Search surfaces as a separate measurement surface.
- Keep exact prompt, locale, timestamp, platform/surface, raw answer, citations, cited URLs and evidence reference.
- Classify brand mention, explicit recommendation and citation independently.
- Record NOT_RUN / BLOCKED / ERROR separately from ABSENT.
- Do not substitute web search output for a ChatGPT/Gemini/Perplexity answer.
- If all 60 prompts are tested on 3 AI platforms, report 180 platform-prompt observations (60 × 3); do not mislabel this as 180 unique prompts.

### Phase 3 — Evidence store and dashboard
**Estimate: 1–2 working days**
- Persist prompt version, observation run, raw answer evidence, classification, cited URLs, confidence, reviewer and timestamps.
- Validate every record against JSON Schema Draft 2020-12.
- Build dashboard with prompt coverage, platform coverage, mention rate, recommendation rate, citation rate, competitor appearance, errors and blocked runs.
- Every percentage must show numerator, denominator, platform and observation window.
- Do not invent historical results; dashboard begins at first captured baseline.

### Phase 4 — Action engine and monthly operating loop
**Estimate: 1 working day after the data layer**
- Convert real gaps into up to 8 answer/FAQ work items and up to 4 technical fix batches per monthly Growth scope.
- Each item includes source evidence, target page, owner, acceptance criteria, staging link, approval status and re-audit result.
- Keep draft → staging → human approval → production publication → post-publish verification.
- No auto-publishing of unreviewed claims, pricing, customer proof or legal content.

### Phase 5 — Scheduler, reliability and security
**Estimate: 1 working day**
- Configure 4 weekly cycles × 15 prompts = 60 prompts/month.
- Add retries, deduplication, run history, rate-limit handling, failure alerts and manual rerun.
- Test authorization, role boundaries, tenant isolation, secret handling, evidence retention and rollback.
- Simulations must be labelled as simulations; they are not live platform evidence.

### Phase 6 — Release acceptance
**Estimate: 0.5–1 working day**
- Run build, type, SEO, schema, API and security tests against isolated targets.
- Run desktop/mobile browser smoke tests for navigation, CTA, form, validation, loading, success/error states and console/network errors.
- Verify lead submission delivery without creating fake external leads.
- Review PR diff and preview; merge only after approval and passing release gates.
- Verify production deployment and perform post-release smoke tests.

## 5. Separate business funnel acceptance — critical

The website can be technically reachable while the business funnel still loses customers. Treat these as separate tests:

1. Visitor can understand real-estate offer, pricing and scope.
2. Pilot/demo CTA opens the correct form.
3. Required fields validate and errors are clear.
4. Submit succeeds and returns a real confirmation.
5. Lead is durably stored once (no duplicates).
6. Correct owner receives notification.
7. Lead appears in the CRM/pipeline with source and timestamp.
8. Sales follow-up and human handoff work.
9. WhatsApp messages are sent only with appropriate consent and approved templates.
10. Booking/meeting workflow confirms actual availability and records the outcome.
11. Analytics records funnel events and source attribution.
12. Test data can be deleted and no real customer receives test messages.

**Current blocker:** screenshot evidence proves the form failed on a Vercel preview URL. Production-domain behavior and the backend failure cause are still unknown. Reproduce safely before deciding whether the issue is frontend validation, API route, Firebase/Firestore configuration, email notification, environment variables, or deployment mismatch.

## 6. Realistic completion estimate

These are engineering estimates, not a promise of AI rankings or leads.

| Delivery target | Estimate from 2026-11-01 | Notes |
|---|---:|---|
| Reconciled plan, prompt review and competitor shortlist | 0.5–1 working day | Includes owner freeze for two persona exceptions |
| First genuine 15-prompt AI baseline | 1–2 working days | Requires direct platform sessions/API access and evidence capture |
| Full 60-prompt measurement cycle + dashboard/store | 2–3 additional working days | Depends on platform limits and data-layer implementation |
| Scheduler, action workflow, security and release QA | 1–2 additional working days | Includes controlled test environment |
| Pilot form + lead funnel verification/fix | 0.5–2 working days | Depends on backend diagnosis and provider configuration |

**Planning estimate:** 5–7 working days for an internal AEO v1 that can collect, store, report and route evidence through an approval-gated workflow. Add 0.5–2 days if the pilot form needs backend/environment remediation. Full CRM/WhatsApp/payment and customer-operations certification is a separate scope and should not be declared complete from the AEO release.

This estimate assumes existing GitHub/Vercel access remains valid, staging is available, and no missing credentials/provider approvals block implementation. If direct AI platform sessions are unavailable, the system can be built and tested with clearly labelled fixtures, but the real baseline remains blocked until genuine platform answers can be captured.

## 7. Definition of Done — no more “complete” without proof

AEO v1 is DONE only when:
- [ ] V2 prompt set is frozen with version history and all 60 IDs mapped.
- [ ] Competitor register is sourced and approved.
- [ ] At least the first 15 prompts have genuine captures on each selected platform.
- [ ] Every observation has raw evidence, timestamp, locale, platform, exact prompt and evidence reference.
- [ ] Schema validation passes for valid and invalid fixtures.
- [ ] Dashboard reports real numerator/denominator metrics and visible failures.
- [ ] Four-week schedule, retries, deduplication and alerts are demonstrated.
- [ ] At least one real observation creates a content/technical work item and completes staging → approval → re-audit.
- [ ] Role/tenant isolation and production approval gates pass.
- [ ] Business lead form and owner notification are proven end to end.
- [ ] Preview browser QA, CI, security checks and rollback evidence pass.
- [ ] PR is reviewed, merged with approval, and production deployment is verified.

## 8. Research guardrails — what AEO can and cannot promise

- Google’s current Search Central guidance says normal SEO fundamentals remain the basis for AI Overviews/AI Mode; there is no special schema or mandatory llms.txt file that guarantees inclusion. Pages must meet Search indexing/snippet eligibility and still may not be crawled, indexed or shown.
- Google’s 2026 guidance says to use Search Console’s Generative AI performance report and Search generative AI control for supported Search AI surfaces.
- OpenAI’s crawler guidance distinguishes OAI-SearchBot (ChatGPT Search discovery) from GPTBot (training-related crawling); allowing one does not mean the other is allowed.
- Therefore: technical crawlability is necessary but not a visibility result; AI platform answers must be measured independently.

## 9. Current repository release facts
- PR #18 is merged; main production commit: `162436716c596e6104fbd9776c647245b81faa9d`.
- Production deployment: `dpl_7DiCJrcabb97qfSANTb8Y8wSUfqB`, READY, aliases include `quickkitai.com`.
- PR #19: `https://github.com/princepinku143c-cyber/Quickkit-internal-ai-services/pull/19`; draft, open, unmerged.
- Working branch: `aeo/measurement-pack-20261101`.
- Latest side-by-side prompt review commit: `eadb90b2a6fb2385648bc56174582119643d9c8d`; Vercel preview build was BUILDING at last check.
- Latest branch includes an existing `components/seo/SEOAudit.tsx` change plus AEO documents; review the full diff, not only the documentation.
- No changes to VPS, Firebase, WhatsApp, QR or production were made in this AEO measurement-pack branch.

## 10. Operating rule
Work sequentially from P0 to P1. Do not restart completed work, do not create duplicate plans, do not report a simulation as live, do not merge/publish without the agreed approval gate, and do not ask the owner to re-authorize every internal non-production step. Ask only when a genuine business decision, credential, external side effect or production approval is required.
