import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const shell = await readFile(join(dist, 'index.html'), 'utf8');

const DATE_PUBLISHED = '2026-11-18T12:00:00+05:30';
const DATE_MODIFIED = '2026-11-27T18:00:00+05:30';

const ALL_SITEMAP_LINKS = [
  ['/', 'Home'],
  ['/ai-visibility', 'AI Visibility & AEO'],
  ['/proof-of-value', 'Proof of Value'],
  ['/live-demo', 'Live Demo'],
  ['/services/real-estate', 'Real Estate AI'],
  ['/services/healthcare', 'Healthcare AI'],
  ['/guides/real-estate-ai-lead-qualification', 'Lead Qualification Guide'],
  ['/real-estate-ai-questions', 'Real Estate AI FAQ'],
  ['/blog', 'Knowledge Hub'],
  ['/seo-audit', 'SEO & AI Readiness Audit'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
];

const EXTERNAL_REFERENCES_HTML = `
<section aria-label="Technical standards and external references">
  <h2>Technical Standards &amp; Authoritative References</h2>
  <p>Every QuickKitAI and Raja AI Systems technical audit validates crawler accessibility, structured JSON-LD graphs, and machine-readable documentation against public standards: <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" rel="noopener noreferrer">Google Helpful Content Documentation</a>, <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" rel="noopener noreferrer">Google Structured Data Guidelines</a>, <a href="https://schema.org/" rel="noopener noreferrer">Schema.org Vocabulary</a>, and the <a href="https://llmstxt.org/" rel="noopener noreferrer">llms.txt Machine-Readable Standard</a>.</p>
</section>`;

const pages = [
  {
    path: 'ai-visibility',
    sectionName: 'Services',
    sectionUrl: 'https://quickkitai.com/services/real-estate',
    title: 'AI Visibility & AEO Services India | QuickKitAI',
    description: 'Evidence-first AEO & AI visibility services for ChatGPT, Perplexity, Gemini and Google. Tier 01 ₹15,000 pay-after-result; Tier 02 ₹25,000/month.',
    keywords: 'AEO services India, AI visibility audit, generative engine optimization, ChatGPT visibility, Perplexity citations, QuickKitAI',
    heading: 'AI Visibility and AEO Services',
    tldr: 'QuickKitAI delivers evidence-first Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) in two transparent plans: Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance), and Tier 02: ₹25,000/month + ₹20,000 setup. All outcomes are measured against baseline benchmarks such as 683ms TTFB and 5-entity schema validation without unverified ranking guarantees.',
    summary: 'Raja AI Systems (QuickKitAI) measures how businesses are parsed across ChatGPT, Perplexity, Claude, Gemini and Google Search, then ships verified schema, llms.txt, and content improvements. Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance). Tier 02: ₹25,000/month + ₹20,000 setup.',
    links: [['/proof-of-value', 'Inspect live Proof of Value metrics'], ['/seo-audit', 'Review the SEO and AI-search audit'], ['/contact', 'Book an AEO audit or pilot']],
    bodyHtml: `
<section>
  <h2>AEO Service Plans &amp; Transparent Pricing</h2>
  <p>Our commercial structure eliminates upfront risk for Indian businesses adopting Answer Engine Optimization and Generative Engine Optimization across 14 core crawlable signals:</p>
  <ul>
    <li><strong>Tier 01 — Technical AEO Foundation:</strong> Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance). Anchored at 50% below typical ₹30,000 enterprise technical audits, delivered within 7 business days with ₹0 monthly maintenance fees. Payment is due only after passing Google Rich Results validation and live crawler checks.</li>
    <li><strong>Tier 02 — Autonomous AI Search Growth &amp; Sentinel:</strong> Tier 02: ₹25,000/month + ₹20,000 setup on a 30-day rolling engagement. Includes continuous monitoring across 50+ buyer prompts, bi-weekly citation evidence PDFs, dynamic schema expansion, and automated uptime/robots checks.</li>
  </ul>
</section>
<section>
  <h2>The Tri-Engine Strategy: SEO + AEO + GEO</h2>
  <p>Traditional search optimization alone misses direct AI answer synthesis. QuickKitAI deploys a unified 3-layer architecture grounded in our 683ms benchmark TTFB and 5-entity JSON-LD <code>@graph</code> model:</p>
  <ul>
    <li><strong>Layer 1 — Foundational SEO:</strong> Guarantees 100% HTTP 200 indexability across all 14 sitemap URLs, canonical URL consistency, strict single-<code>&lt;h1&gt;</code> document outlines, and sub-700ms server response latency.</li>
    <li><strong>Layer 2 — Answer Engine Optimization (AEO):</strong> Structures headings with concise 40–60 word Bottom-Line-Up-Front (BLUF) direct answers, <code>FAQPage</code> markup, and <code>llms.txt</code> summaries so Perplexity and Google AI Overviews extract accurate facts.</li>
    <li><strong>Layer 3 — Generative Engine Optimization (GEO):</strong> Grounds brand entities with verifiable numbers (for example, 683ms benchmark TTFB, 14 sitemap URLs, and pilot targets such as target: 8–10 site visits per month, measured in pilot) rather than unverified ranking promises.</li>
  </ul>
</section>
<section>
  <h2>5-Dimension AI Visibility Audit Matrix</h2>
  <table>
    <caption>Five technical dimensions evaluated during every QuickKitAI AEO audit</caption>
    <thead>
      <tr><th>Dimension</th><th>Verified Benchmark</th><th>Inspection Method</th></tr>
    </thead>
    <tbody>
      <tr><th>1. AI Crawler Policy</th><td>HTTP 200 for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot</td><td>robots.txt directive audit and header response testing</td></tr>
      <tr><th>2. JSON-LD Schema Graph</th><td>5-entity valid Organization, WebSite, WebPage, Article, BreadcrumbList</td><td>Schema.org and Google Rich Results validation</td></tr>
      <tr><th>3. Machine-Readable Context</th><td>Active /llms.txt and /llms-full.txt with verified pricing</td><td>UTF-8 plain-text endpoint probe and token inspection</td></tr>
      <tr><th>4. Answer-First Density</th><td>350+ words per page with &ge;1.5 verified metrics per 100 words</td><td>DOM word extraction and BLUF chunk simulation</td></tr>
      <tr><th>5. Attribution &amp; Freshness</th><td>Explicit Person author, datePublished, and dateModified timestamps</td><td>Live metadata diffing across recurring 14-day cycles</td></tr>
    </tbody>
  </table>
</section>`
  },
  {
    path: 'proof-of-value',
    sectionName: 'AEO & Proof',
    sectionUrl: 'https://quickkitai.com/ai-visibility',
    title: 'Proof of Value: AI Automation & AEO | QuickKitAI',
    description: 'Measured AEO benchmark proof for QuickKitAI: 683ms TTFB, 5-entity @graph schema, 14 sitemap URLs, and transparent pilot evaluation methodology.',
    keywords: 'AI automation proof of value, QuickKitAI AEO audit, 683ms TTFB benchmark, real estate AI pilot metrics',
    heading: 'Proof of Value for AI Automation and AI Visibility',
    tldr: 'QuickKitAI separates verified engineering benchmarks from client business outcomes. Our live production baseline records 683ms TTFB, 14 of 14 sitemap URLs returning HTTP 200, and a 5-entity JSON-LD @graph, while real-estate operational pilots track a target: 8–10 site visits per month, measured in pilot against a recorded baseline.',
    summary: 'Raja AI Systems publishes observable technical evidence separately from client commercial results. Live QuickKitAI engineering metrics, audit methodology, and controlled pilot targets are documented without ranking, citation, or lead guarantees.',
    links: [['/ai-visibility', 'Review AEO Tier 01 and Tier 02 plans'], ['/live-demo', 'Inspect the controlled workflow demo'], ['/contact', 'Scope a controlled pilot']],
    bodyHtml: `
<section>
  <h2>Live QuickKitAI Technical Benchmark (Self-Audited Proof)</h2>
  <p>Before recommending technical changes to clients, QuickKitAI applies the exact same AEO and GEO engineering standard to <code>quickkitai.com</code> and compares it against real-world Indian category sites audited in November 2026:</p>
  <table>
    <caption>Live infrastructure and AEO telemetry measured across production endpoints</caption>
    <thead>
      <tr><th>Metric</th><th>QuickKitAI Baseline</th><th>Observed Legacy Site Range</th></tr>
    </thead>
    <tbody>
      <tr><th>Time to First Byte (TTFB)</th><td>683ms average</td><td>1,474ms to 2,045ms</td></tr>
      <tr><th>Indexable Sitemap Routes</th><td>14 / 14 routes HTTP 200</td><td>Often fragmented or soft-200</td></tr>
      <tr><th>Machine-Readable llms.txt</th><td>Active at /llms.txt &amp; /llms-full.txt</td><td>404 Not Found on 3 of 3 audited peers</td></tr>
      <tr><th>Structured Data Graph</th><td>5-entity unified JSON-LD @graph</td><td>Missing FAQPage or broken Organization blocks</td></tr>
      <tr><th>Title &amp; Meta Compliance</th><td>100% titles 30–60 chars, desc 70–160 chars</td><td>Truncated 70+ char titles or thin meta</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Controlled Pilot Measurement Framework</h2>
  <p>Operational ROI in Indian real estate and clinic workflows is evaluated strictly through pre-defined pilot acceptance criteria rather than blanket guarantees:</p>
  <ul>
    <li><strong>Inbound Lead Response Latency:</strong> Automated WhatsApp intake logs response timestamps in SQLite WAL storage against a &le;12-second operational target during 24/7 intake windows.</li>
    <li><strong>Site-Visit Attendance Tracking:</strong> Multi-stage T-24h gate-pass and T-2h Google Maps pin workflows are measured against the client's historical 30-day baseline (target: 8–10 site visits per month, measured in pilot across 60–80 qualified enquiries).</li>
    <li><strong>Dormant CRM Re-Engagement:</strong> Controlled batches of 300–500 inactive records (&gt;14 days untouched) are tested at a strict 20 messages/hour safety cap using 9-word plain-text check-ins, recording reply rate and booked walkthroughs in verifiable audit logs.</li>
    <li><strong>Honest Attribution Rules:</strong> Tier 01 AEO (₹15,000 one-time, ₹0 advance) is billed only upon live technical validation, while Tier 02 (₹20,000 setup + ₹25,000/month) documents every prompt observation with timestamped evidence.</li>
  </ul>
</section>`
  },
  {
    path: 'live-demo',
    sectionName: 'Proof of Value',
    sectionUrl: 'https://quickkitai.com/proof-of-value',
    title: 'Live AI Workflow Demonstration | QuickKitAI',
    description: 'Controlled technical demonstration of real-estate lead qualification, WhatsApp follow-up, and CRM handoff workflows with transparent acceptance tests.',
    keywords: 'live AI workflow demo, real estate AI demonstration, WhatsApp lead qualification demo, QuickKitAI',
    heading: 'Live AI Workflow Demonstration',
    tldr: 'This controlled demonstration documents the exact 4-stage intake, qualification, slot-offering, and CRM-handoff pipeline tested before any client pilot goes live. It validates technical behavior across 5 verification checkpoints without claiming simulated outputs represent live client revenue.',
    summary: 'A transparent technical walkthrough of how QuickKitAI executes property enquiry normalization, conversational qualification, weekend slot calculation, and advisor CRM handoff during pre-deployment acceptance testing.',
    links: [['/proof-of-value', 'Review the proof-of-value benchmarks'], ['/guides/real-estate-ai-lead-qualification', 'Read the 4-stage qualification guide'], ['/contact', 'Request a live guided walkthrough']],
    bodyHtml: `
<section>
  <h2>What the Controlled Acceptance Test Verifies</h2>
  <p>Every QuickKitAI managed AI deployment passes a 5-step technical acceptance checklist on staging before touching production lead traffic:</p>
  <ol>
    <li><strong>Webhook Intake &amp; Input Sanitization:</strong> Incoming form or Meta Lead Ad payloads are validated against strict schema rules, normalizing +91 Indian mobile numbers and stripping unsafe HTML/script sequences in under 150ms.</li>
    <li><strong>Stage-by-Stage Qualification State Machine:</strong> The workflow records 4 structured qualification attributes (project interest, budget bracket, configuration, and purchase timeline) in persistent SQLite WAL storage without repeating already-answered questions.</li>
    <li><strong>IST Dynamic Calendar Slot Calculation:</strong> Using Asia/Kolkata (UTC+05:30) server time, the scheduler proposes 2 concrete upcoming weekend walkthrough windows (for example Saturday 11:00 AM or Sunday 3:00 PM) and confirms advisor availability.</li>
    <li><strong>Automated Reminder Arming (T-24h &amp; T-2h):</strong> Once a slot is confirmed, two scheduled jobs are registered: a 24-hour confirmation check and a 2-hour pre-visit dispatch containing the exact Google Maps pin and advisor phone number.</li>
    <li><strong>Human Escalation &amp; CRM Sync:</strong> High-intent requests or 1–3 star post-visit feedback items trigger an immediate leadership escalation payload within 15 minutes.</li>
  </ol>
</section>
<section>
  <h2>Scope Boundary &amp; Pilot Transparency</h2>
  <p>A live workflow demonstration proves deterministic routing, latency (benchmarked at 683ms on core web surfaces and &le;12 seconds on messaging webhooks), and schema compliance. Actual lead conversion rates depend on ad targeting, project pricing, and advisor follow-through, which is why operational metrics such as our target: 8–10 site visits per month, measured in pilot are evaluated only over a 30-day production window with 60–80 real inbound enquiries.</p>
</section>`
  },
  {
    path: 'services/real-estate',
    sectionName: 'Services',
    sectionUrl: 'https://quickkitai.com/ai-visibility',
    title: 'Real Estate AI Automation in India | QuickKitAI',
    description: 'Managed 5-agent AI workforce for Indian real estate teams: WhatsApp lead qualification, follow-up, site-visit scheduling, and CRM handoff workflows.',
    keywords: 'real estate AI automation India, property lead qualification, WhatsApp follow-up, site visit coordination, real estate CRM workflows',
    heading: 'AI Automation for Real Estate Teams in India',
    tldr: 'Raja AI Systems deploys a 5-agent managed AI workflow for Indian real estate builders and channel partners at ₹35,000 setup + ₹1,20,000/month, engineered for sub-12-second WhatsApp intake, T-24h/T-2h visit reminders, and a target: 8–10 site visits per month, measured in pilot across 60–80 inbound leads.',
    summary: 'Managed AI-assisted workflows for property enquiry intake, lead qualification, Hinglish follow-up, site-visit coordination, and CRM handoff. Channels, integrations, and operational targets are scoped and tested per deployment.',
    links: [['/guides/real-estate-ai-lead-qualification', 'Read the 4-stage qualification guide'], ['/real-estate-ai-questions', 'Browse real-estate AI FAQ'], ['/contact', 'Discuss a real-estate pilot']],
    bodyHtml: `
<section>
  <h2>The 5-Agent Autonomous Real Estate Workforce</h2>
  <p>Indian luxury developers and channel partners frequently lose high-ticket buyers between 9:00 PM and 9:00 AM when human sales desks are offline. Raja AI Systems operates a dedicated 5-agent workflow on isolated Linux infrastructure:</p>
  <ul>
    <li><strong>Agent 1 — Inbound Closer:</strong> Greets inbound portal and Meta leads 24/7 with conversational Hindi/Hinglish text and neural voice notes, captures budget and configuration across 4 stages, and books verified walkthrough slots.</li>
    <li><strong>Agent 2 — Market &amp; Broker Prospector:</strong> Organizes micro-market inventory updates and B2B channel partner intelligence across target NCR, Mumbai, and Bengaluru corridors.</li>
    <li><strong>Agent 3 — CRM Sentinel &amp; No-Show Guard:</strong> Dispatches T-24h gate-pass confirmations and T-2h live Google Maps location pins to reduce pre-visit drop-offs compared to manual reminder calls.</li>
    <li><strong>Agent 4 — Dormant Lead Re-Engager:</strong> Reviews CRM leads untouched for 14+ days and sends personalized 9-word check-ins capped at 20 messages per hour to surface active buyers safely.</li>
    <li><strong>Agent 5 — Post-Visit Reputation Sentinel:</strong> Requests walkthrough feedback 2 hours after visit completion, routing positive 4–5 star ratings to Google Reviews while escalating 1–3 star concerns privately to leadership within 15 minutes.</li>
  </ul>
</section>
<section>
  <h2>Operating Model Comparison in Indian Real Estate</h2>
  <table>
    <caption>Operational comparison across real estate lead-handling models</caption>
    <thead>
      <tr><th>Operating Dimension</th><th>Manual Sales Desk</th><th>Generic SaaS Bot</th><th>Raja AI Systems (5-Agent Workforce)</th></tr>
    </thead>
    <tbody>
      <tr><th>Initial Enquiry Handling</th><td>1 to 4 hours average delay</td><td>Static menu buttons</td><td>Automated 24/7 Hinglish text + voice intake</td></tr>
      <tr><th>After-Hours Coverage (9 PM–9 AM)</th><td>Queued until next morning</td><td>Offline capture form</td><td>Continuous live qualification 24/7</td></tr>
      <tr><th>Pre-Visit Confirmation</th><td>Ad-hoc manual calling</td><td>Not included</td><td>Automated T-24h pass + T-2h Google Maps pin</td></tr>
      <tr><th>Commercial Structure</th><td>₹4,00,000–₹6,00,000/mo payroll</td><td>₹10,000/mo self-managed</td><td>₹35,000 setup + ₹1,20,000/mo managed retainer</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Commercial Scope &amp; Pilot Evaluation</h2>
  <p>Managed real-estate deployment is priced at ₹35,000 one-time setup and ₹1,20,000/month retainer. Every engagement sets an explicit operational target: 8–10 site visits per month, measured in pilot against a minimum baseline of 60 to 80 qualified inbound enquiries per 30-day cycle, tracked transparently in your client portal without unverified lead guarantees. Teams looking purely for search visibility can start with AEO Tier 01 (₹15,000 one-time, pay after live verified result) or Tier 02 (₹20,000 setup + ₹25,000/month).</p>
</section>`
  },
  {
    path: 'services/healthcare',
    sectionName: 'Services',
    sectionUrl: 'https://quickkitai.com/services/real-estate',
    title: 'Healthcare Clinic AI Automation India | QuickKitAI',
    description: 'Project-scoped AI workflow automation for Indian healthcare clinics covering patient enquiries, intake forms, and appointment coordination.',
    keywords: 'healthcare AI automation India, clinic enquiry intake, appointment coordination, dental clinic AI workflow',
    heading: 'AI Agents for Healthcare Clinics in India',
    tldr: 'QuickKitAI provides secondary, strictly non-clinical administrative automation for Indian dental and specialty clinics—handling enquiry intake, treatment FAQ routing, T-24h/T-2h appointment reminders, and AEO search visibility (Tier 01 ₹15,000 one-time or Tier 02 ₹25,000/month + ₹20,000 setup).',
    summary: 'Project-scoped administrative workflows for patient enquiry intake, appointment scheduling, pre-visit reminders, and clinic AEO visibility. All clinical decisions remain strictly with licensed healthcare practitioners.',
    links: [['/services/real-estate', 'View primary real-estate workflows'], ['/ai-visibility', 'Review clinic AEO & FAQPage plans'], ['/contact', 'Discuss clinic workflow scope']],
    bodyHtml: `
<section>
  <h2>Non-Clinical Administrative Scope for Indian Clinics</h2>
  <p>Multi-location dental practices, dermatology studios, and diagnostic centres in India frequently lose 30% to 40% of inbound consultation enquiries due to busy front-desk phone lines and unindexed treatment pages. QuickKitAI scopes strictly non-clinical workflows across three areas:</p>
  <ul>
    <li><strong>Enquiry Intake &amp; Triage Routing:</strong> Captures patient name, preferred clinic branch, and general consultation category (for example implant consultation, aligners, or routine screening) without issuing medical diagnoses or prescriptions.</li>
    <li><strong>Appointment Confirmation &amp; Directions:</strong> Sends automated T-24h confirmation prompts and T-2h Google Maps location pins to reduce empty chair slots across 2 to 6 daily doctor schedules.</li>
    <li><strong>Treatment FAQ &amp; AEO Visibility:</strong> Implements structured <code>FAQPage</code> schema, <code>llms.txt</code> treatment summaries, and 683ms-class fast static routing so patients asking Perplexity or Google AI Overviews find accurate clinic hours, locations, and doctor credentials.</li>
  </ul>
</section>
<section>
  <h2>Privacy, Compliance &amp; Commercial Options</h2>
  <p>Before deploying any clinic automation, data flows, WhatsApp Business API permissions, and retention windows (typically 30 to 90 days for enquiry metadata) are reviewed in writing. Clinics seeking purely AI search visibility can start with AEO Tier 01 (₹15,000 one-time, pay after live verified result with ₹0 advance) or Tier 02 (₹20,000 setup + ₹25,000/month); custom administrative workflow pilots are scoped separately per branch count and CRM integration.</p>
</section>`
  },
  {
    path: 'guides/real-estate-ai-lead-qualification',
    sectionName: 'Knowledge Hub',
    sectionUrl: 'https://quickkitai.com/blog',
    title: 'Real Estate AI Lead Qualification Guide | QuickKitAI',
    description: 'Practical 4-stage guide to AI property lead qualification, WhatsApp follow-up, CRM handoff, and site-visit booking for Indian builders and brokers.',
    keywords: 'real estate lead qualification, property enquiries, WhatsApp follow-up, CRM handoff, site visit booking India',
    heading: 'AI Lead Qualification for Real Estate in India',
    tldr: 'Replacing static 7-field web forms with a 4-stage conversational WhatsApp flow cuts buyer friction, normalizes +91 enquiry data, offers 2 live weekend walkthrough slots in IST, and arms T-24h/T-2h reminders toward a target: 8–10 site visits per month, measured in pilot.',
    summary: 'A practical engineering guide covering minimum viable qualification fields, conversational Hinglish follow-up, dynamic IST slot calculation, CRM handoff, and baseline measurement.',
    links: [['/services/real-estate', 'Explore the 5-agent real-estate service'], ['/real-estate-ai-questions', 'Read related real-estate FAQs'], ['/contact', 'Discuss a pilot']],
    bodyHtml: `
<section>
  <h2>The 4-Stage Lead Qualification Architecture</h2>
  <p>Standard real-estate landing page forms routinely suffer 60% to 70% abandonment when buyers are asked for budget, configuration, and visit dates upfront. A structured conversational flow splits qualification into 4 low-friction stages:</p>
  <ol>
    <li><strong>Stage 1 — Enquiry Acknowledgment (&lt;15 seconds):</strong> Normalize the incoming +91 phone number, log the campaign source, and greet the buyer referencing the exact micro-market or tower name (for example Sector 63 Gurugram or 4 BHK luxury inventory).</li>
    <li><strong>Stage 2 — Intent &amp; Budget Banding:</strong> Ask 2 concise questions covering self-use versus investment intent and approximate ticket size (such as ₹3 Cr–₹5 Cr or ₹5 Cr+) without interrogating the prospect.</li>
    <li><strong>Stage 3 — Dynamic IST Slot Offering:</strong> Compute the current Asia/Kolkata timestamp and offer 2 concrete upcoming weekend walkthrough times (for example Saturday 11:00 AM or Sunday 3:00 PM) rather than an open-ended "when are you free?" prompt.</li>
    <li><strong>Stage 4 — CRM Sync &amp; Reminder Arming:</strong> Commit the structured record to SQLite WAL / client CRM, assign the senior relationship manager, and arm automated T-24h and T-2h reminders with a direct Google Maps pin.</li>
  </ol>
</section>
<section>
  <h2>Measuring Pilot Outcomes Honestly</h2>
  <p>Every workflow should be benchmarked over a 30-day baseline (minimum 60 to 80 inbound enquiries) tracking 4 concrete numbers: median response latency, qualification completion rate, confirmed walkthrough count (target: 8–10 site visits per month, measured in pilot), and show-up ratio after T-2h map dispatch.</p>
</section>`
  },
  {
    path: 'real-estate-ai-questions',
    sectionName: 'Knowledge Hub',
    sectionUrl: 'https://quickkitai.com/blog',
    title: 'Real Estate AI Agent FAQ & Answers | QuickKitAI',
    description: 'Clear answers on Indian real estate AI agents, WhatsApp lead qualification, Hinglish voice notes, CRM handoff, site visits, and pilot pricing.',
    keywords: 'real estate AI FAQ India, property lead qualification, WhatsApp AI, CRM workflows, AI site visit booking',
    heading: 'Real Estate AI Agent Questions & Answers',
    tldr: 'Answers to the 5 core questions Indian builders and channel partners ask before deploying an AI workforce: response speed, Hinglish voice quality, no-show prevention, dormant lead recovery, and transparent pilot pricing (₹35,000 setup + ₹1,20,000/month or AEO Tier 01 ₹15,000).',
    summary: 'Direct, evidence-backed answers on lead qualification, Hinglish WhatsApp workflows, T-24h/T-2h site-visit reminders, CRM handoff, and commercial terms for Indian real-estate teams.',
    links: [['/guides/real-estate-ai-lead-qualification', 'Read the 4-stage qualification guide'], ['/services/real-estate', 'Review the 5-agent service scope'], ['/contact', 'Ask about a custom workflow']],
    bodyHtml: `
<section>
  <h2>Frequently Asked Questions on Real Estate AI Automation in India</h2>
  <article>
    <h3>1. How fast does Raja AI Systems respond to inbound property leads?</h3>
    <p><strong>Direct Answer:</strong> Automated webhook intake is engineered to acknowledge new portal and Meta ad enquiries in under 12 seconds, 24 hours a day, using natural WhatsApp text and optional voice notes so evening and weekend leads do not wait 1 to 4 hours for a callback.</p>
  </article>
  <article>
    <h3>2. Can the AI communicate naturally in Hindi and Hinglish?</h3>
    <p><strong>Direct Answer:</strong> Yes. All scripts follow the respectful Taj Concierge protocol ("Aap", "Ji", concise courteous phrasing) and can pair structured WhatsApp text with neural Hindi/Hinglish voice notes rather than flat robotic TTS.</p>
  </article>
  <article>
    <h3>3. How does the workflow reduce site-visit no-shows?</h3>
    <p><strong>Direct Answer:</strong> Agent 3 (CRM Sentinel) sends an automated T-24h confirmation pass and a T-2h pre-visit dispatch containing a clickable Google Maps location pin, parking guidance, and the assigned advisor's direct number.</p>
  </article>
  <article>
    <h3>4. How does the Dormant Lead Recovery engine stay compliant with WhatsApp rules?</h3>
    <p><strong>Direct Answer:</strong> Agent 4 selects only records inactive for 14+ days, sends a non-spammy 9-word check-in question, and enforces a strict ceiling of 20 outbound messages per hour alongside opt-out handling.</p>
  </article>
  <article>
    <h3>5. What is the commercial pricing and pilot target?</h3>
    <p><strong>Direct Answer:</strong> The 5-agent managed real-estate workforce is ₹35,000 one-time setup plus ₹1,20,000/month retainer, operating with a target: 8–10 site visits per month, measured in pilot across 60 to 80 inbound enquiries. For AEO search visibility alone, Tier 01 is ₹15,000 one-time (pay after live verified result, ₹0 advance) and Tier 02 is ₹25,000/month + ₹20,000 setup.</p>
  </article>
</section>`
  },
  {
    path: 'blog',
    sectionName: 'Resources',
    sectionUrl: 'https://quickkitai.com/ai-visibility',
    title: 'Real Estate AI & AEO Knowledge Hub | QuickKitAI',
    description: 'Curated guides on Indian real estate AI lead qualification, WhatsApp workflows, CRM handoff, and AEO technical visibility benchmarks without fluff.',
    keywords: 'real estate AI guide India, property lead qualification, WhatsApp follow-up, CRM automation, AEO knowledge hub',
    heading: 'Real Estate AI & AEO Knowledge Hub',
    tldr: 'The QuickKitAI Knowledge Hub indexes 6 substantive engineering playbooks, audit benchmarks, and FAQ guides covering Indian real-estate AI workflows and AEO/GEO technical visibility—each maintained with verified numbers and zero thin placeholder stubs.',
    summary: 'Curated technical guides and benchmark documentation on Indian real-estate lead qualification, WhatsApp follow-ups, CRM handoff, and Answer Engine Optimization (AEO).',
    links: [['/guides/real-estate-ai-lead-qualification', '4-Stage Lead Qualification Guide'], ['/real-estate-ai-questions', 'Real Estate AI FAQ'], ['/proof-of-value', 'Live Benchmark Proof']],
    bodyHtml: `
<section>
  <h2>Published Guides &amp; Technical Playbooks</h2>
  <p>Rather than publishing 500-word AI-generated filler posts, QuickKitAI maintains a focused library of verified operational guides updated on 27 November 2026:</p>
  <ul>
    <li><strong><a href="/guides/real-estate-ai-lead-qualification">AI Lead Qualification for Real Estate in India (4-Stage Playbook):</a></strong> Covers +91 webhook normalization, 4-stage conversational qualification, dynamic IST weekend slot calculation, and T-24h/T-2h visit reminders.</li>
    <li><strong><a href="/real-estate-ai-questions">Real Estate AI Agent Questions &amp; Answers:</a></strong> 5 detailed answers covering response speed, Hinglish voice notes, 20-messages/hour dormant recovery limits, and ₹35,000 / ₹1,20,000 pricing.</li>
    <li><strong><a href="/ai-visibility">AI Visibility &amp; AEO Services (Tier 01 &amp; Tier 02):</a></strong> Explains how Tier 01 (₹15,000 one-time, ₹0 advance) and Tier 02 (₹20,000 setup + ₹25,000/month) engineer crawlability for ChatGPT, Perplexity, Gemini, and Google AI Overviews.</li>
    <li><strong><a href="/proof-of-value">Proof of Value &amp; 683ms Benchmark Telemetry:</a></strong> Side-by-side comparison of QuickKitAI's 683ms TTFB, 5-entity schema graph, and 14/14 indexable sitemap routes against audited legacy sites (1,474ms–2,045ms TTFB).</li>
    <li><strong><a href="/live-demo">Controlled Workflow Demonstration:</a></strong> Documents the 5 acceptance checks performed before launching any WhatsApp or CRM automation in production.</li>
  </ul>
</section>
<section>
  <h2>Editorial &amp; Verification Standard</h2>
  <p>Every article authored by Prince (Raja) on QuickKitAI adheres to 3 rules: at least 350 words of concrete implementation detail, &ge;1.5 verifiable numbers per 100 words, and zero fabricated rankings, guarantees, or unverified review counts.</p>
</section>`
  },
  {
    path: 'about',
    sectionName: 'Company',
    sectionUrl: 'https://quickkitai.com/contact',
    title: 'About QuickKitAI & Raja AI Systems | India',
    description: 'Meet Prince (Raja) and Raja AI Systems: evidence-first managed AI automation and AEO/GEO engineering for Indian real estate and service businesses.',
    keywords: 'about Raja AI Systems, Prince Raja, QuickKitAI, managed AI automation India, AEO engineering',
    heading: 'About QuickKitAI & Raja AI Systems',
    tldr: 'Founded by Prince (Raja) in India, Raja AI Systems (QuickKitAI) builds evidence-first managed AI workflows and AEO/GEO search infrastructure—anchored by verifiable metrics such as 683ms TTFB, 14 structured routes, and ₹0-advance Pay-After-Result Tier 01 AEO audits.',
    summary: 'Raja AI Systems (operating QuickKitAI) is an Indian AI systems and Answer Engine Optimization engineering practice led by Prince (Raja), focused on measurable workflow execution and transparent technical proof.',
    links: [['/services/real-estate', 'Explore Real Estate AI services'], ['/ai-visibility', 'Review AEO Tier 01 & Tier 02'], ['/contact', 'Contact Prince (Raja)']],
    bodyHtml: `
<section>
  <h2>Who Builds &amp; Operates QuickKitAI</h2>
  <p>Raja AI Systems (<code>quickkitai.com</code>) is founded and architected by <strong>Prince (Raja)</strong>, Founder &amp; Chief AI Systems Architect. Unlike generic SaaS resellers or agencies that sell unverified "rank #1" promises, our engineering practice focuses on two verifiable pillars:</p>
  <ul>
    <li><strong>Pillar 1 — Managed AI Operational Workflows:</strong> Custom 5-agent pipelines for Indian real-estate developers, luxury brokerages, and scoped healthcare clinics, handling 24/7 enquiry intake, 4-stage qualification, T-24h/T-2h appointment reminders, and CRM synchronization.</li>
    <li><strong>Pillar 2 — AEO &amp; GEO Technical Visibility:</strong> Engineering sub-700ms static HTML prerendering (683ms verified TTFB), 5-entity JSON-LD <code>@graph</code> schemas, <code>llms.txt</code> protocols, and Google Rich Results compliance across all 14 public URLs.</li>
  </ul>
</section>
<section>
  <h2>Core Operating Principles</h2>
  <ul>
    <li><strong>Zero Advance on Tier 01 AEO:</strong> Our ₹15,000 Tier 01 technical AEO package (50% below ₹30,000 enterprise rates) requires ₹0 advance—clients pay only after inspecting the live, verified result in Google Rich Results and crawler tests.</li>
    <li><strong>Pilot Targets Over Fake Guarantees:</strong> Operational engagements track measurable targets (such as target: 8–10 site visits per month, measured in pilot across 60–80 inbound leads) against a recorded baseline rather than guaranteeing lead volume or search rankings.</li>
    <li><strong>Direct Engineer Accountability:</strong> Reach our team directly at <code>admin@quickkitai.com</code> for technical audits, pilot scoping, and deployment reviews.</li>
  </ul>
</section>`
  },
  {
    path: 'contact',
    sectionName: 'Company',
    sectionUrl: 'https://quickkitai.com/about',
    title: 'Contact QuickKitAI | Book an AI or AEO Pilot',
    description: 'Contact Raja AI Systems to scope an AEO visibility audit or managed AI workflow pilot. Clear deliverables, verified metrics, and written scope.',
    keywords: 'contact Raja AI Systems, QuickKitAI contact, AI automation pilot, AEO audit India',
    heading: 'Contact Raja AI Systems (QuickKitAI)',
    tldr: 'Contact Prince (Raja) at admin@quickkitai.com to schedule either a Tier 01 AEO build (₹15,000 one-time, ₹0 advance, 7 business days), a Tier 02 AEO retainer (₹20,000 setup + ₹25,000/month), or a managed real-estate AI workflow pilot (₹35,000 setup + ₹1,20,000/month).',
    summary: 'Share your website URL, CRM stack, and current enquiry volume. Availability, integration feasibility, exact pricing, and acceptance criteria are confirmed in writing before any work begins.',
    links: [['/ai-visibility', 'Compare AEO Tier 01 & Tier 02'], ['/services/real-estate', 'Review Real Estate AI scope'], ['/proof-of-value', 'Inspect live proof benchmarks']],
    bodyHtml: `
<section>
  <h2>How to Scope an Engagement</h2>
  <p>Before initiating any deployment, we review 4 concrete inputs over a 15-minute technical scoping call or email thread at <code>admin@quickkitai.com</code>:</p>
  <ol>
    <li><strong>Primary Goal &amp; Tier Selection:</strong> Choose between AEO Tier 01 (₹15,000 one-time, pay after live verified result with ₹0 advance), AEO Tier 02 (₹20,000 setup + ₹25,000/month), or the 5-Agent Real Estate Workforce (₹35,000 setup + ₹1,20,000/month).</li>
    <li><strong>Current Technical Stack:</strong> Share your domain (for example React/Vite, Next.js, or WordPress), WhatsApp Business API provider, and CRM destination.</li>
    <li><strong>Baseline Volume:</strong> For real-estate pilots targeting 8–10 site visits per month (measured in pilot), confirm current monthly ad spend and 60–80 inbound enquiry baseline.</li>
    <li><strong>Acceptance Criteria:</strong> Written sign-off on exact deliverables—such as 14-route sitemap health, single-<code>&lt;h1&gt;</code> compliance, valid JSON-LD <code>@graph</code>, and sub-12-second webhook logging—before implementation starts.</li>
  </ol>
</section>
<section>
  <h2>Response Hours &amp; Direct Channel</h2>
  <p>Enquiries sent to <code>admin@quickkitai.com</code> are reviewed directly by Prince (Raja) during Indian Standard Time (IST, UTC+05:30) business hours, with initial technical pre-audits typically returned within 24 hours.</p>
</section>`
  },
  {
    path: 'seo-audit',
    sectionName: 'AI Visibility',
    sectionUrl: 'https://quickkitai.com/ai-visibility',
    title: 'SEO & AI Search Readiness Audit | QuickKitAI',
    description: 'Technical audit of crawlability, XML sitemaps, schema graphs, metadata, and AEO answer readiness measured against a timestamped baseline.',
    keywords: 'SEO audit, AI search readiness, AEO audit India, technical SEO, structured data validation',
    heading: 'SEO & AI Search Readiness Audit',
    tldr: 'Our technical readiness audit checks 5 core layers—crawler access, single-H1 HTML structure, 30–60 char titles / 70–160 char descriptions, JSON-LD @graph integrity, and llms.txt presence—with remediation available under Tier 01 (₹15,000 one-time, ₹0 advance) in 7 business days.',
    summary: 'An engineering-level technical review measuring crawlability, metadata bounds, sitemap health, JSON-LD schema accuracy, and AI answer-engine readiness against a timestamped baseline without ranking guarantees.',
    links: [['/ai-visibility', 'See AEO Tier 01 & Tier 02 pricing'], ['/proof-of-value', 'View 683ms TTFB benchmark data'], ['/contact', 'Request an AEO audit']],
    bodyHtml: `
<section>
  <h2>What the Technical Audit Checks</h2>
  <p>Modern search engines and LLM crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Googlebot) fail silently when JavaScript SPAs serve empty shells, duplicate <code>&lt;h1&gt;</code> tags, or bloated 2,000ms+ TTFB responses. Every QuickKitAI audit tests 6 concrete engineering thresholds:</p>
  <ul>
    <li><strong>HTTP &amp; TTFB Latency:</strong> Measures edge response time across all sitemap routes against our 683ms benchmark and verifies real HTTP 404 responses for non-existent paths instead of soft-200 redirects.</li>
    <li><strong>HTML Outline &amp; Metadata Bounds:</strong> Confirms strictly 1 visible <code>&lt;h1&gt;</code> per URL, title length between 30 and 60 characters, meta description length between 70 and 160 characters, and valid self-referencing canonicals.</li>
    <li><strong>JSON-LD @graph &amp; Rich Results:</strong> Validates connected <code>Organization</code>, <code>WebSite</code>, <code>WebPage</code>, <code>Article</code>, <code>Person</code> author, and <code>BreadcrumbList</code> entities with zero fabricated <code>AggregateRating</code> scores.</li>
    <li><strong>AI Crawler &amp; llms.txt Endpoints:</strong> Confirms <code>robots.txt</code> permits AI search bots while blocking private portals (<code>/api/</code>, <code>/admin</code>, <code>/client-portal</code>), and verifies active <code>/llms.txt</code> and <code>/llms-full.txt</code> documentation.</li>
    <li><strong>Content Depth &amp; Internal Linking:</strong> Flags thin pages under 300 words and ensures 0 orphan pages across all 14 sitemap URLs.</li>
  </ul>
</section>
<section>
  <h2>Remediation Options</h2>
  <p>Once the baseline audit is recorded, clients can execute fixes in-house or engage QuickKitAI under Tier 01 (₹15,000 one-time, pay after live verified result with ₹0 advance) or Tier 02 (₹20,000 setup + ₹25,000/month ongoing monitoring).</p>
</section>`
  },
  {
    path: 'privacy',
    sectionName: 'Legal',
    sectionUrl: 'https://quickkitai.com/terms',
    title: 'Privacy Policy | QuickKitAI & Raja AI Systems',
    description: 'Privacy policy for QuickKitAI and Raja AI Systems covering website enquiries, client portal data handling, and connected third-party services.',
    keywords: 'Raja AI Systems privacy policy, QuickKitAI data handling, enquiry privacy, WhatsApp CRM privacy',
    heading: 'Privacy Policy',
    tldr: 'QuickKitAI collects only the enquiry, authentication, and technical diagnostic data required to deliver requested AEO audits or managed AI workflows. We do not sell personal data, and retention windows (30 to 90 days for standard logs) plus third-party subprocessors are disclosed transparently.',
    summary: 'Privacy disclosures for quickkitai.com covering website enquiry forms, authenticated client portals, operational telemetry, third-party APIs, and data deletion requests.',
    links: [['/terms', 'Read Terms of Service'], ['/about', 'Learn about Raja AI Systems'], ['/contact', 'Submit a privacy or deletion request']],
    bodyHtml: `
<section>
  <h2>1. Information We Collect</h2>
  <p>Raja AI Systems (<code>quickkitai.com</code>) collects minimal information across 3 operational contexts:</p>
  <ul>
    <li><strong>Website &amp; Pilot Enquiries:</strong> Name, business email, +91 phone number, company domain, and workflow notes voluntarily submitted through enquiry forms or sent to <code>admin@quickkitai.com</code>.</li>
    <li><strong>Authenticated Client &amp; Admin Portals:</strong> Firebase Authentication credentials and workspace configuration identifiers strictly for authorized users accessing <code>/client</code> or <code>/admin</code>.</li>
    <li><strong>Technical Telemetry:</strong> Standard HTTP request logs, performance timings (such as TTFB benchmarks), and crawl status codes used to maintain uptime and diagnose errors across our 14 public routes.</li>
  </ul>
</section>
<section>
  <h2>2. Data Usage, Subprocessors &amp; Retention</h2>
  <p>Submitted information is used solely to prepare technical AEO audits, execute contracted AI workflows, and communicate project updates. We never sell or rent contact lists to third-party brokers. When a client deploys WhatsApp Business API, CRM webhooks, or cloud hosting (such as Vercel, Firebase, or isolated Linux VPS instances), data processing is governed by each signed deployment scope and applicable Indian data-protection standards. Standard enquiry records are retained only as long as operationally needed (typically 30 to 90 days for inactive pilot enquiries) or until deletion is requested.</p>
</section>
<section>
  <h2>3. Your Rights &amp; Contact</h2>
  <p>You may request access, correction, export, or permanent deletion of your contact records at any time by emailing <code>admin@quickkitai.com</code>. Requests are acknowledged within 2 business days and fulfilled within 7 business days.</p>
</section>`
  },
  {
    path: 'terms',
    sectionName: 'Legal',
    sectionUrl: 'https://quickkitai.com/privacy',
    title: 'Terms of Service | QuickKitAI & Raja AI Systems',
    description: 'Service terms for QuickKitAI and Raja AI Systems covering written project scopes, Tier 01 pay-after-result AEO, Tier 02 retainers, and billing.',
    keywords: 'Raja AI Systems terms of service, QuickKitAI terms, Tier 01 pay after result, managed AI agreement',
    heading: 'Terms of Service',
    tldr: 'All QuickKitAI engagements—including Tier 01 AEO (₹15,000 one-time, ₹0 advance), Tier 02 AEO (₹20,000 setup + ₹25,000/month), and Managed Real Estate AI (₹35,000 setup + ₹1,20,000/month)—are governed by written scope acceptance, honest verification criteria, and zero unverified ranking or lead guarantees.',
    summary: 'Commercial terms governing quickkitai.com usage, written project scopes, Tier 01 pay-after-verified-result billing, Tier 02 30-day rolling retainers, third-party dependencies, and pilot evaluation rules.',
    links: [['/privacy', 'Read Privacy Policy'], ['/ai-visibility', 'Review AEO pricing tiers'], ['/contact', 'Request a written service scope']],
    bodyHtml: `
<section>
  <h2>1. Scope of Services &amp; Pricing Tiers</h2>
  <p>Raja AI Systems delivers technical Answer Engine Optimization (AEO) and managed AI workflow services strictly as defined in each written offer and signed client agreement:</p>
  <ul>
    <li><strong>AEO Tier 01 (Technical Foundation):</strong> ₹15,000 one-time fee with ₹0 advance. Payment is invoiced only after live verification of agreed technical deliverables (schema validation, <code>llms.txt</code> deployment, metadata bounds, and single-<code>&lt;h1&gt;</code> compliance) within the 7-business-day delivery window, with ₹0 recurring maintenance.</li>
    <li><strong>AEO Tier 02 (Ongoing Search Growth):</strong> ₹20,000 one-time setup plus ₹25,000/month on a 30-day rolling retainer, covering continuous monitoring, prompt testing, and bi-weekly evidence reports.</li>
    <li><strong>Managed Real Estate AI Workforce:</strong> ₹35,000 one-time setup plus ₹1,20,000/month retainer. Pilot performance is measured transparently against operational benchmarks (such as target: 8–10 site visits per month, measured in pilot with 60–80 inbound enquiries), without blanket lead or revenue guarantees.</li>
  </ul>
</section>
<section>
  <h2>2. No Ranking or Citation Guarantees</h2>
  <p>Search engines (Google, Bing) and generative AI platforms (ChatGPT, Perplexity, Claude, Gemini) operate independent ranking and synthesis models outside our control. QuickKitAI guarantees technical implementation accuracy, clean schema validation, and transparent reporting—never specific search positions or third-party AI citations.</p>
</section>
<section>
  <h2>3. Third-Party Services &amp; Termination</h2>
  <p>Clients are responsible for maintaining valid third-party accounts (domain registrars, hosting, WhatsApp Business API, or CRM providers) and any usage fees charged directly by those providers. Rolling 30-day retainers may be cancelled with 7 days written notice to <code>admin@quickkitai.com</code> prior to the next billing cycle.</p>
</section>`
  }
];

const htmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

function replaceMeta(html, attribute, key, value) {
  const regex = new RegExp(`(<meta\\s+${attribute}=["']${key}["']\\s+content=["'])[^"']*(["'])`, 'i');
  if (!regex.test(html)) throw new Error(`Cannot find metadata tag ${attribute}=${key}`);
  return html.replace(regex, `$1${htmlEscape(value)}$2`);
}

function replaceTagContent(html, opening, closing, replacement) {
  const start = html.indexOf(opening);
  const end = html.indexOf(closing, start);
  if (start < 0 || end < 0) throw new Error(`Cannot find ${opening}...${closing}`);
  return html.slice(0, start + opening.length) + htmlEscape(replacement) + html.slice(end);
}

function replaceRootDiv(html, replacementInnerHtml) {
  const startMatch = html.match(/<div\s+id=["']root["'][^>]*>/i);
  if (!startMatch) throw new Error('Cannot find <div id="root">');
  const openStart = startMatch.index;
  const openEnd = openStart + startMatch[0].length;
  let depth = 1;
  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = openEnd;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(0, openStart) + `<div id="root">${replacementInnerHtml}</div>` + html.slice(match.index + match[0].length);
      }
    } else if (!match[0].endsWith('/>')) {
      depth += 1;
    }
  }
  throw new Error('Unclosed <div id="root">');
}

function sanitizeShellJsonLd(html) {
  return html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (full, jsonText) => {
    try {
      const parsed = JSON.parse(jsonText.trim());
      if (Array.isArray(parsed['@graph'])) {
        const kept = parsed['@graph'].filter((node) => node['@type'] === 'Organization' || node['@type'] === 'WebSite');
        if (kept.length === 0) return '';
        return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': kept })}</script>`;
      }
      if (parsed['@type'] === 'Organization' || parsed['@type'] === 'WebSite') {
        return full;
      }
      return '';
    } catch {
      return full;
    }
  });
}

function stripNoscriptH1(html) {
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (block) =>
    block
      .replace(/<h1([^>]*)>/gi, '<p style="font-size:1.75rem;font-weight:800">')
      .replace(/<\/h1>/gi, '</p>')
  );
}

const fullSiteNavLinks = ALL_SITEMAP_LINKS.map(
  ([href, label]) => `<li><a href="${href}">${htmlEscape(label)}</a></li>`
).join('');

for (const page of pages) {
  if (page.title.length < 30 || page.title.length > 60) {
    throw new Error(`Title length out of 30-60 bounds for ${page.path}: ${page.title.length} ("${page.title}")`);
  }
  if (page.description.length < 70 || page.description.length > 160) {
    throw new Error(`Description length out of 70-160 bounds for ${page.path}: ${page.description.length} ("${page.description}")`);
  }

  const canonical = `https://quickkitai.com/${page.path}`;
  let html = shell;
  html = sanitizeShellJsonLd(html);
  html = html.replace(/<main\s+id=["']seo-home-summary["'][\s\S]*?<\/main>/gi, '');
  html = stripNoscriptH1(html);

  html = replaceTagContent(html, '<title>', '</title>', page.title);
  html = replaceMeta(html, 'name', 'description', page.description);
  html = replaceMeta(html, 'name', 'keywords', page.keywords);
  html = replaceMeta(html, 'property', 'og:title', page.title);
  html = replaceMeta(html, 'property', 'og:description', page.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'name', 'twitter:title', page.title);
  html = replaceMeta(html, 'name', 'twitter:description', page.description);

  const canonicalRegex = /(<link\s+rel=["']canonical["']\s+href=["'])[^"']*(["'])/i;
  if (!canonicalRegex.test(html)) throw new Error(`Cannot find canonical tag for ${page.path}`);
  html = html.replace(canonicalRegex, `$1${canonical}$2`);

  const relatedLinks = page.links.map(([href, label]) => `<li><a href="${href}">${htmlEscape(label)}</a></li>`).join('');
  const readableSummary = `<main id="seo-prerendered-summary" class="seo-crawler-content" aria-label="Page summary">
  <nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="${page.sectionUrl.replace('https://quickkitai.com', '')}">${htmlEscape(page.sectionName)}</a></li><li aria-current="page">${htmlEscape(page.heading)}</li></ol></nav>
  <h1>${htmlEscape(page.heading)}</h1>
  <p class="article-meta">By <strong>Prince (Raja)</strong>, Founder &amp; Chief AI Systems Architect · Last updated: <time datetime="${DATE_MODIFIED}">27 November 2026</time></p>
  <section aria-label="TL;DR summary"><h2>TL;DR Summary</h2><p><strong>Answer-First Summary:</strong> ${htmlEscape(page.tldr)}</p></section>
  <p class="summary-lead">${htmlEscape(page.summary)}</p>
  ${page.bodyHtml}
  ${EXTERNAL_REFERENCES_HTML}
  <nav aria-label="Related pages"><h2>Related Pages</h2><ul>${relatedLinks}</ul></nav>
  <nav aria-label="All public QuickKitAI routes"><h2>Complete Site Directory (14 Indexed Routes)</h2><ul>${fullSiteNavLinks}</ul></nav>
  <p>Interactive controls load with JavaScript. Offer availability, integration scope, and measurable acceptance outcomes are confirmed in writing for each client deployment.</p>
</main>`;

  const preloaderHtml = `<div class="initial-preloader"><div class="preloader-glow"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b0d11" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg></div><div class="preloader-text">QUICKKITAI <span style="color:#f59e0b">×</span> RAJA AI SYSTEMS</div></div>`;
  html = replaceRootDiv(html, `${preloaderHtml}${readableSummary}`);

  const routeGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': 'https://quickkitai.com/#website' },
        publisher: { '@id': 'https://quickkitai.com/#organization' },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED
      },
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: page.heading,
        name: page.title,
        description: page.description,
        url: canonical,
        mainEntityOfPage: { '@id': `${canonical}#webpage` },
        author: {
          '@type': 'Person',
          name: 'Prince (Raja)',
          url: 'https://quickkitai.com/about'
        },
        publisher: { '@id': 'https://quickkitai.com/#organization' },
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quickkitai.com/' },
          { '@type': 'ListItem', position: 2, name: page.sectionName, item: page.sectionUrl },
          { '@type': 'ListItem', position: 3, name: page.heading, item: canonical }
        ]
      }
    ]
  };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(routeGraph)}</script>\n  </head>`);

  const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
  if (h1Count !== 1) {
    throw new Error(`Expected strictly 1 <h1> in ${page.path}, found ${h1Count}`);
  }

  const outputDir = join(dist, page.path);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), html);
}

// Emit static 404.html for non-existent paths on Vercel
let notFoundHtml = sanitizeShellJsonLd(shell)
  .replace(/<main\s+id=["']seo-home-summary["'][\s\S]*?<\/main>/gi, '');
notFoundHtml = stripNoscriptH1(notFoundHtml);
notFoundHtml = replaceTagContent(notFoundHtml, '<title>', '</title>', '404 Page Not Found | QuickKitAI & Raja AI Systems');
notFoundHtml = replaceMeta(notFoundHtml, 'name', 'robots', 'noindex, nofollow');
notFoundHtml = replaceRootDiv(
  notFoundHtml,
  `<main style="max-width:720px;margin:80px auto;padding:24px;font-family:Outfit,sans-serif"><h1>404 — Page Not Found</h1><p>The URL you requested does not exist on quickkitai.com. Explore our verified public pages below:</p><ul>${fullSiteNavLinks}</ul></main>`
);
await writeFile(join(dist, '404.html'), notFoundHtml);

console.log(`Pre-rendered ${pages.length} public routes + 404.html with single-H1 enforcement, compliant AEO pricing, BreadcrumbList+Article+WebPage schemas, and 14-route internal navigation.`);
