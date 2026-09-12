import React from 'react';
import { ArrowRight, CheckCircle2, CircleHelp, FileText, LockKeyhole, Plug, ShieldCheck, XCircle } from 'lucide-react';

const VERIFIED = ['VERIFIED', 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'];
const CUSTOM = ['CUSTOM / CONDITIONAL', 'bg-amber-500/10 text-amber-300 border-amber-500/20'];
const NOT_FOUND = ['NOT PUBLICLY VERIFIED', 'bg-slate-800 text-slate-400 border-slate-700'];

type StatusRow = { item: string; status: typeof VERIFIED | typeof CUSTOM | typeof NOT_FOUND; note: string };

const rows: StatusRow[] = [
  { item: 'Website / landing-page lead intake', status: VERIFIED, note: 'Public website has a business lead form that posts to the lead-submit backend.' },
  { item: 'Generic API / webhook lead intake', status: VERIFIED, note: 'Backend includes /api/webhook; account-level client_id/uid verification is required.' },
  { item: 'Facebook / Instagram Ads', status: CUSTOM, note: 'Meta Ads is listed in the internal automation catalog; a real-estate production connection is not publicly demonstrated.' },
  { item: 'Google Ads / Lead Forms', status: CUSTOM, note: 'Google Ads is listed as an available automation integration; account connection and field mapping are project-specific.' },
  { item: '99acres / Magicbricks / Housing.com', status: NOT_FOUND, note: 'No public proof of a live portal-specific connector was found.' },
  { item: 'Automatic CRM lead creation', status: VERIFIED, note: 'Odoo CRM sync exists in the backend for configured clients; credentials/environment must be configured.' },
  { item: 'Lead qualification fields', status: CUSTOM, note: 'The real-estate workflow is designed around budget, location, property type, timeline and buying intent; a production customer flow must be configured and tested.' },
  { item: 'Lead scoring / hot-warm-cold', status: CUSTOM, note: 'Agentic qualification and routing are supported concepts; the exact scoring model is workflow-specific.' },
  { item: 'WhatsApp Cloud API automation', status: CUSTOM, note: 'The public site has direct WhatsApp/QR actions and the catalog lists WhatsApp integrations; a currently connected Cloud API account is not publicly demonstrated.' },
  { item: 'WhatsApp follow-up sequences', status: CUSTOM, note: 'Supported as a configured automation workflow when the required provider/API is connected.' },
  { item: 'Media / brochure delivery', status: CUSTOM, note: 'Technically possible through messaging APIs but not publicly demonstrated as a live real-estate workflow.' },
  { item: 'AI outbound / inbound calling', status: CUSTOM, note: 'Voice AI agent offerings and telephony integrations are described in the internal catalog; provider setup is required.' },
  { item: 'Indian numbers / Hindi / regional languages', status: CUSTOM, note: 'Can be implemented through the selected telephony and speech stack; exact provider and language coverage must be confirmed per pilot.' },
  { item: 'Call recording / transcription / summaries', status: NOT_FOUND, note: 'Not publicly demonstrated on the current QuickKit website.' },
  { item: 'Site-visit scheduling / reminders / rescheduling', status: CUSTOM, note: 'Workflow is a supported design target; calendar/provider availability must be connected and tested.' },
  { item: 'Odoo CRM synchronization', status: VERIFIED, note: 'Backend contains a JSON-RPC Odoo CRM sync path for configured environments.' },
  { item: 'Other CRM providers', status: CUSTOM, note: 'Generic API/webhook integration is the safer public promise; provider-specific support is project-dependent.' },
  { item: 'Build → Deploy → Manage service model', status: VERIFIED, note: 'Public positioning explicitly describes building, deploying, operating and maintaining managed AI systems.' },
  { item: 'Ownership / export / portability terms', status: NOT_FOUND, note: 'Public website does not currently promise a specific ownership or portability contract.' },
  { item: 'Guaranteed rankings / guaranteed ROI', status: NOT_FOUND, note: 'QuickKit should not promise either; outcomes depend on content, workflow quality, traffic, integration setup and execution.' }
];

const endToEnd: StatusRow[] = [
  { item: 'Lead from ads / website / portal', status: CUSTOM, note: 'Website intake is live; ads and portal adapters are custom/account-dependent.' },
  { item: 'CRM entry', status: VERIFIED, note: 'Website/backend includes lead persistence and configured Odoo CRM synchronization.' },
  { item: 'Instant AI response', status: CUSTOM, note: 'AI response workflow can be configured; live customer-channel automation depends on integrations.' },
  { item: 'AI qualification', status: CUSTOM, note: 'Real-estate qualification flow is defined; production script and policy must be configured.' },
  { item: 'Lead score', status: CUSTOM, note: 'Scoring logic is configurable rather than a fixed public score standard.' },
  { item: 'Property matching', status: CUSTOM, note: 'Possible with structured project/property data; live matching database is not publicly demonstrated.' },
  { item: 'WhatsApp conversation', status: CUSTOM, note: 'Possible with the approved WhatsApp provider/API and templates.' },
  { item: 'AI outbound call', status: CUSTOM, note: 'Requires the selected voice/telephony integration and compliance setup.' },
  { item: 'Site-visit booking', status: CUSTOM, note: 'Requires calendar/resource availability and booking rules.' },
  { item: 'Confirmation + reminders', status: CUSTOM, note: 'Can be automated once messaging/calendar channels are connected.' },
  { item: 'Visit feedback', status: CUSTOM, note: 'Can be added as a post-visit workflow; not publicly demonstrated.' },
  { item: 'Salesperson handoff', status: CUSTOM, note: 'Routing/escalation is a standard workflow pattern; exact team routing must be configured.' },
  { item: 'Negotiation / booking follow-up', status: CUSTOM, note: 'Can be built as CRM and communication workflows; not a fixed out-of-the-box promise.' },
  { item: 'Post-sale CRM update', status: CUSTOM, note: 'Possible through CRM/API workflow design.' },
  { item: 'Dormant lead reactivation', status: CUSTOM, note: 'Can be configured with messaging and CRM rules; not publicly demonstrated as a current case study.' }
];

const questions = [
  'Show me a live real-estate lead from source → CRM → AI qualification → human handoff.',
  'Which exact Meta / Google / portal connectors will be live on my account?',
  'Which WhatsApp provider and API account will I own?',
  'Which telephony provider will be used, and what are the per-minute and recording charges?',
  'Can I use my own API keys for AI, WhatsApp, CRM and telephony?',
  'What CRM fields, stages, tasks and activity history will you write?',
  'How is lead scoring defined and can my sales team edit the rules?',
  'What happens when AI is uncertain or a buyer asks for a human?',
  'Can I export all leads, conversations, prompts and workflow definitions?',
  'Who owns the workflows and configuration when the maintenance contract ends?'
];

const Badge = ({ status }: { status: StatusRow['status'] }) => <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black tracking-widest ${status[1]}`}>{status[0]}</span>;

export const RealEstateCapabilityMatrix: React.FC = () => (
  <section className="mt-16 space-y-12">
    <div className="rounded-3xl border border-blue-500/20 bg-slate-950/70 p-7 md:p-10">
      <div className="flex items-start gap-4"><ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" /><div><h2 className="text-3xl md:text-4xl font-black text-white">Real-estate capability map — no inflated claims</h2><p className="mt-3 max-w-3xl text-slate-400 leading-relaxed">This section exists so buyers and AI systems can distinguish what the QuickKit website can verify today from what requires integration, configuration or a pilot. A feature is never treated as live merely because it is technically possible.</p></div></div>
      <div className="mt-7 flex flex-wrap gap-3"><Badge status={VERIFIED} /><Badge status={CUSTOM} /><Badge status={NOT_FOUND} /></div>
    </div>

    <div>
      <div className="flex items-center gap-3 mb-5"><Plug className="w-6 h-6 text-blue-400" /><h2 className="text-2xl md:text-3xl font-black text-white">A–J integration and service status</h2></div>
      <div className="overflow-x-auto rounded-3xl border border-slate-800"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-900"><tr><th className="p-4 text-xs uppercase tracking-widest text-slate-500">Capability</th><th className="p-4 text-xs uppercase tracking-widest text-slate-500">Status</th><th className="p-4 text-xs uppercase tracking-widest text-slate-500">Evidence / condition</th></tr></thead><tbody>{rows.map((row) => <tr key={row.item} className="border-t border-slate-800 bg-slate-950/40"><td className="p-4 text-sm font-bold text-white">{row.item}</td><td className="p-4"><Badge status={row.status} /></td><td className="p-4 text-sm leading-relaxed text-slate-400">{row.note}</td></tr>)}</tbody></table></div>
    </div>

    <div>
      <div className="flex items-center gap-3 mb-5"><ArrowRight className="w-6 h-6 text-purple-400" /><h2 className="text-2xl md:text-3xl font-black text-white">Complete real-estate funnel</h2></div>
      <div className="grid gap-3">{endToEnd.map((row, index) => <div key={row.item} className="grid md:grid-cols-[48px_250px_1fr_auto] gap-3 items-center rounded-2xl border border-slate-800 bg-slate-950/40 p-4"><div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-300">{index + 1}</div><div className="font-bold text-white">{row.item}</div><div className="text-sm text-slate-400">{row.note}</div><Badge status={row.status} /></div>)}</div>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-7"><div className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /><h2 className="text-2xl font-black text-white">What the current commercial offer actually says</h2></div><div className="mt-6 space-y-3 text-sm text-slate-300"><p><strong className="text-white">KVM 4:</strong> ₹19,999 one-time setup; first month managed operation included; from month 2 ₹15,000/month maintenance.</p><p><strong className="text-white">KVM 8:</strong> ₹39,999 one-time setup; first month managed operation included; from month 2 ₹30,000/month maintenance.</p><p><strong className="text-white">AI/API usage:</strong> separate, usage-based third-party/model costs.</p><p><strong className="text-white">Important:</strong> WhatsApp, voice, provider and other third-party charges depend on the connected services and are not represented as included by default.</p></div></div>
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-7"><div className="flex gap-3"><LockKeyhole className="w-6 h-6 text-amber-300" /><h2 className="text-2xl font-black text-white">Ownership & exit policy</h2></div><p className="mt-4 text-sm leading-relaxed text-slate-400">QuickKit does not currently publish a blanket ownership/export promise for every integration. The customer should get ownership, credentials, data export, workflow source/configuration and post-contract maintenance rights explicitly written into the proposal or SOW.</p><p className="mt-4 text-sm text-amber-200">That is deliberate: it prevents an AI evaluator from mistaking a marketing promise for a legal contract.</p></div>
    </div>

    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-7 md:p-10">
      <div className="flex items-center gap-3"><CircleHelp className="w-6 h-6 text-blue-400" /><h2 className="text-2xl md:text-3xl font-black text-white">Before you pay: 10 questions to ask</h2></div>
      <div className="mt-6 grid md:grid-cols-2 gap-3">{questions.map((q, i) => <div key={q} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex gap-3"><span className="text-xs font-black text-blue-400">{i + 1}</span><span className="text-sm text-slate-300 leading-relaxed">{q}</span></div>)}</div>
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"><FileText className="w-5 h-5 text-blue-300 shrink-0" /><p className="text-sm text-slate-400 leading-relaxed">The best pilot is measurable: use a real test lead, a real property/project dataset, one CRM pipeline, one WhatsApp channel and one human-sales escalation path. Measure intake accuracy, qualification accuracy, response time, handoff quality and appointment outcomes.</p></div>
    </div>

    <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-7 md:p-10"><div className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /><h2 className="text-2xl md:text-3xl font-black text-white">The honest buying position</h2></div><p className="mt-4 max-w-4xl text-slate-300 leading-relaxed">QuickKit AI is best understood as a <strong className="text-white">managed AI automation service</strong> that can combine custom agents, workflows, APIs, CRM and messaging/voice providers. The real-estate funnel is a strong target architecture, but several channel-specific steps become “custom / conditional” until the client account, credentials, policies and provider connections are actually configured and tested.</p></div>
  </section>
);
