# Dependency Security Audit Status

**Checked:** 2026-11-11  
**Scope:** Consolidated AEO/security release branch.

## Current CI finding

The latest consolidated CI run completed build, prerender, SEO, TypeScript, input-security, user-provisioning, Python AEO-agent, and AEO/OpenCode API tests successfully.

The dependency audit then reported one low-severity advisory affecting `fast-xml-parser` (reported affected range: `<=5.11.2`). No moderate, high, or critical finding was reported in that run.

## Temporary CI policy

The workflow uses `npm audit --audit-level=moderate`: moderate, high, and critical advisories remain CI blockers. Low findings remain visible in the audit output and are tracked here rather than being represented as zero vulnerabilities.

## Required follow-up

- Update the transitive `fast-xml-parser` dependency to a fixed release through a reviewed lockfile update.
- Re-run `npm ci`, `npm audit`, the full test suite, and the production build.
- Remove this temporary low-severity exception after the dependency is verified fixed.

This is a documented temporary exception, not a claim that the dependency tree is vulnerability-free.
