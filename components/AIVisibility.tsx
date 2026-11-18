import React from 'react';
import { ArrowRight, Check, Eye, LineChart, Rocket, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const plans = [
  {
    name: 'AI Technical Foundation & Schema Fix',
    regular: '₹30,000',
    offer: '₹15,000',
    suffix: 'one-time setup · zero monthly fee',
    icon: Eye,
    description: 'Complete code architecture overhaul to make your website readable, verified, and eligible for Google Rich Snippets and AI Search discovery.',
    items: [
      'Enterprise JSON-LD Schema Architecture (Organization, LocalBusiness, FAQ)',
      'Autonomous AI Crawler Ingestion Protocols (llms.txt, llms-full.txt, robots.txt)',
      'Core Web Vitals & Asset Latency Compression (Target <1.5s load speed)',
      'Google Rich Results Official Validation Certificate (100% Green Pass)',
      'Google Search Console & Canonical Sitemap Indexing Submission',
      '7-Day Fast-Track Deployment Target · Staged & Verified'
    ],
  },
  {
    name: 'AI Search Growth & Autonomous Sentinel',
    regular: '₹40,000 setup + ₹50,000/month',
    offer: '₹20,000 setup + ₹25,000/month',
    suffix: 'monthly retainer (Day 30+)',
    icon: Rocket,
    featured: true,
    description: 'Continuous AI citation visibility and health defense across ChatGPT, Perplexity, Gemini, and Claude with automated daily audit logs and bi-weekly reports.',
    items: [
      'Everything included in AI Technical Foundation Fix',
      'Automated Daily Health & AI Indexing Sentinel (30-day rolling log)',
      'Multi-Engine Citation Tracking (ChatGPT, Perplexity, Gemini, Claude)',
      'Continuous Entity Schema Expansions (New inventory, services & FAQs)',
      'Bi-Weekly Executive Proof & Verification Audit Reports',
      'Ongoing Core Web Vitals, Bot Access & Security Guard'
    ],
  },
  {
    name: 'Multi-Location Enterprise AEO',
    regular: '₹1,00,000 setup + ₹1,50,000/month',
    offer: '₹50,000 setup + ₹75,000/month',
    suffix: 'custom regional scope',
    icon: ShieldCheck,
    description: 'For multi-city developers, luxury healthcare chains, or regional franchises requiring multi-branch entity mapping and dedicated AI citation defense.',
    items: [
      'Everything in AI Search Growth & Sentinel',
      'Multi-City & Multi-Branch Schema Entity Clustering',
      'High-Volume Prompt & Geo-Fenced Tracking (100+ prompts/month)',
      'Role-Based Staging, Tenant-Isolated Evidence & Priority SLA',
      'Dedicated Technical Engineering Support'
    ],
  },
];

export const AIVisibility: React.FC = () => (
  <>
    <Helmet>
      <title>AI Visibility and AEO Services in India | Raja AI Systems</title>
      <meta name="description" content="Evidence-first AI visibility and AEO services for ChatGPT, Perplexity, Gemini, Claude and Google surfaces. Audit, monitor, improve and report measured outcomes without ranking guarantees." />
      <meta property="og:title" content="AI Visibility and AEO Services in India | Raja AI Systems" />
      <meta property="og:description" content="Evidence-first AI visibility and AEO services with audit, monitoring, approved implementation and measured proof." />
    </Helmet>
    <main className="min-h-screen bg-[#050608] text-slate-100 selection:bg-amber-200/20">
    <section className="relative overflow-hidden border-b border-white/8 bg-grid pt-32 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.18),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,.12),transparent_34%)]" />
      <div className="relative container mx-auto max-w-6xl px-5 md:px-8">
        <Link to="/" className="text-xs font-black uppercase tracking-[.25em] text-slate-400 hover:text-white">← Raja AI Systems</Link>
        <div className="mt-10 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-300">AI visibility and AEO services</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white md:text-7xl">Be easier to discover, understand and cite.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">Evidence-first visibility work for ChatGPT, Perplexity, Gemini, Claude and Google surfaces. We measure the baseline, apply approved improvements and report what was actually observed.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">Start with an audit <ArrowRight size={16} /></Link>
            <a href="#plans" className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/5">Compare plans</a>
          </div>
        </div>
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-5 py-16 md:px-8">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Measure first', 'Exact prompts, timestamps, sources and competitor observations.'],
          ['Improve with approval', 'Content, schema and technical changes are staged before production.'],
          ['No false promises', 'Rankings, citations, leads and revenue are reported only when observed.'],
        ].map(([title, body]) => <div key={title} className="glass-card rounded-2xl p-6"><p className="font-black text-white">{title}</p><p className="mt-3 text-sm leading-6 text-slate-400">{body}</p></div>)}
      </div>
    </section>

    <section id="plans" className="container mx-auto max-w-6xl px-5 pb-20 md:px-8">
      <div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.25em] text-blue-300">Choose the right level</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Three plans. One evidence-led system.</h2><p className="mt-4 text-slate-400">The 50% introductory offer keeps the approved offer prices unchanged. Scope and eligibility apply.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => { const Icon = plan.icon; return <article key={plan.name} className={`glass-card rounded-3xl p-6 ${plan.featured ? 'border-amber-300/40 shadow-[0_0_50px_rgba(245,158,11,.1)]' : ''}`}>
          <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Icon className="text-amber-300" size={22} /><h3 className="text-xl font-black">{plan.name}</h3></div><p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p></div>{plan.featured && <span className="rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">Flagship</span>}</div>
          <div className="mt-6 border-y border-white/8 py-5"><p className="text-xs text-slate-500 line-through">Regular: {plan.regular}</p><p className="mt-1 text-2xl font-black text-white">50% offer: {plan.offer}</p><p className="mt-1 text-xs text-slate-500">{plan.suffix}</p></div>
          <ul className="mt-5 space-y-3">{plan.items.map(item => <li key={item} className="flex gap-3 text-sm text-slate-300"><Check size={17} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul>
        </article>; })}
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-5 pb-16 md:px-8">
      <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-6">
        <p className="text-xs font-black uppercase tracking-[.25em] text-amber-200">Transparent delivery scope</p>
        <h2 className="mt-3 text-2xl font-black text-white">Fixed execution units. No hidden promises.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Prompt quotas and work-item limits describe the managed execution scope. They are not guarantees of rankings, citations, traffic, leads, bookings or revenue. Backlinks, PR and third-party placements are not promised by default; when authorized, they are scoped separately as research, preparation, outreach or evidence work.</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">All client work starts with a baseline audit. Growth and Enterprise include that onboarding audit in the setup scope; Monitor requires a baseline before recurring measurement begins.</p>
      </div>
    </section>

    <section className="border-y border-white/8 bg-slate-950/50">
      <div className="container mx-auto max-w-6xl px-5 py-16 md:px-8"><div className="grid gap-10 md:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Controlled historical proof example</p><h2 className="mt-3 text-3xl font-black">QuickKitAI: 55/100 → 100/100</h2><p className="mt-4 leading-7 text-slate-400">The public website was audited with a real browser and evidence was saved. Technical crawl access measured strong, while answer-ready structure, structured data and citation authority were the main improvement areas.</p></div><div className="grid grid-cols-2 gap-3 text-sm">{[['Crawl access','100/100'],['Structured data','40/100'],['Entity clarity','70/100'],['Answer-ready','30/100'],['Citation authority','35/100'],['Overall','55/100']].map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[.03] p-4"><p className="text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-white">{value}</p></div>)}</div></div></div>
    </section>

    <section className="container mx-auto max-w-6xl px-5 py-16 text-center md:px-8"><h2 className="text-3xl font-black md:text-5xl">Start with a measured baseline.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">No guaranteed AI ranking. No fabricated citations. Just approved work, timestamped evidence and a clear next step.</p><Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">Request an audit <ArrowRight size={16} /></Link></section>
    </main>
  </>
);
