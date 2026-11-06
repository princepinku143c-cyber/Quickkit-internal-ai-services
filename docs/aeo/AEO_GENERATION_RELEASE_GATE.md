# AEO Generation Release Gate

## Implemented in this branch

- Server-side OpenCode-compatible generation service. Provider credentials remain server-side.
- Endpoint and model overrides use OPENCODE_API_URL and OPENCODE_MODEL.
- Admin-only POST /api/aeo-generate endpoint with Firebase ID token verification and Firestore role check.
- Per-admin rate limit of 3 requests per minute; request size, keyword, context and count are bounded.
- Generated Q&A pairs are saved in Firestore aeo_generations as draft with reviewRequired true.
- Admin UI is available at /admin-aeo and through the Admin sidebar as AEO Content Studio.
- The UI copies draft text but does not publish it automatically.
- Provider responses are validated and bounded before storage.

## Environment

Required server-side secret: OPENCODE_API_KEY

Optional server-side overrides:
- OPENCODE_API_URL (defaults to OpenCode Zen chat completions endpoint)
- OPENCODE_MODEL (defaults to deepseek-v4-flash)

Never add provider secrets to VITE_* variables, source files, browser storage, or client requests.

## Automated verification

Run npm run test:aeo-agent, npm run test:aeo-api, npm run test:security, npm run test:rank-tracker, npm run test:seo, npx tsc --noEmit, and npm run build.

## Release blockers / human verification

1. Confirm the OpenCode account supports the configured model and has sufficient credits/entitlement.
2. Sign in with a Firebase account whose Firestore users/{uid}.role is admin.
3. On the preview deployment, open /admin-aeo, generate one small draft, and verify a Firestore aeo_generations record is created.
4. Review the draft for factual accuracy, source support, and brand claims before publication.
5. Only after preview acceptance should the PR be reviewed and merged. Production deployment is intentionally not triggered by this work.

## Measurement caveat

A generated answer is not evidence that an AI search engine mentions, recommends, or cites the business. Visibility reporting must store the exact prompt, engine/surface, observation time, raw response or permitted excerpt, cited URLs, and reviewer outcome. Ranking and citation improvements cannot be guaranteed.
