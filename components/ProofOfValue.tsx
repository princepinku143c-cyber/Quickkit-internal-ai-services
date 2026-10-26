import React from 'react';
import { Link } from 'react-router-dom';

const metrics = [
  ['Technical crawl access', '100/100', 'Live read-only audit'],
  ['Structured data', '80/100', 'Live read-only audit'],
  ['Entity clarity', '100/100', 'Organization, canonical and sameAs check'],
  ['Answer-ready structure', '100/100', 'Question headings and comparison table'],
  ['Citation-proof authority', '50/100', 'Three methodology links; authority growth pending'],
];

export const ProofOfValue: React.FC = () => (
  <main className="min-h-screen bg-[#030712] px-5 py-24 font-sans text-slate-300 md:px-8">
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="text-sm font-bold text-amber-300 underline">← Back to Raja AI Systems</Link>
      <p className="mt-16 text-xs font-black uppercase tracking-[.25em] text-emerald-300">Evidence-first pilot proof</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">Proof of value for AI automation and AI visibility</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Raja AI Systems separates technical readiness from business outcomes. This page records what has been observed on the public QuickKitAI website and what still requires a controlled real-lead pilot.</p>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] p-6"><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Current live audit</p><p className="mt-3 text-5xl font-black text-white">86/100</p><p className="mt-3 text-sm leading-6 text-slate-400">AEO technical and answer-readiness score, audited 26 October 2026.</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Prompt monitoring</p><p className="mt-3 text-5xl font-black text-white">160</p><p className="mt-3 text-sm leading-6 text-slate-400">Tracked prompts across eight categories in the live audit engine.</p></div>
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-6"><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Business outcome proof</p><p className="mt-3 text-5xl font-black text-white">Pending</p><p className="mt-3 text-sm leading-6 text-slate-400">Lead, booking, revenue and time-saved metrics require a controlled pilot.</p></div>
      </section>

      <section className="mt-16 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.03]">
        <table className="w-full min-w-[700px] text-left text-sm"><caption className="sr-only">QuickKitAI live AEO evidence</caption><thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Metric</th><th className="px-5 py-4">Observed result</th><th className="px-5 py-4">Evidence type</th></tr></thead><tbody className="divide-y divide-white/10">{metrics.map(([name, result, evidence]) => <tr key={name}><th scope="row" className="px-5 py-4 font-bold text-white">{name}</th><td className="px-5 py-4 text-emerald-200">{result}</td><td className="px-5 py-4 text-slate-400">{evidence}</td></tr>)}</tbody></table>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 p-7"><h2 className="text-2xl font-black text-white">What the pilot will measure</h2><ul className="mt-5 space-y-3 leading-7 text-slate-400"><li>• Enquiries received and successfully captured</li><li>• Qualification completeness and handoff quality</li><li>• First-response and follow-up completion</li><li>• Site visits booked and attended</li><li>• CRM update accuracy and manual hours saved</li></ul></article>
        <article className="rounded-2xl border border-white/10 p-7"><h2 className="text-2xl font-black text-white">What this page does not claim</h2><p className="mt-5 leading-7 text-slate-400">The current audit does not prove ChatGPT ranking, Google ranking, Perplexity citation, Gemini recommendation, leads, revenue or customer ROI. Those require timestamped platform observations and a controlled business pilot.</p></article>
      </section>

      <section className="mt-16 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-7"><h2 className="text-2xl font-black text-white">How evidence is recorded</h2><p className="mt-4 max-w-3xl leading-7 text-slate-300">Each monitoring cycle stores the audit date, prompt set, surface, observed response, citation URLs and score breakdown. Business case-study numbers will be published only after the sample, baseline and measurement method are approved.</p><Link to="/ai-visibility" className="mt-6 inline-flex text-sm font-black text-amber-300 underline">View AI Visibility plans →</Link></section>
    </div>
  </main>
);
