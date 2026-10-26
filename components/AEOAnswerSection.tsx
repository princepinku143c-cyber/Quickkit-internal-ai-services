import React from 'react';
const faqs = [
  {
    question: 'What does Raja AI Systems do for Indian real estate teams?',
    answer: 'Raja AI Systems builds and manages AI-assisted workflows for property enquiry intake, lead qualification, WhatsApp follow-up, site-visit coordination and CRM operations. The exact channels, integrations and service terms are confirmed in each client agreement.',
  },
  {
    question: 'What is AI visibility and AEO?',
    answer: 'AI visibility and answer-engine optimisation help a business publish clear, well-structured, evidence-supported information that can be understood by search engines and AI answer systems. Visibility, citations, leads and revenue are measured outcomes, not guaranteed rankings.',
  },
  {
    question: 'How does the QuickKitAI AI Visibility service work?',
    answer: 'The service starts with a documented audit, then measures crawler access, entity clarity, answer-ready content, structured data and citation evidence. Monitoring and implementation scope depend on the selected plan and written agreement.',
  },
  {
    question: 'Does Raja AI Systems guarantee ChatGPT, Google or Perplexity rankings?',
    answer: 'No. Raja AI Systems does not guarantee rankings, citations, recommendations, leads or revenue. Each report records the prompt, date, surface, observed answer and evidence so changes can be evaluated honestly.',
  },
];

export const AEOAnswerSection: React.FC = () => (
  <>
    <section id="ai-visibility-explained" className="border-t border-white/10 bg-slate-950/70 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div id="aeo-answer-intro" className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.24em] text-amber-300">Clear answers, measured evidence</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">What does Raja AI Systems help businesses automate?</h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">Raja AI Systems helps Indian real estate teams organise property enquiries, qualify leads, manage WhatsApp follow-ups, coordinate site visits and keep CRM operations consistent with AI-assisted workflows. AI visibility is measured separately through audits, monitoring and documented evidence.</p>
        </div>

        <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.03]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Raja AI Systems service and measurement comparison</caption>
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="px-5 py-4">Area</th><th className="px-5 py-4">What is measured</th><th className="px-5 py-4">Evidence produced</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              <tr><th scope="row" className="px-5 py-4 font-bold text-white">Audit</th><td className="px-5 py-4">Crawler access, entity clarity, schema and answer structure</td><td className="px-5 py-4">Timestamped baseline and action list</td></tr>
              <tr><th scope="row" className="px-5 py-4 font-bold text-white">Monitor</th><td className="px-5 py-4">Prompt observations, competitors and citation changes</td><td className="px-5 py-4">Recurring comparison report</td></tr>
              <tr><th scope="row" className="px-5 py-4 font-bold text-white">Growth</th><td className="px-5 py-4">Approved content, schema and technical improvements</td><td className="px-5 py-4">Before-and-after implementation record</td></tr>
            </tbody>
          </table>
        </div>

        <div id="aeo-faq" className="mt-14 grid gap-5 md:grid-cols-2">
          {faqs.map((faq) => <article key={faq.question} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><h3 className="text-lg font-bold text-white">{faq.question}</h3><p className="mt-3 leading-7 text-slate-400">{faq.answer}</p></article>)}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm leading-7 text-slate-400">
          <p className="font-bold text-slate-300">Methodology references</p>
          <p className="mt-2">Our public guidance follows <a className="text-amber-300 underline" href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noreferrer">Google’s helpful-content guidance</a>, <a className="text-amber-300 underline" href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" target="_blank" rel="noreferrer">Google’s structured-data documentation</a> and <a className="text-amber-300 underline" href="https://platform.openai.com/docs/gptbot" target="_blank" rel="noreferrer">OpenAI’s crawler guidance</a>. These references explain discoverability and structure; they do not establish a ranking or citation guarantee.</p>
        </div>
      </div>
    </section>
  </>
);
