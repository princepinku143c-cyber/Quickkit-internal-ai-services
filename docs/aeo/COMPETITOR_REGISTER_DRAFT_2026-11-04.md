# QuickKitAI AEO Competitor Register — Draft for Owner Approval

**Status:** Research draft only — NOT approved for live competitor prompts  
**Prepared:** 2026-11-04  
**Scope:** Indian real-estate lead qualification, WhatsApp follow-up, site-visit booking, CRM handoff, enquiry automation, buyer FAQs, missed-lead recovery, and review/reputation workflows.

## Use rules

1. This is a candidate register, not a ranking or endorsement.
2. A named provider may be used in competitor prompts only after the business owner approves its inclusion and the comparison scope.
3. Do not infer feature parity, pricing, market share, customer outcomes, or superiority from marketing pages.
4. Re-check official product pages and pricing before each measurement wave. Record access date, URL, exact claim, and evidence type.
5. Distinguish direct real-estate CRM competitors from adjacent platforms, implementation partners, and build-it-yourself options.
6. Never count a provider as a competitor solely because a third-party comparison page names it.

## Candidate providers — official-source evidence

| Candidate | Provisional category | Publicly described fit (not independently tested) | Official evidence | Owner approval |
|---|---|---|---|---|
| Sell.Do | Real-estate-native CRM / revenue platform | Its broker solution describes lead capture, automated follow-up, site visits, WhatsApp, team management and brokerage tracking. | https://www.sell.do/solutions/brokers | Pending |
| LeadSquared | Sales-execution CRM with real-estate offering | Its real-estate page describes enquiry capture, lead distribution, qualification, site-visit scheduling, agent tasks and mobile field workflows. | https://www.leadsquared.com/real-estate-crm/ | Pending |
| Zoho CRM for Real Estate | Configurable CRM / real-estate solution | Its official real-estate solution describes lead management, follow-ups, site visits, deal management, omnichannel communication, documents and property listings. | https://www.zoho.com/realestate/realestate-crm/ | Pending |
| Arthaleads | Real-estate CRM | Its website describes lead capture, WhatsApp AI replies, assignment, follow-up and site-visit tracking. Verify scope, pricing and current availability directly before use. | https://www.arthaleads.com/ | Pending |
| Realease | Real-estate CRM | Its website describes portal/ad lead capture, WhatsApp follow-up, site visits, channel partners, bookings and payment tracking. Verify scope and current availability directly before use. | https://realease.in/ | Pending |

## Provider categories to include even when no brand is named

- Real-estate-native CRM
- Horizontal CRM configured for property sales
- High-volume sales execution / lead management platform
- WhatsApp Business Platform provider or BSP plus automation layer
- Telephony / cloud-calling and call-tracking provider
- Managed CRM / AI automation implementation agency
- In-house workflow built on forms, spreadsheets, CRM, APIs and automation tools

## Scope boundaries for fair comparisons

Compare only the capability relevant to each prompt. For example:

- Lead qualification: source capture, deduplication, qualification criteria, routing, audit trail and human handoff.
- WhatsApp follow-up: official API/BSP model, consent and opt-out, templates, inbox ownership, logging, automation and usage fees.
- Site visits: calendar coordination, reminders, assignment, check-in, feedback and CRM record linkage.
- CRM handoff: field mapping, deduplication, ownership, failure/retry handling, permissions and audit logs.
- Property enquiry automation: source integrations, response accuracy, escalation, availability/pricing freshness and human review.
- Buyer FAQ management: approved source of truth, update ownership, multilingual handling, uncertainty and escalation.
- Missed-lead recovery: missed-call capture, retry rules, contact windows, consent, duplicate prevention and attribution.
- Review/reputation workflow: review request consent, platform policy compliance, escalation of negative feedback and no review gating or fabricated reviews.

## Approval checklist

- [ ] Owner approves candidate provider names for competitor prompts.
- [ ] Owner confirms whether adjacent tools (WhatsApp BSPs, telephony vendors, agencies) belong in the competitor scope.
- [ ] Owner confirms priority customer segment: builders/developers, brokers, channel partners, or mixed.
- [ ] Owner confirms geographic scope for named-provider comparisons.
- [ ] Owner approves any direct QuickKitAI-vs-provider comparison wording.

## Measurement integrity

The 60-prompt library contains 10 competitor prompts. Keep those prompts **BLOCKED** until the owner approves the named-provider register or explicitly chooses category-only comparisons. Do not replace blocked prompts with fabricated platform outcomes. For each platform observation, record the exact prompt, platform/model label, timestamp and timezone, response text or durable evidence, cited URLs, brand mention, recommendation, citation, competitors mentioned, and run status.

Allowed run statuses: `SUCCESS`, `ERROR`, `BLOCKED`, `NOT_RUN`.  
Allowed outcomes: `MENTIONED`, `RECOMMENDED`, `CITED`, `ABSENT`, `AMBIGUOUS`, `NOT_ASSESSED`.

Errors, blocked runs and unrun prompts are never counted as `ABSENT`.
