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
    title: 'Raja AI Systems â€” Autonomous AI Workforce for Luxury Real Estate in India',
    description: 'Raja AI Systems helps Indian real estate teams automate property lead qualification, WhatsApp follow-ups, site-visit coordination and CRM workflows. Healthcare automation is available as a secondary service; integrations are configured and verified per deployment.',
    keywords: 'real estate AI automation India, property lead qualification, WhatsApp follow-up, site visit coordination, real estate CRM workflows',
    heading: 'AI Automation for Real Estate Teams in India',
    summary: 'Managed AI-assisted workflows for property enquiry intake, lead qualification, follow-up, site-visit coordination and CRM handoff. Exact channels, integrations and performance targets are scoped and tested per deployment.',
    links: [['/guides/real-estate-ai-lead-qualification','Read the real-estate lead qualification guide'], ['/real-estate-ai-questions','Browse re¶»§q«^