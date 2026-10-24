import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pages = [
  ['services/real-estate', 'Raja AI Systems â€” Autonomous AI Workforce for Luxury Real Estate in India'],
  ['services/healthcare', 'AI Agents for Healthcare Clinics in India | Raja AI Systems'],
  ['guides/real-estate-ai-lead-qualification', 'AI Lead Qualification for Real Estate in India: A Practical Workflow | Raja AI Systems'],
  ['real-estate-ai-questions', 'Real Estate AI Agent Questions & Answers India | Raja AI Systems'],
  ['blog', 'Real Estate AI Knowledge Hub | Raja AI Systems'],
  ['about', 'About Raja AI Systems | Managed AI Automation in India'],
  ['contact', 'Contact Raja AI Systems | Discuss an AI Pilot'],
  ['seo-audit', 'SEO & AI Search Readiness Audit | Raja AI Systems'],
  ['privacy', 'Privacy Policy | Raja AI Systems'],
  ['terms', 'Terms of Service | Raja AI Systems'],
];
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const [path, title] of pages) {
  const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
  const url = `https://quickkitai.com/${path}`;
  assert.ok(html.includes(`<title>${esc(title)}</title>`), `${path} should have route-specific title in the initial HTML`);
  assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), `${path} should have a route-specific canonical in the initial HTML`);
  assert.ok(html.includes¶»§q«^