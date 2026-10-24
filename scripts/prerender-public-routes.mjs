import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const shell = await readFile(join(dist, 'index.html'), 'utf8');

// Keep these entries aligned with the public sitemap and route-level SEO components.
// They are deliberately short summaries, not substitutes for the interactive React pages.
const pages = [
  {
    path: 'services/real-estate',
    title: 'AI Automation for Real Estate Teams in India | Raja AI Systems',
    description: 'Raja AI Systems helps Indian real estate teams automate property lead qualification, WhatsApp follow-ups, site-visit coordination and CRM workflows. Healthcare automation is available as a secondary service; integrations are configured and verified per deployment.',
    keywords: 'real estate AI automation India, property lead qualification, WhatsApp follow-up, site visit coordination, real estate CRM workflows',
    heading: 'AI Automation for Real Estate Teams in India',
    summary: 'Managed AI-assisted workflows for property enquiry intake, lead qualification, follow-up, site-visit coordination and CRM handoff. Exact channels, integrations and performance targets are scoped and tested per deployment.',
    links: [['/guides/real-estate-ai-lead-qualification','Read the real-estate lead qualification guide'], ['/real-estate-ai-questions','Browse real-estate AI questions'], ['/contact','Discuss a pilot']]
  },
  {
    path: 'services/healthcare',
    title: 'AI Agents for Healthcare Clinics in India | Raja AI Systems',
    description: 'Managed AI automation for Indian healthcare businesses focused on approved administrative workflows, patient enquiries, intake and appointment coordination. Integrations and privacy requirements are reviewed per deployment.',
    keywords: 'healthcare AI automation India, clinic enquiry intake, appointment coordination, healthcare workflow automation',
    heading: 'AI Agents for Healthcare Clinics in India',
    summary: 'Project-scoped administrative workflows for patient enquiries, intake and appointment coordination. Clinical decisions remain with qualified healthcare professionals; provider integrations, data handling and scope must be reviewed and tested.',
    links: [['/services/real-estate','View the primary real-estate use case'], ['/contact','Discuss project scope']]
  },
  {
    path: 'guides/real-estate-ai-lead-qualification',
    title: 'AI Lead Qualification for Real Estate in India: A Practical Workflow | Raja AI Systems',
    description: 'Learn how Indian builders and brokerages can structure AI-assisted property lead qualification, WhatsApp follow-up, CRM handoff, and site-visit booking.',
    keywords: 'real estate lead qualification, property enquiries, WhatsApp follow-up, CRM handoff, site visit booking India',
    heading: 'AI Lead Qualification for Real Estate in India',
    summary: 'A practical workflow guide covering the minimum useful qualification fields, transparent follow-up, verified appointment availability, CRM handoff and measurement against a recorded baseline.',
    links: [['/services/real-estate','Explore the real-estate service'], ['/real-estate-ai-questions','Read related questions'], ['/contact','Discuss a pilot']]
  },
  {
    path: 'real-estate-ai-questions',
    title: 'Real Estate AI Agent Questions & Answers India | Raja AI Systems',
    description: 'Natural-language answers about real estate AI agents, lead qualification, WhatsApp automation, WhatsApp voice-note + text workflows, site visits, CRM workflows, pricing and managed AI services in India.',
    keywords: 'real estate AI FAQ India, property lead qualification, WhatsApp AI, CRM workflows, AI site visit booking',
    heading: 'Real Estate AI Agent Questions & Answers',
    summary: 'Answers about lead qualification, WhatsApp workflows, site-visit booking, CRM integrations, project scope and pricing. Integration availability and commercial terms must be confirmed for each signed deployment.',
    links: [['/guides/real-estate-ai-lead-qualification','Read the practical guide'], ['/services/real-estate','Review the service scope'], ['/contact','Ask about a specific workflow']]
  },
  {
    path: 'blog',
    title: 'Real Estate AI Knowledge Hub | Raja AI Systems',
    description: 'Practical resources on real-estate AI lead qualification, WhatsApp follow-up, site-visit workflows, CRM handoff, and managed AI automation in India.',
    keywords: 'real estate AI guide India, property lead qualification, WhatsApp follow-up, CRM automation, site visit workflow',
    heading: 'Real Estate AI Knowledge Hub',
    summary: 'Curated educational resources on property lead qualification, follow-up, sales handoff and managed AI workflows. This hub links to authored and existing resources rather than thin or incomplete article stubs.',
    links: [['/guides/real-estate-ai-lead-qualification','AI lead qualification guide'], ['/real-estate-ai-questions','Questions and answers'], ['/services/real-estate','Service overview']]
  },
  {
    path: 'about',
    title: 'About Raja AI Systems | Managed AI Automation in India',
    description: 'Learn about Raja AI Systems and its approach to managed AI-assisted workflows, integration verification, human handoff and measurable project scope.',
    keywords: 'about Raja AI Systems, managed AI automation India, workflow integration',
    heading: 'About Raja AI Systems',
    summary: 'Raja AI Systems scopes and manages AI-assisted workflows around business processes, configured providers and verified deployment requirements.',
    links: [['/services/real-estate','Explore services'], ['/contact','Contact the team']]
  },
  {
    path: 'contact',
    title: 'Contact Raja AI Systems | Discuss an AI Pilot',
    description: 'Contact Raja AI Systems to review a workflow, integration requirements, third-party dependencies and the written scope for a managed AI pilot.',
    keywords: 'contact Raja AI Systems, AI automation pilot, managed AI workflows India',
    heading: 'Contact Raja AI Systems',
    summary: 'Share your workflow, current systems and desired handoff. Availability, delivery scope, price and measurable performance terms are confirmed before work begins.',
    links: [['/services/real-estate','Review real-estate workflows'], ['/guides/real-estate-ai-lead-qualification','Read the workflow guide']]
  },
  {
    path: 'seo-audit',
    title: 'SEO & AI Search Readiness Audit | Raja AI Systems',
    description: 'Review technical crawlability, page metadata, sitemap coverage, structured data and AI-search readiness. Search rankings and AI citations are not guaranteed.',
    keywords: 'SEO audit, AI search readiness, AEO, technical SEO India, structured data',
    heading: 'SEO & AI Search Readiness Audit',
    summary: 'A readiness review can assess technical crawlability, metadata consistency, sitemap and structured-data issues. Search performance must be measured against a baseline; rankings and AI citations cannot be guaranteed.',
    links: [['/blog','Explore published resources'], ['/contact','Discuss a site review']]
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | Raja AI Systems',
    description: 'Read the Raja AI Systems privacy information covering website interactions, submitted enquiries, account data and connected third-party services.',
    keywords: 'Raja AI Systems privacy policy, data handling, submitted enquiries',
    heading: 'Privacy Policy',
    summary: 'Review the privacy terms for information submitted through the website, account-related data and connected services. Confirm the actual data flow and provider terms for each deployment.',
    links: [['/contact','Ask a privacy-related question'], ['/terms','Read service terms']]
  },
  {
    path: 'terms',
    title: 'Terms of Service | Raja AI Systems',
    description: 'Review Raja AI Systems service scope, pilot pricing, third-party usage, activation and written-agreement terms.',
    keywords: 'Raja AI Systems terms of service, managed AI services, pilot agreement',
    heading: 'Terms of Service',
    summary: 'Commercial terms depend on the current written offer and signed agreement, including service scope, setup and management charges, third-party usage, billing and any performance or refund condition.',
    links: [['/privacy','Read the privacy policy'], ['/contact','Discuss contract scope']]
  }
];

const htmlEscape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function replaceMeta(html, attribute, key, value) {
  const prefix = `<meta ${attribute}="${key}" content="`;
  const start = html.indexOf(prefix);
  if (start < 0) throw new Error(`Cannot find metadata tag ${attribute}=${key}`);
  const valueStart = start + prefix.length;
  const valueEnd = html.indexOf('"', valueStart);
  if (valueEnd < 0) throw new Error(`Malformed metadata tag ${attribute}=${key}`);
  return html.slice(0, valueStart) + htmlEscape(value) + html.slice(valueEnd);
}
function replaceTagContent(html, opening, closing, replacement) {
  const start = html.indexOf(opening);
  const end = html.indexOf(closing, start);
  if (start < 0 || end < 0) throw new Error(`Cannot find ${opening}...${closing}`);
  return html.slice(0, start + opening.length) + htmlEscape(replacement) + html.slice(end);
}

for (const page of pages) {
  const canonical = `https://quickkitai.com/${page.path}`;
  let html = shell;
  html = replaceTagContent(html, '<title>', '</title>', page.title);
  html = replaceMeta(html, 'name', 'description', page.description);
  html = replaceMeta(html, 'name', 'keywords', page.keywords);
  html = replaceMeta(html, 'property', 'og:title', page.title);
  html = replaceMeta(html, 'property', 'og:description', page.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'name', 'twitter:title', page.title);
  html = replaceMeta(html, 'name', 'twitter:description', page.description);


  const canonicalPrefix = '<link rel="canonical" href="';
  const canonicalStart = html.indexOf(canonicalPrefix);
  if (canonicalStart < 0) throw new Error(`Cannot find canonical tag for ${page.path}`);
  const canonicalValueStart = canonicalStart + canonicalPrefix.length;
  const canonicalValueEnd = html.indexOf('"', canonicalValueStart);
  html = html.slice(0, canonicalValueStart) + canonical + html.slice(canonicalValueEnd);

  const links = page.links.map(([href, label]) => `<li><a href="${href}">${htmlEscape(label)}</a></li>`).join('');
  const readableSummary = `<main id="seo-prerendered-summary" aria-label="Page summary"><h1>${htmlEscape(page.heading)}</h1><p>${htmlEscape(page.summary)}</p><nav aria-label="Related pages"><ul>${links}</ul></nav><p>Interactive controls and complete page features load with JavaScript. Offer availability, integration status and measurable outcomes are confirmed for each written scope.</p></main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${readableSummary}</div>`);

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': 'https://quickkitai.com/#website' },
    publisher: { '@id': 'https://quickkitai.com/#organization' }
  };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(webpageSchema)}</script>\n  </head>`);

  const outputDir = join(dist, page.path);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), html);
}

console.log(`Pre-rendered ${pages.length} public routes with route-specific metadata, WebPage schema and readable summaries.`);
