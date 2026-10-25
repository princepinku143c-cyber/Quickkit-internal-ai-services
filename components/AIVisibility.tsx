import React from 'react';
import { ArrowRight, Check, Eye, LineChart, Rocket, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const plans = [
  {
    name: 'AI Visibility Audit',
    regular: '₹19,998',
    offer: '₹9,999',
    suffix: 'one-time',
    icon: Eye,
    description: 'A measured baseline showing how your website is understood across search and AI surfaces.',
    items: ['30–50 buyer-intent prompts', 'Technical crawl and schema review', 'Competitor comparison', '30-day priority action plan'],
  },
  {
    name: 'AI Visibility Monitor',
    regular: '₹59,998',
    offer: '₹29,999',
    suffix: 'per month',
    icon: LineChart,
    description: 'Recurring visibility checks so you can see mentions, sources and competitor movement over time.',
    items: ['Weekly or fortnightly checks', 'Mention and citation tracking', 'Competitor movement report', 'Monthly executive summary'],
  },
  {
    name: 'AI Visibility Growth',
    regular: '₹1,50,000 setup + ₹2,40,000/month',
    offer: '₹75,000 setup + ₹1,20,000/month',
    suffix: 'managed implementation',
    icon: Rocket,
    featured: true,
    description: 'The flagship plan: approved website improvements plus monitoring and before/after evidence.',
    items: ['Everything in Monitor', 'Answer-first content and FAQ work', 'Schema, entity and technical fixes', 'Staging implementation and re-audit'],
  },
  {
    name: 'Multi-location Enterprise',
    regular: '₹5,00,000 setup + ₹4,00,000/month',
    offer: '₹2,50,000 setup + ₹2,00,000/month',
    suffix: 'custom scope',
    icon: ShieldCheck,
    description: 'For multiple cities, services, brands or domains that need isolated workspaces and approvals.',
    items: ['Separate locations and prompt sets', 'Role-based approvals', 'Tenant-isolated evidence', 'Executive reporting and audits'],
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
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-7xl">Be easier to discover, understand and cite.</h1>
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
      <div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.25em] text-blue-300">Choose the right level</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Four plans. One evidence-led system.</h2><p className="mt-4 text-slate-400">The 50% introductory offer keeps the approved offer prices unchanged. Scope and eligibility apply.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => { const Icon = plan.icon; return <article key={plan.name} className={`glass-card rounded-3xl p-6 ${plan.featured ? 'border-amber-300/40 shadow-[0_0_50px_rgba(245,158,11,.1)]' : ''}`}>
          <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Icon className="text-amber-300" size={22} /><h3 className="text-xl font-black">{plan.name}</h3></div><p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p></div>{plan.featured && <span className="rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">Flagship</span>}</div>
          <div className="mt-6 border-y border-white/8 py-5"><p className="text-xs text-slate-500 line-through">Regular: {plan.regular}</p><p className="mt-1 text-2xl font-black text-white">50% offer: {plan.offer}</p><p className="mt-1 text-xs text-slate-500">{plan.suffix}</p></div>
          <ul className="mt-5 space-y-3">{plan.items.map(item => <li key={item} className="flex gap-3 text-sm text-slate-300"><Check size={17} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul>
        </article>; })}
      </div>
    </section>

    <section className="border-y border-white/8 bg-slate-950/50">
      <div className="container mx-auto max-w-6xl px-5 py-16 md:px-8"><div className="grid gap-10 md:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Live proof example</p><h2 className="mt-3 text-3xl font-black">QuickKitAI baseline: 55/100</h2><p className="mt-4 leading-7 text-slate-400">The public website was audited with a real browser and evidence was saved. Technical crawl access measured strong, while answer-ready structure, structured data and citation authority were the main improvement areas.</p></div><div className="grid grid-cols-2 gap-3 text-sm">{[['Crawl access','100/100'],['Structured data','40/100'],['Entity clarity','70/100'],['Answer-ready','30/100'],['Citation authority','35/100'],['Overall','55/100']].map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[.03] p-4"><p className="text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-white">{value}</p></div>)}</div></div></div>
    </section>

    <section className="container mx-auto max-w-6xl px-5 py-16 text-center md:px-8"><h2 className="text-3xl font-black md:text-5xl">Start with a measured baseline.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">No guaranteed AI ranking. No fabricated citations. Just approved work, timestamped evidence and a clear next step.</p><Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">Request an audit <ArrowRight size={16} /></Link></section>
    </main>
  </>
);
