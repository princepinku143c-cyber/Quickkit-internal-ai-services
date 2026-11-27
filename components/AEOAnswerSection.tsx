import React from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'What does QuickKitAI | Raja AI Systems do for Indian real estate teams?',
    answer:
      'QuickKitAI | Raja AI Systems builds AEO/GEO search foundations and a 5-agent managed AI workforce for property enquiry intake, lead qualification, WhatsApp follow-up, site-visit coordination and CRM operations. Exact channels, integrations and service terms are confirmed in each written client agreement.',
  },
  {
    question: 'What are the AEO Tier 01 and Tier 02 pricing terms?',
    answer:
      'AEO Tier 01 (AI Technical Foundation & Schema Fix) is ₹15,000 one-time against a ₹30,000 standard anchor, with ₹0 advance under Pay-After-Live-Verified-Result acceptance, delivered in 7 business days with ₹0 ongoing monthly maintenance. AEO Tier 02 (AI Search Growth & Autonomous Sentinel) is ₹20,000 setup plus ₹25,000/month on a 30-day rolling cycle.',
  },
  {
    question: 'What is AI visibility and AEO?',
    answer:
      'Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) structure entity data, JSON-LD @graph schemas, llms.txt files and BLUF summaries so search engines and AI systems can parse and cite verified facts accurately. Citations, leads and revenue remain measured outcomes rather than guaranteed rankings.',
  },
  {
    question: 'Does QuickKitAI | Raja AI Systems guarantee ChatGPT, Google or Perplexity rankings?',
    answer:
      'No. QuickKitAI | Raja AI Systems does not guarantee rankings, citations, recommendations, leads or revenue. Every audit and monitoring cycle records exact prompts, dates, AI surfaces, observed responses and verification evidence.',
  },
];

export const AEOAnswerSection: React.FC = () => (
  <section id="ai-visibility-explained" className="border-t border-white/10 bg-slate-950/70 px-5 py-20 md:px-8">
    <div className="mx-auto max-w-6xl">
      <div id="aeo-answer-intro" className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
          <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-bold uppercase tracking-[.18em] text-amber-300">
            Last updated: 27 November 2026
          </span>
          <span>
            By{' '}
            <Link to="/about" className="font-bold text-slate-200 underline decoration-amber-400/50 underline-offset-4 hover:text-amber-300">
              Prince (Raja), Founder &amp; Chief AI Systems Architect
            </Link>
          </span>
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[.24em] text-amber-300">
          BLUF TL;DR · Clear answers, measured evidence
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
          What does QuickKitAI | Raja AI Systems deliver for Indian businesses?
        </h2>
        <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
          <strong>Bottom-Line-Up-Front (BLUF):</strong> QuickKitAI | Raja AI Systems deploys verified AEO/GEO technical
          architecture and a 5-agent managed WhatsApp AI workforce for Indian real estate teams, with healthcare clinic
          automation available as a secondary scoped service. On <code className="text-amber-200">quickkitai.com</code>,
          our live benchmark records a <strong>683ms TTFB</strong>, <strong>14 canonical sitemap URLs</strong> at{' '}
          <strong>100% HTTP 200 route integrity</strong>, a <strong>5-entity JSON-LD @graph</strong> schema and active{' '}
          <code className="text-amber-200">/llms.txt</code> ingestion—compared against unoptimized Indian client probes
          showing <strong>1,474ms to 2,045ms TTFB</strong> and <strong>404</strong> LLM manifest gaps.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
          Clients can start with <strong>AEO Tier 01 at ₹15,000 one-time</strong> (50% off the ₹30,000 anchor,{' '}
          <strong>₹0 advance</strong>, Pay After Live Verified Result, <strong>7 business days</strong> delivery, zero
          monthly maintenance), scale into <strong>AEO Tier 02 at ₹20,000 setup + ₹25,000/month</strong> (30-day rolling
          monitoring across 4 AI surfaces), or deploy the <strong>5-Agent Autonomous Workforce pilot at ₹35,000 setup +
          ₹1,20,000/month</strong> (limited to 3 pilot slots with a written 30-day SLA targeting 10 real-estate site
          visits or 15 healthcare consultations).
        </p>
      </div>

      <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.03]">
        <table className="w-full min-w-[680px] text-left text-sm">
          <caption className="sr-only">QuickKitAI | Raja AI Systems service tiers, benchmarks and verification evidence</caption>
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4">Track / Area</th>
              <th className="px-5 py-4">Verified Scope &amp; Numbers</th>
              <th className="px-5 py-4">Evidence Produced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            <tr>
              <th scope="row" className="px-5 py-4 font-bold text-white">AEO Tier 01 (₹15,000)</th>
              <td className="px-5 py-4">₹0 advance vs ₹30,000 anchor · 7 business days · 5-entity @graph + llms.txt</td>
              <td className="px-5 py-4">Google Rich Results pass &amp; HTTP 200 crawler check</td>
            </tr>
            <tr>
              <th scope="row" className="px-5 py-4 font-bold text-white">AEO Tier 02 (₹20,000 + ₹25,000/mo)</th>
              <td className="px-5 py-4">30-day rolling cycle · 4 AI engines (ChatGPT, Perplexity, Gemini, Claude)</td>
              <td className="px-5 py-4">Daily indexing sentinel log &amp; bi-weekly audit report</td>
            </tr>
            <tr>
              <th scope="row" className="px-5 py-4 font-bold text-white">Performance &amp; Route Integrity</th>
              <td className="px-5 py-4">683ms benchmark TTFB · 14 XML sitemap URLs · 4 AI bot policies</td>
              <td className="px-5 py-4">Before-and-after latency and route audit record</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="aeo-faq" className="mt-14 grid gap-5 md:grid-cols-2">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <h3 className="text-lg font-bold text-white">{faq.question}</h3>
            <p className="mt-3 leading-7 text-slate-400">{faq.answer}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-sm leading-7 text-slate-400">
        <p className="font-bold text-slate-300">Methodology &amp; Authoritative Technical Standards</p>
        <p className="mt-2">
          Our public methodology aligns with{' '}
          <a className="text-amber-300 underline" href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noreferrer">
            Google’s helpful-content guidance
          </a>
          ,{' '}
          <a className="text-amber-300 underline" href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" target="_blank" rel="noreferrer">
            Google’s structured-data documentation
          </a>
          ,{' '}
          <a className="text-amber-300 underline" href="https://schema.org/" target="_blank" rel="noreferrer">
            Schema.org vocabulary standards
          </a>
          ,{' '}
          <a className="text-amber-300 underline" href="https://llmstxt.org/" target="_blank" rel="noreferrer">
            the llms.txt specification
          </a>
          ,{' '}
          <a className="text-amber-300 underline" href="https://www.w3.org/TR/html52/" target="_blank" rel="noreferrer">
            W3C HTML standards
          </a>{' '}
          and{' '}
          <a className="text-amber-300 underline" href="https://platform.openai.com/docs/gptbot" target="_blank" rel="noreferrer">
            OpenAI’s crawler guidance
          </a>
          . These references govern discoverability and structure; they do not establish a ranking or citation guarantee.
        </p>
      </div>
    </div>
  </section>
);
