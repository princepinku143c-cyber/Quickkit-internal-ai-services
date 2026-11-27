import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialMetaBar, PublicRouteFooter, SeoMeta } from './SeoMeta';

const metrics = [
  ['Technical crawl access', '100/100', 'Live read-only audit'],
  ['Structured data', '80/100', 'Live read-only audit'],
  ['Entity clarity', '100/100', 'Organization, canonical and sameAs check'],
  ['Answer-ready structure', '100/100', 'Question headings and comparison table'],
  ['Citation-proof authority', '50/100', 'Methodology links published; authority growth pending'],
];

export const ProofOfValue: React.FC = () => (
  <div className="min-h-screen bg-[#030712] font-sans text-slate-300">
    <SeoMeta
      title="Proof of Value: AI & AEO Audits | Raja AI Systems"
      description="Observed technical audit metrics, AEO readiness scores, and controlled pilot measurement criteria for QuickKitAI and Raja AI Systems."
      keywords="AI automation proof of value, AEO audit evidence, QuickKitAI benchmark, Raja AI Systems evidence, measured pilot metrics"
      canonical="https://quickkitai.com/proof-of-value"
      ogType="article"
    />
    <main className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm font-bold text-amber-300 underline">← Back to Raja AI Systems</Link>
        <p className="mt-12 text-xs font-black uppercase tracking-[.25em] text-emerald-300">Evidence-first pilot proof</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">Proof of value for AI automation and AI visibility</h1>
        <EditorialMetaBar className="mt-4" />
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Raja AI Systems separates technical readiness from business outcomes. This page records what has been observed on the public QuickKitAI website and what still requires a controlled real-lead pilot.</p>

        <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">TL;DR — Verified Audit Evidence</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            QuickKitAI passes technical crawl access (100/100), entity clarity (100/100), and answer-ready structure (100/100) across 160 tracked prompts and 14 sitemap URLs (683ms benchmark TTFB). Business ROI metrics are marked pending until verified in a client pilot.
          </p>
        </div>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] p-6"><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Current live audit</p><p className="mt-3 text-5xl font-black text-white">86/100</p><p className="mt-3 text-sm leading-6 text-slate-400">AEO technical and answer-readiness baseline score with continuous schema verification.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Prompt monitoring</p><p className="mt-3 text-5xl font-black text-white">160</p><p className="mt-3 text-sm leading-6 text-slate-400">Tracked prompts across eight categories in the live audit engine.</p></div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-6"><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Business outcome proof</p><p className="mt-3 text-5xl font-black text-white">Pending</p><p className="mt-3 text-sm leading-6 text-slate-400">Lead, booking, revenue and time-saved metrics require a controlled pilot.</p></div>
        </section>

        <section className="mt-16 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.03]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <caption className="sr-only">QuickKitAI live AEO evidence</caption>
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="px-5 py-4">Metric</th><th className="px-5 py-4">Observed result</th><th className="px-5 py-4">Evidence type</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {metrics.map(([name, result, evidence]) => (
                <tr key={name}>
                  <th scope="row" className="px-5 py-4 font-bold text-white">{name}</th>
                  <td className="px-5 py-4 text-emerald-200">{result}</td>
                  <td className="px-5 py-4 text-slate-400">{evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 p-7">
            <h2 className="text-2xl font-black text-white">What the pilot will measure</h2>
            <ul className="mt-5 space-y-3 leading-7 text-slate-400">
              <li>• Enquiries received and successfully captured</li>
              <li>• Qualification completeness and handoff quality</li>
              <li>• First-response and follow-up completion</li>
              <li>• Site visits booked and attended (measured pilot targets)</li>
              <li>• CRM update accuracy and manual hours saved</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 p-7">
            <h2 className="text-2xl font-black text-white">What this page does not claim</h2>
            <p className="mt-5 leading-7 text-slate-400">The current audit does not prove ChatGPT ranking, Google ranking, Perplexity citation, Gemini recommendation, leads, revenue or customer ROI. Those require timestamped platform observations and a controlled business pilot.</p>
          </article>
        </section>

        <section className="mt-16 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-7">
          <h2 className="text-2xl font-black text-white">How evidence is recorded</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">Each monitoring cycle stores the audit date, prompt set, surface, observed response, citation URLs and score breakdown. Tier 01 AEO foundation work is ₹15,000 one-time, pay after live verified result (₹0 advance).</p>
          <Link to="/ai-visibility" className="mt-6 inline-flex text-sm font-black text-amber-300 underline">View AI Visibility plans →</Link>
        </section>
      </div>
    </main>

    <PublicRouteFooter />
  </div>
);
