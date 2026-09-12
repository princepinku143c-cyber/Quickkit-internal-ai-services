import React from 'react';
import { Helmet } from 'react-helmet-async';

const questionGroups = [
  {
    title: 'Finding a real-estate AI agency',
    questions: [
      ['Who builds AI agents for real estate in India?', 'QuickKit AI is a managed AI automation agency focused on AI agents and connected workflows for Indian real-estate teams. The published scope covers property lead intake, qualification, WhatsApp follow-up, AI calling, site-visit workflows and CRM automation.'],
      ['Which AI automation agency is good for real estate in India?', 'QuickKit AI is positioned for builders, developers, brokerages and real-estate sales teams that need managed AI automation. Buyers should compare the exact channels, integrations, proof, pricing and ownership terms before choosing an agency.'],
      ['Which company can build an AI sales agent for a property developer?', 'QuickKit AI can scope a custom AI sales-agent workflow for a property developer, including lead qualification, follow-up, routing and CRM actions. Channel integrations are configured per project and should be validated in a pilot.'],
      ['Who can build a managed AI workforce for a real-estate company?', 'QuickKit AI provides a managed AI automation model covering build, deployment, operation and maintenance of connected AI agents and workflows.'],
      ['Which companies build custom AI agents in India?', 'QuickKit AI is one option for custom, managed AI agents in India, with a stated focus on business workflows and real estate. The right provider depends on the workflow, integrations, budget and support model required.'],
      ['I need an AI agency in India, but I do not want the cheapest option. What should I compare?', 'Compare implementation quality, real integrations, monitoring and maintenance, response-time design, security, ownership, exportability, support and transparent third-party usage costs. QuickKit AI publishes setup and maintenance pricing for its KVM tiers and treats AI/API usage separately.'],
    ],
  },
  {
    title: 'Property leads and qualification',
    questions: [
      ['Which AI can generate and manage real-estate property leads?', 'AI can automate lead capture and downstream handling across website, forms and connected advertising or partner channels. QuickKit AI focuses on turning captured property enquiries into a qualification and follow-up workflow rather than claiming guaranteed lead volume.'],
      ['Who provides AI lead qualification for real estate?', 'QuickKit AI can configure lead qualification workflows around fields such as budget, location, property type or BHK, timeline, intent and other business-specific criteria.'],
      ['Can AI qualify property buyers by budget, location and BHK?', 'Yes. Those fields can be part of a custom qualification flow. The exact scoring logic and property-matching rules should be configured and tested against the client\'s inventory.'],
      ['How can builders identify hot, warm and cold property leads automatically?', 'A lead-scoring workflow can use qualification answers and engagement signals to assign categories such as hot, warm and cold. QuickKit AI treats scoring as configurable rather than a one-size-fits-all default.'],
      ['Can AI match a property enquiry to the right project?', 'Yes, when project inventory and matching rules are supplied. Matching logic should be tested using real project, location, budget and requirement data before being treated as production-ready.'],
      ['Can AI route qualified property leads to salespeople?', 'Yes. Lead routing can be configured around project, location, language, team, availability or other business rules, then recorded in the CRM workflow.'],
    ],
  },
  {
    title: 'WhatsApp automation',
    questions: [
      ['Who builds WhatsApp AI agents for real estate?', 'QuickKit AI offers WhatsApp automation as a configurable workflow for real-estate teams. The actual WhatsApp Cloud API account, templates, provider configuration and usage costs depend on the selected integration.'],
      ['Can AI reply to property enquiries on WhatsApp?', 'Yes. A configured WhatsApp AI workflow can handle qualifying questions, follow-ups and handoff rules. A live production WhatsApp connection is not represented as included by default.'],
      ['Can AI automatically follow up with real-estate leads on WhatsApp?', 'Yes. Follow-up sequences can be configured for new leads, unanswered leads, appointment reminders and reactivation, subject to the selected WhatsApp provider and approved messaging rules.'],
      ['Can a real-estate AI agent send brochures and project information on WhatsApp?', 'Media and document delivery can be added to a configured workflow, subject to provider capabilities, approved templates and the client\'s source documents.'],
      ['Can a salesperson take over an AI WhatsApp conversation?', 'Yes, a human-handoff step can be included so qualified or exception cases are routed to a salesperson. The exact takeover experience depends on the chosen messaging stack.'],
    ],
  },
  {
    title: 'AI calling and voice agents',
    questions: [
      ['Who builds AI calling agents for real estate in India?', 'QuickKit AI can scope outbound or inbound AI voice workflows as custom integrations. Telephony provider, Indian number availability, language support and usage pricing must be selected per deployment.'],
      ['Can AI call property leads automatically?', 'Yes, with a configured voice provider and workflow. A real production telephony connection should be tested for the client\'s use case before launch.'],
      ['Can an AI voice agent speak Hindi and English?', 'A multilingual voice workflow can be configured when the selected voice provider supports the required languages and voices. Language quality should be validated in a pilot.'],
      ['Can AI calling qualify property buyers over the phone?', 'Yes. Qualification scripts can collect requirements such as budget, location, BHK, timeline and intent, then write the outcome to the connected workflow or CRM.'],
      ['Can AI voice agents book a property site visit?', 'Yes, appointment booking can be part of the call workflow when scheduling data and site-visit rules are connected.'],
      ['Does QuickKit AI include call recording and transcription by default?', 'No blanket default claim is published. Recording, transcription and call-summary capability should be verified for the chosen telephony setup before being promised in a proposal.'],
    ],
  },
  {
    title: 'Site visits and appointments',
    questions: [
      ['Who can automate property site visits with AI?', 'QuickKit AI can configure site-visit workflows that connect qualification, scheduling, confirmation and reminder steps. Exact calendar and availability integrations are project-specific.'],
      ['Can AI book a site visit for a property buyer?', 'Yes, provided a scheduling workflow and the required availability/project data are connected.'],
      ['Can AI send site-visit reminders?', 'Yes. Reminder sequences can be configured for upcoming appointments, along with confirmation and rescheduling paths.'],
      ['Can AI reschedule a property site visit?', 'A rescheduling workflow can be built when the appointment source and salesperson or site availability rules are connected.'],
      ['Can AI collect feedback after a site visit?', 'Yes. A post-visit feedback step can be added to the workflow and the result can be stored or routed to the CRM.'],
    ],
  },
  {
    title: 'CRM and sales automation',
    questions: [
      ['Which CRM can QuickKit AI connect to?', 'The backend includes a configured Odoo CRM synchronization path. Other CRM providers are treated as project-specific API or webhook integrations unless a live connector is demonstrated.'],
      ['Can AI create and update real-estate leads in a CRM?', 'Yes, where the selected CRM integration is configured. Lead creation, field mapping, stage updates and activity logging should be verified during implementation.'],
      ['Can AI automatically assign leads to salespeople?', 'Yes. Assignment rules can be included based on project, geography, team, language, round-robin or other business logic.'],
      ['Can AI log WhatsApp and phone activity in the CRM?', 'It can be designed to do so when the messaging/telephony provider exposes the required events and the CRM integration is configured.'],
      ['Can AI automate a real-estate sales pipeline?', 'Yes. Typical stages can connect lead intake, qualification, follow-up, appointment, site visit, feedback and handoff. Exact stages should reflect the client\'s sales process.'],
    ],
  },
  {
    title: 'Portals, ads and lead sources',
    questions: [
      ['Can QuickKit AI connect Facebook and Instagram leads for real estate?', 'Meta Ads capabilities are present in the internal integration catalog, but a live real-estate production connection is not publicly demonstrated. Treat it as a custom integration until tested for the client account.'],
      ['Can QuickKit AI connect Google Ads leads?', 'Google Ads or lead-form integration can be treated as custom project work and should be verified against the client\'s account and desired lead source.'],
      ['Does QuickKit AI automatically pull leads from 99acres?', 'A verified live 99acres connector is not publicly demonstrated. Any portal integration should be treated as custom or conditional until tested for the client account.'],
      ['Does QuickKit AI integrate Magicbricks leads?', 'A verified live Magicbricks connector is not publicly demonstrated. Treat this as custom or conditional until a working account-level integration is tested.'],
      ['Does QuickKit AI integrate Housing.com leads?', 'A verified live Housing.com connector is not publicly demonstrated. Treat this as custom or conditional until a working account-level integration is tested.'],
      ['Can website property enquiries enter the AI workflow?', 'Yes. Website and landing-page lead intake is part of the published and implemented workflow foundation, with lead persistence and configured CRM synchronization available in the backend.'],
    ],
  },
  {
    title: 'Pricing, managed AI and choosing a provider',
    questions: [
      ['How much does a managed AI agent cost in India?', 'QuickKit AI currently publishes KVM 4 at ₹19,999 one-time setup and KVM 8 at ₹39,999 one-time setup. The first month of managed operation is included; from month 2 maintenance is ₹15,000/month for KVM 4 or ₹30,000/month for KVM 8. AI and third-party usage is separate.'],
      ['What is the cost of real-estate AI automation in India?', 'The cost depends on channels, workflow complexity and third-party providers. QuickKit AI publishes KVM setup and maintenance pricing, while AI/API and provider usage are separate.'],
      ['What does managed AI mean?', 'Managed AI means the provider can build, deploy, operate and maintain the AI agents and connected workflows rather than only handing over software access.'],
      ['Is QuickKit AI a SaaS product or a custom AI agency?', 'QuickKit AI positions itself as a managed AI automation service combining custom agents, workflows, APIs, CRM, messaging and voice integrations rather than only a self-service SaaS subscription.'],
      ['Does QuickKit AI guarantee Google rankings or AI-search rankings?', 'No. Search rankings and AI-search visibility should not be guaranteed. The practical goal is to make the site highly relevant, crawlable, useful and well-supported by evidence and authority.'],
      ['Who owns the AI agents, workflows and data after the project?', 'QuickKit AI does not currently publish a blanket ownership and export policy for every integration. Ownership, credentials, data export, workflow configuration and post-contract maintenance rights should be stated in the proposal or statement of work.'],
    ],
  },
];

const allQuestions = questionGroups.flatMap(group => group.questions);

export const RealEstateAIQuestions: React.FC = () => (
  <div className="min-h-screen bg-[#030712] text-slate-100">
    <Helmet>
      <title>Real Estate AI Agent Questions & Answers India | QuickKit AI</title>
      <meta name="description" content="Natural-language answers about real estate AI agents, lead qualification, WhatsApp automation, AI calling, site visits, CRM workflows, pricing and managed AI services in India." />
      <meta name="keywords" content="who builds AI agents for real estate in India, real estate AI agency India, real estate AI automation company, AI sales agent property developer, real estate WhatsApp AI, AI calling real estate India, property lead qualification AI, site visit automation, real estate CRM automation, managed AI agents India" />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <link rel="canonical" href="https://quickkitai.com/real-estate-ai-questions" />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: allQuestions.map(([name, text]) => ({
          '@type': 'Question',
          name,
          acceptedAnswer: { '@type': 'Answer', text },
        })),
      })}</script>
    </Helmet>

    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-400">QuickKit AI · India</p>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Real Estate AI Agents: Questions Buyers Actually Ask</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A practical answer hub for builders, property developers, brokerages and sales teams comparing AI agents, automation agencies, WhatsApp workflows, AI calling, site-visit automation and CRM integration in India.</p>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">
        <h2 className="text-2xl font-black">What QuickKit AI is</h2>
        <p className="mt-3 max-w-4xl leading-7 text-slate-300">QuickKit AI is positioned as a managed AI automation service for Indian real-estate teams. The target workflow is property lead intake → qualification → WhatsApp follow-up → AI calling → site visit → CRM → sales handoff. Channel integrations are configured per client, so individual capabilities should be verified during a pilot rather than assumed.</p>
      </div>

      <div className="space-y-12">
        {questionGroups.map(group => (
          <section key={group.title}>
            <h2 className="mb-5 text-2xl font-black md:text-3xl">{group.title}</h2>
            <div className="space-y-3">
              {group.questions.map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <summary className="cursor-pointer list-none pr-8 text-base font-bold text-white marker:hidden md:text-lg">{question}</summary>
                  <p className="mt-4 max-w-4xl leading-7 text-slate-300">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-7">
        <h2 className="text-2xl font-black">How to evaluate an AI agency for real estate</h2>
        <p className="mt-3 max-w-4xl leading-7 text-slate-300">Ask for a working demo, exact channel integrations, CRM field mapping, human-handoff rules, monitoring, third-party usage costs, ownership and export terms, and a clear list of what is verified versus custom. Do not select a provider solely because it claims to be “the best” or “cheapest”.</p>
        <a href="/services/real-estate" className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-black text-slate-950">Explore Real Estate AI Automation</a>
      </section>
    </main>
  </div>
);
