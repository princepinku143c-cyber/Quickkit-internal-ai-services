import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Network, MessageSquareText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const pillars = [
  { title: 'SEO — Search Engine Optimization', icon: Search, objective: 'Help search engines crawl, understand and index the right public pages.', checks: ['Unique page titles, descriptions, H1s and canonical URLs', 'Public XML sitemap and robots.txt policy', 'Pre-rendered HTML summaries for important public routes', 'Internal links, mobile usability, page performance and broken URLs', 'Google Search Console and Bing Webmaster data review'], evidence: 'Current repository contains sitemap, robots.txt, route metadata and a prerender build step. Search Console/Bing account access and current indexing/ranking results have not been independently verified here.' },
  { title: 'GEO — Generative Engine Optimization', icon: Network, objective: 'Make the company, services, expertise and supporting evidence clear to generative systems.', checks: ['Consistent Organization and WebSite identity information', 'Clear service descriptions, ownership, authorship and contact details', 'Original guides, transparent case studies and verifiable proof', 'Relevant third-party references and legitimate industry mentions', 'Consistent facts across the website and approved public profiles'], evidence: 'The site has Organization/WebSite structured data and an llms.txt overview. External authority, earned citations and independent third-party mentions still need evidence collection.' },
  { title: 'AEO — Answer Engine Optimization', icon: MessageSquareText, objective: 'Give answer engines useful, direct and sourceable answers to buyer questions.', checks: ['Question-led pages with concise answers and supporting detail', 'FAQ and service schema only where it matches visible content', 'Allow relevant search crawlers and verify CDN/WAF access', 'Run a fixed prompt set on ChatGPT Search, Gemini and Perplexity', 'Record mention, recommendation and citation as separate outcomes'], evidence: 'The site has real-estate Q&A content, FAQ schema on the homepage, llms.txt and explicit OAI-SearchBot/PerplexityBot rules. The 60-prompt live baseline has not yet been completed.' }
];
const externalChecks = [
  ['Google Search Console', 'Verify domain ownership, submit sitemap, inspect indexing and query performance.', 'https://search.google.com/search-console'],
  ['Bing Webmaster Tools', 'Verify the domain, submit sitemap and review crawl/index reports.', 'https://www.bing.com/webmasters'],
  ['PageSpeed Insights', 'Measure mobile and desktop Core Web Vitals on key public routes.', 'https://pagespeed.web.dev/'],
  ['Rich Results Test', 'Validate eligible structured data; valid schema does not guarantee rich results.', 'https://search.google.com/test/rich-results']
];

export const SEOAudit: React.FC = () => (
  <main className="min-h-screen bg-[#030712] text-slate-300 font-sans">
    <Helmet>
      <title>SEO, GEO and AEO Audit | Raja AI Systems</title>
      <meta name="description" content="Integrated SEO, generative engine optimization and answer engine optimization audit for web search and AI discovery. Evidence, gaps and next steps—without ranking guarantees." />
      <meta name="keywords" content="SEO audit, GEO audit, AEO audit, AI visibility audit India, generative engine optimization, answer engine optimization" />
      <link rel="canonical" href="https://quickkitai.com/seo-audit" />
      <meta property="og:title" content="SEO, GEO and AEO Audit | Raja AI Systems" />
      <meta property="og:description" content="Technical search readiness, generative entity authority and answer-engine visibility—reviewed as one system." />
      <meta property="og:url" content="https://quickkitai.com/seo-audit" />
    </Helmet>
    <header className="border-b border-white/10 bg-slate-950/80 px-5 pb-12 pt-28">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-xs font-bold uppercase tracking-[.2em] text-slate-400 hover:text-white">← Raja AI Systems</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[.25em] text-amber-300">Integrated visibility audit</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">SEO + GEO + AEO: one audit, three connected layers.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">This page separates repository-level implementation evidence from external account data and live AI-platform observations. A code check is not proof of a search ranking, an AI citation or a business result.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/ai-visibility" className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">View service plans</Link>
          <Link to="/proof-of-value" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/5">Evidence methodology</Link>
        </div>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="mb-8"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Three audit pillars</p><h2 className="mt-3 text-3xl font-black text-white md:text-4xl">What gets checked and what evidence counts.</h2></div>
      <div className="grid gap-5 lg:grid-cols-3">
        {pillars.map((pillar) => { const Icon = pillar.icon; return (
          <article key={pillar.title} className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <Icon className="text-amber-300" size={26} /><h3 className="mt-4 text-xl font-black text-white">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.objective}</p>
            <ul className="mt-5 space-y-3">{pillar.checks.map(item => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-300"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-300" />{item}</li>)}</ul>
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-4"><p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-200">Evidence status</p><p className="mt-2 text-xs leading-6 text-slate-400">{pillar.evidence}</p></div>
          </article>
        ); })}
      </div>
    </section>
    <section className="border-y border-white/10 bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex items-center gap-3"><AlertCircle className="text-amber-300" size={22} /><h2 className="text-2xl font-black text-white">External verification still required</h2></div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">These services require owner access or a live measurement run. Website code cannot prove that a domain is verified, a sitemap is submitted, pages are indexed, or an AI platform has cited the business.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">{externalChecks.map(([name, detail, url]) => <article key={name} className="rounded-xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-bold text-white">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p><a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-300 underline underline-offset-4" href={url} target="_blank" rel="noreferrer">Open official tool <ExternalLink size={14} /></a></article>)}</div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h2 className="text-2xl font-black text-white">Execution order</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ['1. Verify the technical foundation', 'Run clean build and route tests; check live robots.txt, sitemap.xml, llms.txt, canonicals and rendered HTML.'],
          ['2. Capture the baseline', 'Run the same 60 prompts separately on ChatGPT Search, Gemini and Perplexity; save full answers, dates and cited URLs.'],
          ['3. Improve the entity and evidence', 'Strengthen company facts, service pages, author/source attribution, original guides and real third-party references.'],
          ['4. Improve answer readiness', 'Close buyer-question gaps, add only supported structured data and make every key claim traceable to evidence.'],
          ['5. Re-test and report', 'Repeat the same prompts and search queries; compare changes without treating blocked or failed runs as absent.'],
          ['6. Keep it maintained', 'Review new queries, technical errors, competitor movement and source changes on the agreed schedule.']
        ].map(([title, detail]) => <li key={title} className="rounded-xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p></li>)}
      </ol>
    </section>
    <footer className="border-t border-white/10 px-5 py-10 text-center"><p className="text-sm text-slate-500">No guaranteed rankings, citations, recommendations, traffic, leads or revenue. Reports must show the date, platform, method and underlying evidence.</p><Link to="/ai-visibility" className="mt-4 inline-flex font-bold text-amber-300 underline underline-offset-4">Explore SEO + GEO + AEO plans</Link></footer>
  </main>
);
