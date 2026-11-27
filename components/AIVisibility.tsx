import React from 'react';
import { ArrowRight, Check, ExternalLink, Eye, Rocket, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditorialMetaBar, PublicRouteFooter, SeoMeta } from './SeoMeta';

const plans = [
  {
    name: 'Tier 01 — AI Technical Foundation & Schema Fix',
    regular: '₹30,000',
    offer: '₹15,000 one-time (₹0 advance)',
    suffix: 'Pay after live verified result · zero monthly maintenance fee',
    icon: Eye,
    description:
      'Complete code architecture overhaul to make your website readable, verified, and eligible for Google Rich Snippets and AI Search discovery. Pay ₹15,000 only after we deliver a live Google Rich Results 100% Valid Pass.',
    items: [
      'Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance)',
      'Enterprise JSON-LD Schema Architecture (Organization, LocalBusiness, FAQPage, Article)',
      'Autonomous AI Crawler Ingestion Protocols (llms.txt, llms-full.txt, robots.txt)',
      'Core Web Vitals & Asset Latency Compression (Measured target <1.5s load speed)',
      'Google Rich Results Official Validation Certificate (100% Valid Pass)',
      'Google Search Console & Canonical Sitemap Indexing Submission',
    ],
  },
  {
    name: 'Tier 02 — AI Search Growth & Autonomous Sentinel',
    regular: '₹40,000 setup + ₹50,000/month',
    offer: '₹25,000/month + ₹20,000 setup',
    suffix: '30-day rolling retainer · Tier 02 continuous visibility defense',
    icon: Rocket,
    featured: true,
    description:
      'Continuous AI citation visibility and health defense across ChatGPT, Perplexity, Gemini, and Claude with automated daily audit logs and bi-weekly verification reports.',
    items: [
      'Tier 02: ₹25,000/month + ₹20,000 setup (includes full Tier 01 foundation)',
      'Automated Daily Health & AI Indexing Sentinel (30-day rolling audit log)',
      'Multi-Engine Citation Tracking (ChatGPT, Perplexity, Gemini, Claude)',
      'Continuous Entity Schema Expansions (New inventory, services & FAQs)',
      'Bi-Weekly Executive Proof & Verification Audit Reports',
      'Ongoing Core Web Vitals, Bot Access & Security Guard',
    ],
  },
  {
    name: 'Tier 03 — Multi-Location Enterprise AEO',
    regular: '₹1,00,000 setup + ₹1,50,000/month',
    offer: '₹50,000 setup + ₹75,000/month',
    suffix: 'custom regional scope',
    icon: ShieldCheck,
    description:
      'For multi-city developers, healthcare networks, or regional franchises requiring multi-branch entity mapping and dedicated AI citation monitoring.',
    items: [
      'Everything in Tier 02 AI Search Growth & Sentinel',
      'Multi-City & Multi-Branch Schema Entity Clustering',
      'High-Volume Prompt & Geo-Fenced Tracking (100+ prompts/month)',
      'Role-Based Staging, Tenant-Isolated Evidence & Priority SLA',
      'Dedicated Technical Engineering Support',
    ],
  },
];

export const AIVisibility: React.FC = () => (
  <>
    <SeoMeta
      title="AI Visibility & AEO Services India | QuickKitAI"
      description="Evidence-first AEO & AI visibility for ChatGPT, Perplexity, Gemini & Google. Tier 01 ₹15,000 pay after live verified result (₹0 advance)."
      keywords="AEO services India, AI visibility services, GEO agency India, llms.txt implementation, JSON-LD schema audit, ChatGPT citation optimization, QuickKitAI, Raja AI Systems"
      canonical="https://quickkitai.com/ai-visibility"
      ogType="article"
    />
    <div className="min-h-screen bg-[#050608] text-slate-100 selection:bg-amber-200/20">
      <main>
        <section className="relative overflow-hidden border-b border-white/8 bg-grid pt-24 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.18),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,.12),transparent_34%)]" />
          <div className="relative container mx-auto max-w-6xl px-5 md:px-8">
            <Link to="/" className="text-xs font-black uppercase tracking-[.25em] text-slate-400 hover:text-white">
              ← Raja AI Systems
            </Link>
            <div className="mt-8 max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[.3em] text-amber-300">AI visibility and AEO services · India</p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                Be easier to discover, understand and cite.
              </h1>
              <EditorialMetaBar className="mt-4" />
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                Evidence-first visibility engineering for ChatGPT, Perplexity, Gemini, Claude, and Google surfaces. We measure the baseline, ship verified technical schema and crawler files, and invoice Tier 01 only after a live Google Rich Results pass.
              </p>

              <div className="mt-6 rounded-2xl border border-amber-300/35 bg-amber-300/[0.08] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Transparent AEO Commercial Terms</p>
                <p className="mt-2 text-base font-bold text-white">
                  Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance). Tier 02: ₹25,000/month + ₹20,000 setup.
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Zero ranking or lead-volume guarantees: payment for Tier 01 is triggered strictly by passing verifiable technical validation (Google Rich Results Test, schema @graph integrity, and live crawler accessibility). Outcomes such as site visits are tracked only as measured pilot targets.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">TL;DR — Key Takeaways</p>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-200">
                  <li>• <strong>Pay-After-Result Tier 01:</strong> ₹15,000 one-time, ₹0 advance, settled only after live Google Rich Results validation.</li>
                  <li>• <strong>Ongoing Sentinel Tier 02:</strong> ₹25,000/month + ₹20,000 setup for daily crawler/schema monitoring across 4 major AI engines.</li>
                  <li>• <strong>Verified Benchmark:</strong> QuickKitAI public baseline operates at 683ms TTFB, 5-entity @graph pass, and 14 indexed sitemap URLs.</li>
                  <li>• <strong>No False Promises:</strong> Zero ranking, citation, or lead guarantees; all improvements are logged with timestamped evidence.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
                  Start with an audit <ArrowRight size={16} />
                </Link>
                <a href="#plans" className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/5">
                  Compare Tier 01 &amp; Tier 02
                </a>
                <Link to="/proof-of-value" className="inline-flex items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-200 hover:bg-emerald-400/20">
                  Inspect Live Proof
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Measure first', 'Exact prompts, timestamps, TTFB latency, schema validation logs, and competitor observations.'],
              ['Improve with approval', 'Content, JSON-LD @graph, llms.txt, and robots.txt changes are staged and verified before handover.'],
              ['Measured targets, zero fake claims', 'Rankings, citations, and site visits are tracked as measured pilot targets—never sold as unverified guarantees.'],
            ].map(([title, body]) => (
              <div key={title} className="glass-card rounded-2xl p-6">
                <p className="font-black text-white">{title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="plans" className="container mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.25em] text-blue-300">Choose the right level</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Three plans. One evidence-led system.</h2>
            <p className="mt-4 text-slate-300">
              Tier 01: ₹15,000 one-time, pay after live verified result (₹0 advance). Tier 02: ₹25,000/month + ₹20,000 setup.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`glass-card rounded-3xl p-6 ${plan.featured ? 'border-amber-300/40 shadow-[0_0_50px_rgba(245,158,11,.1)]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Icon className="text-amber-300 shrink-0" size={22} />
                        <h3 className="text-lg font-black text-white">{plan.name}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
                    </div>
                    {plan.featured && (
                      <span className="shrink-0 rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                        Flagship
                      </span>
                    )}
                  </div>
                  <div className="mt-6 border-y border-white/8 py-5">
                    <p className="text-xs text-slate-500 line-through">Standard rate: {plan.regular}</p>
                    <p className="mt-1 text-xl font-black text-white">{plan.offer}</p>
                    <p className="mt-1 text-xs text-emerald-300">{plan.suffix}</p>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {plan.items.map(item => (
                      <li key={item} className="flex gap-3 text-sm text-slate-300">
                        <Check size={17} className="mt-0.5 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-5 pb-16 md:px-8">
          <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-6">
            <p className="text-xs font-black uppercase tracking-[.25em] text-amber-200">Verification Standards &amp; Official Documentation</p>
            <h2 className="mt-3 text-2xl font-black text-white">Pay after verified technical pass. No hidden promises.</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Tier 01 deliverables are verified against public standards before invoicing. Prompt quotas and work-item limits describe managed execution scope—not guarantees of rankings, citations, traffic, leads, or revenue.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold">
              <a
                href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-300 underline hover:text-amber-200"
              >
                Google Rich Results &amp; Structured Data Docs <ExternalLink size={12} />
              </a>
              <a
                href="https://schema.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-300 underline hover:text-amber-200"
              >
                Schema.org Specification <ExternalLink size={12} />
              </a>
              <a
                href="https://llmstxt.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-300 underline hover:text-amber-200"
              >
                llmstxt.org AI Ingestion Standard <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-slate-950/50">
          <div className="container mx-auto max-w-6xl px-5 py-16 md:px-8">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Controlled live benchmark</p>
                <h2 className="mt-3 text-3xl font-black">QuickKitAI: 55/100 → 100/100</h2>
                <p className="mt-4 leading-7 text-slate-400">
                  Our public domain was audited directly in production: 683ms benchmark TTFB, 5-entity JSON-LD @graph pass, and 14 sitemap URLs returning HTTP 200 OK. Technical crawlability and structured entity clarity are verified before any pilot begins.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Benchmark TTFB', '683 ms'],
                  ['Sitemap Routes', '14 / 14 OK'],
                  ['Entity Clarity', '100/100'],
                  ['Answer-Ready', '100/100'],
                  ['Tier 01 Advance', '₹0'],
                  ['Baseline Score', '55 → 100'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/[.03] p-4">
                    <p className="text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-5 py-16 text-center md:px-8">
          <h2 className="text-3xl font-black md:text-5xl">Start with a measured baseline.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            No guaranteed AI ranking. No fabricated citations. Tier 01 is ₹15,000 one-time, pay after live verified result (₹0 advance).
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">
            Request an audit <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      <PublicRouteFooter />
    </div>
  </>
);
