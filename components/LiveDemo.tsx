import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, ShieldCheck, Play, ArrowRight, MessageCircle, Database, CalendarCheck2, UserRoundCheck } from 'lucide-react';

const steps = [
  { icon: MessageCircle, title: 'Inbound enquiry', text: 'A buyer asks about a 3 BHK property and shares a preferred location.' },
  { icon: UserRoundCheck, title: 'Qualification', text: 'The workflow captures budget, intent and timeline before handoff.' },
  { icon: Database, title: 'CRM handoff', text: 'The lead stage and conversation summary are prepared for the sales team.' },
  { icon: CalendarCheck2, title: 'Visit workflow', text: 'The system proposes a slot and keeps human approval in the loop.' },
];

export const LiveDemo: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const runDemo = () => {
    setRunning(true);
    setCompleted(false);
    window.setTimeout(() => { setRunning(false); setCompleted(true); }, 900);
  };

  return <div className="min-h-screen bg-[#050608] px-5 py-10 text-slate-100 md:px-8">
    <Helmet>
      <title>Live AI Workflow Demonstration | Raja AI Systems</title>
      <meta name="description" content="A transparent, controlled demonstration of Raja AI Systems lead qualification, CRM handoff and site-visit workflow. Capability demonstration, not client performance results." />
      <meta name="keywords" content="live AI workflow demo, real estate AI demonstration, WhatsApp lead qualification demo, Raja AI Systems" />
      <link rel="canonical" href="https://quickkitai.com/live-demo" />
    </Helmet>

    <main className="mx-auto max-w-6xl">
      <div className="mb-8 rounded-2xl border border-emerald-300/30 bg-emerald-300/[.08] p-5 shadow-2xl shadow-emerald-950/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Transparent demonstration</p>
            <h1 className="mt-2 text-2xl font-black md:text-4xl">Live AI Workflow Demonstration</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">This page shows the workflow and the evidence a live acceptance test must produce. It does not claim client leads, bookings, revenue or production results.</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[.04] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-200">Controlled test scenario</p>
              <h2 className="mt-2 text-2xl font-black">Property enquiry to sales handoff</h2>
            </div>
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-bold text-sky-200">STAGING SCENARIO</span>
          </div>
          <div className="mt-7 space-y-4">
            {steps.map(({ icon: Icon, title, text }, index) => <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200"><Icon className="h-5 w-5" /></div>
              <div><p className="font-black">{index + 1}. {title}</p><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div>
            </div>)}
          </div>
          <button onClick={runDemo} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-black text-slate-950 transition hover:bg-amber-200" type="button">
            <Play className="h-4 w-4" /> {running ? 'Running controlled preview…' : 'Run workflow preview'}
          </button>
          {completed && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Preview completed. External delivery still requires a verified live acceptance test.</p>}
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8">
          <p className="text-sm font-bold text-slate-400">What a verified live test records</p>
          <div className="mt-5 space-y-3">
            {['Real inbound message ID', 'Observed agent response', 'CRM state transition', 'Approval or human handoff', 'Outbound gate decision', 'External delivery/read-back'].map(item => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{item}</div>)}
          </div>
          <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm leading-6 text-amber-100/90">
            <strong className="text-amber-200">Client-safe wording:</strong> “This is a live capability demonstration. Client performance metrics are measured only after a controlled pilot using the client’s approved systems and data.”
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[.03] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-amber-200">Next step</p><h2 className="mt-1 text-2xl font-black">Move from preview to observed acceptance</h2></div><ArrowRight className="h-6 w-6 text-amber-200" /></div>
        <p className="mt-3 max-w-3xl leading-7 text-slate-400">The preview explains the product. The acceptance recording proves the real path: authorized test phone → bridge → agent → CRM state → safety gate → phone read-back.</p>
      </section>
    </main>
  </div>;
};
