import React from 'react';
import { ArrowRight, Check, Eye, LineChart, Rocket, ShieldCheck, Search, Network, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const pillars = [
  { name: 'SEO — Search Engine Optimization', icon: Search, purpose: 'Make public pages crawlable, indexable and relevant to real search intent.', work: ['Technical crawl and indexability checks', 'Search-intent titles, headings and internal links', 'Sitemap, robots, canonical and performance checks', 'Google Search Console and Bing Webmaster measurement'], measure: 'Indexed URLs, impressions, clicks, query groups and qualified enquiries' },
  { name: 'GEO — Generative Engine Optimization', icon: Network, purpose: 'Make the business entity, expertise and evidence clear enough for generative systems to understand and cite.', work: ['Consistent company and service facts', 'Original guides, case studies and documented proof', 'Relevant third-party references and legitimate brand mentions', 'Clear source attribution, authorship and structured information'], measure: 'Entity consistency, source inclusion, citation quality and referral evidence' },
  { name: 'AEO — Answer Engine Optimization', icon: MessageSquareText, purpose: 'Make important buyer questions easy to answer accurately across answer engines and LLM search experiences.', work: ['Direct, complete answers to buyer-intent questions', 'Relevant FAQ and service information with supported schema', 'Stable prompt sets for ChatGPT Search, Gemini and Perplexity', 'Timestamped observations separating mention, recommendation and citation'], measure: 'Prompt-level mentions, recommendations, citations and source URLs' }
];
const plans = [
  { name: 'AI Visibility Audit', regular: '₹19,998', offer: '₹9,999', suffix: 'one-time', icon: Eye, description: 'A human-reviewed baseline across website search readiness and selected AI answer surfaces.', items: ['30–50 buyer-intent prompts', 'SEO, GEO and AEO readiness review', 'Competitor comparison with captured evidence', '30-day prioritized action plan'] },
  { name: 'AI Visibility Monitor', regular: '₹59,998', offer: '₹29,999', suffix: 'per month', icon: LineChart, description: 'Recurring, documented checks so changes in visibility and cited sources can be compared.', items: ['Up to 40 tracked prompts/month', 'Scheduled human-reviewed checks', 'Mention, recommendation and citation records', 'Competitor movement and source report', 'Monthly executive summary'] },
  { name: 'AI Visibility Growth', regular: '₹1,50,000 setup + ₹2,40,000/month', offer: '₹75,000 setup + ₹1,20,000/month', suffix: 'managed implementation', icon: Rocket, featured: true, description: 'Approved technical, content and entity improvements with repeat measurement.', items: ['Everything in Monitor', 'Up to 60 tracked prompts/month', 'Up to 8 answer/content work items/month', 'Up to 4 approved technical fix batches/month', 'Staging implementation and re-audit'] },
  { name: 'Multi-location Enterprise', regular: '₹5,00,000 setup + ₹4,00,000/month', offer: '₹2,50,000 setup + ₹2,00,000/month', suffix: 'custom scope', icon: ShieldCheck, description: 'For multiple locations, services, brands or domains that need separate measurement and approvals.', items: ['Custom prompt and location quotas', 'Separate locations and prompt sets', 'Role-based approvals', 'Tenant-isolated evidence', 'Executive reporting and audits'] }
];

export const AIVisibility: React.FC = () => (
  <>
    <Helmet>
      <title>SEO, GEO and AEO Services in India | Raja AI Systems</title>
      <meta name="description" content="Integrated SEO, generative engine optimization and answer engine optimization for web search and AI discovery. Evidence-led audits, approved improvements and human-reviewed visibility measurement." />
      <meta property="og:title" content="SEO, GEO and AEO Services in India | Raja AI Systems" />
      <meta property="og:description" content="One integrated approach to Google and Bing search visibility, generative engine understanding and AI answer-engine citations." />
      <link rel="canonical" href="https://quickkitai.com/ai-visibility" />
    </Helmet>
    <main className="min-h-screen bg-[#050608] text-slate-100 selection:bg-amber-200/20">
      <section className="relative overflow-hidden border-b border-white/8 bg-grid pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.18),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,.12),transparent_34%)]" />
        <div className="relative container mx-auto max-w-6xl px-5 md:px-8">
          <Link to="/" className="text-xs font-black uppercase tracking-[.25em] text-slate-400 hover:text-white">← Raja AI Systems</Link>
          <div className="mt-10 max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[.3em] text-amber-300">One integrated visibility system</p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white md:text-7xl">SEO + GEO + AEO. Built to work together.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">Improve discoverability across traditional web search and AI answer experiences. We establish a baseline, prioritize evidence-backed improvements and report what was actually observed—not guaranteed rankings.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">Start with an audit <ArrowRight size={16} /></Link>
              <a href="#pillars" className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/5">Explore all three pillars</a>
            </div>
          </div>
        </div>
      </section>
      <section id="pillars" className="container mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="mb-8 max-w-3xl"><p className="text-xs font-black uppercase tracking-[.25em] text-blue-300">The three connected disciplines</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Different signals. One consistent business story.</h2><p className="mt-4 leading-7 text-slate-400">SEO helps search engines discover pages. GEO strengthens entity understanding and source credibility in generative experiences. AEO structures useful answers and measures how answer engines represent the business. None can force an independent platform to rank or recommend a company.</p></div>
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => { const Icon = pillar.icon; return <article key={pillar.name} className="glass-card rounded-2xl border border-white/10 p-6"><Icon className="text-amber-300" size={26} /><h3 className="mt-4 text-xl font-black text-white">{pillar.name}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{pillar.purpose}</p><ul className="mt-5 space-y-3">{pillar.work.map(item => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-300"><Check size={16} className="mt-1 shrink-0 text-emerald-300" />{item}</li>)}</ul><p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400"><strong className="text-slate-200">What we measure:</strong> {pillar.measure}</p></article>; })}
        </div>
      </section>
      <section className="container mx-auto max-w-6xl px-5 pb-16 md:px-8"><div className="grid gap-5 md:grid-cols-3">{[['Measure first', 'Capture the domain, exact prompt, platform, date, answer and source URLs before changing anything.'], ['Improve with approval', 'Stage technical, content and entity changes; review them before production release.'], ['Report honestly', 'Keep technical checks, external indexing, AI observations and business outcomes as separate evidence categories.']].map(([title, body]) => <div key={title} className="glass-card rounded-2xl p-6"><p className="font-black text-white">{title}</p><p className="mt-3 text-sm leading-6 text-slate-400">{body}</p></div>)}</div></section>
      <section id="plans" className="container mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.25em] text-blue-300">Choose the right level</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Four plans. One evidence-led system.</h2><p className="mt-4 text-slate-400">Published offer pricing and eligibility are subject to the current written offer and signed scope.</p></div>
        <div className="grid gap-5 lg:grid-cols-2">{plans.map((plan) => { const Icon = plan.icon; return <article key={plan.name} className={'glass-card rounded-3xl border border-white/10 p-6 ' + (plan.featured ? 'border-amber-300/40 shadow-[0_0_50px_rgba(245,158,11,.1)]' : '')}><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Icon className="text-amber-300" size={22} /><h3 className="text-xl font-black">{plan.name}</h3></div><p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p></div>{plan.featured && <span className="rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">Flagship</span>}</div><div className="mt-6 border-y border-white/8 py-5"><p className="text-xs text-slate-500 line-through">Regular: {plan.regular}</p><p className="mt-1 text-2xl font-black text-white">Offer: {plan.offer}</p><p className="mt-1 text-xs text-slate-500">{plan.suffix}</p></div><ul className="mt-5 space-y-3">{plan.items.map(item => <li key={item} className="flex gap-3 text-sm text-slate-300"><Check size={17} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul></article>; })}</div>
      </section>
      <section className="container mx-auto max-w-6xl px-5 pb-16 md:px-8"><div className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-6"><p className="text-xs font-black uppercase tracking-[.25em] text-amber-200">Delivery and measurement boundaries</p><h2 className="mt-3 text-2xl font-black text-white">A clear scope. No ranking guarantees.</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Prompt quotas describe the agreed measurement scope. Website changes are staged and approved. Search Console, Bing Webmaster and AI-platform observations are reported only when access or captured evidence is available. Manual prompt testing is not represented as an automated platform integration.</p><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">No provider can guarantee a Google position, an AI citation, recommendation, lead, booking or revenue outcome. Backlinks, PR and third-party placements are not promised by default; any outreach requires a separate approved scope.</p></div></section>
      <section className="container mx-auto max-w-6xl px-5 py-16 text-center md:px-8"><h2 className="text-3xl font-black md:text-5xl">Start with a measured baseline.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">One joined-up plan for web search, generative discovery and answer-engine visibility.</p><Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">Request an audit <ArrowRight size={16} /></Link></section>
    </main>
  </>
);
