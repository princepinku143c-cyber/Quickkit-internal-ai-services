import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SeoMeta } from './SeoMeta';

const FAQS = [
  {
    question: 'What information should an AI lead qualification workflow collect?',
    answer: 'Start with the minimum information sales actually needs: preferred location or project, property type, budget range, purchase timeline, and whether the prospect would like a call or site visit. Explain why the information is requested and avoid collecting sensitive details that are not needed.'
  },
  {
    question: 'Can AI qualify property leads on WhatsApp?',
    answer: 'Yes, when an approved WhatsApp provider and the client account are configured. The workflow can ask qualifying questions, record the answers, and hand the conversation to a person. The channel connection, templates, message rules, and usage fees must be tested for each client.'
  },
  {
    question: 'Can AI automatically book a property site visit?',
    answer: 'A workflow can offer available slots and record a site visit when the calendar, project availability, and booking rules are connected. Before confirming, it should verify the slot and send the prospect an accurate confirmation. If the integration cannot confirm availability, route the request to a salesperson instead.'
  },
  {
    question: 'Does AI lead qualification guarantee more property sales?',
    answer: 'No. It can make intake and follow-up more consistent, but sales outcomes depend on lead quality, project fit, pricing, inventory, team follow-through, and market conditions. Measure qualified leads, appointments, attended visits, and eventual conversions against a baseline.'
  }
];

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'AI Lead Qualification for Real Estate in India: A Practical Workflow',
  description: 'A practical guide for Indian builders and brokerages to design AI-assisted property lead intake, qualification, follow-up, CRM handoff, and site-visit booking.',
  datePublished: '2026-10-23',
  dateModified: '2026-10-23',
  author: { '@type': 'Organization', name: 'Raja AI Systems' },
  publisher: { '@type': 'Organization', name: 'Raja AI Systems', url: 'https://quickkitai.com' },
  mainEntityOfPage: 'https://quickkitai.com/guides/real-estate-ai-lead-qualification'
};

export const RealEstateLeadQualificationGuide: React.FC = () => (
  <article className="min-h-screen bg-[#030712] text-slate-200">
    <SeoMeta
      title="AI Lead Qualification for Real Estate in India: A Practical Workflow"
      description="Learn how Indian builders and brokerages can structure AI-assisted property lead qualification, WhatsApp follow-up, CRM handoff, and site-visit booking."
      keywords="AI lead qualification real estate India, property lead qualification, WhatsApp automation for builders, real estate CRM automation, site visit booking workflow"
      canonical="https://quickkitai.com/guides/real-estate-ai-lead-qualification"
      schemaObj={articleSchema}
      authorName="Raja AI Systems"
    />
    <Helmet>
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer }
        }))
      })}</script>
    </Helmet>

    <header className="border-b border-white/10 bg-slate-950/80">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-400">Real Estate AI · India</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">AI Lead Qualification for Real Estate in India: A Practical Workflow</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">AI lead qualification should do more than reply quickly. It should collect the right property requirements, keep the conversation accurate, hand qualified enquiries to the sales team, and record what happened in the CRM.</p>
        <p className="mt-4 text-sm text-slate-500">Published 23 October 2026 · Practical guide for builders, developers, and brokerages</p>
      </div>
    </header>

    <main className="mx-auto max-w-4xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/services/real-estate" className="hover:text-white">Real Estate AI Automation</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Lead Qualification Guide</span>
      </nav>

      <section className="space-y-5 leading-8 text-slate-300">
        <h2 className="pt-2 text-2xl font-bold text-white">1. Start with the questions your sales team actually needs</h2>
        <p>For a residential property enquiry, a useful first conversation may capture the preferred location or project, property type or BHK, approximate budget range, expected purchase timeline, and whether the person wants a callback or site visit. Commercial property teams may need a different set of questions. Keep the form short and adapt it to the inventory the business actually sells.</p>
        <p>Do not ask for every possible detail at the beginning. Collect only what is relevant to matching the enquiry to a suitable project and deciding the next step. If the prospect does not know an answer, allow them to skip it.</p>

        <h2 className="pt-2 text-2xl font-bold text-white">2. Use a simple, explainable qualification process</h2>
        <ol className="list-decimal space-y-3 pl-6">
          <li><strong className="text-white">Capture:</strong> Receive the enquiry from an agreed source such as the website form or a configured messaging channel.</li>
          <li><strong className="text-white">Clarify:</strong> Ask a small number of conversational questions about location, budget, property type, and timing.</li>
          <li><strong className="text-white">Match:</strong> Compare the answers with current project and inventory information supplied by the business. Never invent availability, prices, offers, or possession dates.</li>
          <li><strong className="text-white">Route:</strong> Send high-intent or exception cases to the correct salesperson, with the answers and conversation context attached.</li>
          <li><strong className="text-white">Follow up:</strong> If the prospect agrees, share relevant project information and offer a verified callback or site-visit option.</li>
          <li><strong className="text-white">Record:</strong> Save the qualification outcome, next action, owner, and timestamps in the CRM or agreed lead tracker.</li>
        </ol>

        <h2 className="pt-2 text-2xl font-bold text-white">3. Make the CRM the source of truth</h2>
        <p>A useful handoff should preserve the original enquiry source, contact preference, qualification answers, conversation summary, assigned salesperson, next action, and appointment status. The actual fields and stage names should match the client’s CRM. Test duplicate handling, failed synchronisation, and what happens when a lead cannot be assigned.</p>
        <p>A CRM integration should not be described as live just because a connector exists in code or a workflow diagram. Confirm that the target account is connected and that lead creation, updates, retries, and human handoff work in a test environment.</p>

        <h2 className="pt-2 text-2xl font-bold text-white">4. Treat site visits as a confirmed workflow, not a promise</h2>
        <p>Before telling a property buyer that a visit is booked, check the availability source, project, date, time, and contact details. Send a confirmation only after the booking step succeeds. If the calendar or inventory system is unavailable, explain that a person will confirm the slot instead of pretending the booking is complete.</p>
        <p>Follow-ups should respect the prospect’s communication preferences and any applicable messaging rules. Provide a straightforward human handoff and a way to stop unwanted messages.</p>

        <h2 className="pt-2 text-2xl font-bold text-white">5. Measure the whole funnel</h2>
        <p>Track a baseline before automation and compare it with the same metrics after launch. Useful measures include first-response time, percentage of enquiries with completed qualification, qualified-lead rate, successful CRM write rate, callback acceptance, site visits booked, visits actually attended, and opt-outs or complaints. Review lead quality with the sales team; a high number of automated replies is not the same as business impact.</p>
        <p>Do not promise a fixed uplift in conversion or revenue before measuring a real client workflow. Outcomes depend on lead sources, project fit, response quality, inventory, salesperson follow-through, and the accuracy of the integration.</p>

        <h2 className="pt-2 text-2xl font-bold text-white">6. Protect customer information and trust</h2>
        <p>Tell prospects why information is being requested, collect only what is necessary, limit access to lead records, and document retention and deletion rules with the client. Do not use scraped private information or make unsupported claims about loan approval, property availability, guaranteed appreciation, or project status. Escalate uncertain or sensitive questions to a qualified human.</p>

        <h2 className="pt-4 text-2xl font-bold text-white">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map(({ question, answer }) => (
            <section key={question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-bold text-white">{question}</h3>
              <p className="mt-3 text-slate-300">{answer}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <h2 className="text-xl font-bold text-white">Next step: map this to your sales process</h2>
          <p className="mt-3">Start with one lead source, one qualification script, one human handoff rule, and one CRM path. Verify the entire flow before expanding to more channels.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/services/real-estate" className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950">Explore Real Estate Automation</Link>
            <Link to="/contact" className="rounded-xl border border-white/15 px-5 py-3 font-bold text-white">Discuss a Workflow</Link>
          </div>
        </section>
      </section>
    </main>
  </article>
);
