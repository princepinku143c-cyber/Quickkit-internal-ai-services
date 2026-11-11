# Dependency Security Audit Status

**Checked:** 2026-11-11  
**Scope:** Consolidated AEO/security release branch.

## Finding and remediation

The root lockfile previously resolved the transitive `fast-xml-parser` dependency to **5.11.2**. A low-severity advisory published on 10 November 2026 affects versions before **5.12.0** and identifies 5.12.0 as the fixed release:

- CVE: [CVE-2026-126066](https://nvd.nist.gov/vuln/detail/CVE-2026-126066)
- GitHub advisory: [GHSA-474x-hrwr-fgx4](https://github.com/advisories/GHSA-474x-hrwr-fgx4)
- Fixed package release: [fast-xml-parser v5.12.0](https://github.com/NaturalIntelligence/fast-xml-parser/releases/tag/v5.12.0)

The PR branch lockfile now resolves:
- `fast-xml-parser`: **5.12.0**
- `is-unsafe`: **2.0.3**, satisfying the updated parser dependency range.
- Existing compatible transitive entries for `@nodable/entities`, `fast-xml-builder`, `path-expression-matcher`, `strnum`, `xml-naming`, and `anynum` are retained.

## Verification

GitHub Actions **Build & Verify #42993817594** completed successfully for commit `0925b88a959d1fa493928f6b1577f986d7ec4576`.

- `npm ci`: passed.
- `npm ci` audit summary: **0 vulnerabilities**.
- Production build and route prerender: passed.
- SEO/prerender validation: passed.
- TypeScript and all security/API/AEO regression tests: passed.
- Explicit `npm audit --audit-level=moderate`: **0 vulnerabilities**.

This verification is specific to the lockfile and dependency tree in that commit; continue running the audit on future dependency changes.
