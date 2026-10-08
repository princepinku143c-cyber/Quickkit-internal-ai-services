import React from 'react';
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, Database, MessageCircle, ShieldCheck, Target, UserRound, Workflow, Zap } from 'lucide-react';

const steps = [
  { n:'01', icon:Target, title:'Capture', body:'Bring new enquiries from your website, campaigns, forms or approved lead sources into the workflow.', tag:'Speed-to-lead' },
  { n:'02', icon:Bot, title:'Qualify', body:'Collect the business rules you approve — budget, location, property type, intent, timeline and other required fields.', tag:'AI qualification' },
  { n:'03', icon:MessageCircle, title:'Engage', body:'Continue the conversation across the connected messaging or voice channel, with human escalation when needed.', tag:'Follow-up' },
  { n:'04', icon:CalendarCheck, title:'Schedule', body:'Move qualified prospects toward appointments, site visits or other next steps using the connected calendar and workflow rules.', tag:'Appointments' },
  { n:'05', icon:Database, title:'Sync + Handoff', body:'Keep the CRM and internal team aligned, route high-intent cases and preserve useful context for the human sales team.', tag:'CRM + sales' },
];

export const SystemWorkflow: React.FC = () => (
  <section id="workflow" className="py-28 bg-[#050912] border-y border-slate-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.10),transparent_45%)] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.22em] text-blue-300">
          <Workflow className="w-3 h-3" /> How the workforce operates
        </div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">From new lead to next action — one connected system.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">QuickKit is designed around the workflow, not around a single chatbot. Each step can have its own rules, tools, memory, escalation path and verification checkpoint.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.n} className="relative rounded-[1.6rem] border border-white/8 bg-slate-950/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,.18)]">
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-blue-400/40 z-20" />}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-600">{step.n}</span>
                <div className="w-10 h-10 rounded-xl border border-blue-400/15 bg-blue-400/5 flex items-center justify-center"><Icon className="w-5 h-5 text-blue-300" /></div>
              </div>
              <h3 className="text-lg font-black text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.body}</p>
              <div className="mt-5 inline-flex rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">{step.tag}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {[
          [ShieldCheck, 'Policy & guardrails', 'Approved actions, escalation rules and safe boundaries.'],
          [Zap, 'Execution layer', 'Tools, APIs and workflows carry out the approved work.'],
          [CheckCircle2, 'Verification gate', 'Test the actual result before calling a workflow live.'],
          [UserRound, 'Human handoff', 'Uncertain, sensitive or high-value cases can move to a person.'],
        ].map(([Icon, title, body]) => (
          <div key={String(title)} className="rounded-2xl border border-slate-800 bg-black/15 p-5">
            {React.createElement(Icon as React.ElementType, { className:'w-5 h-5 text-emerald-400 mb-3' })}
            <h4 className="text-sm font-black text-white">{String(title)}</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{String(body)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-6 py-5">
        <div>
          <p className="text-[10px] font-mono font-black uppercase tracking-[.2em] text-amber-300">Verification-first delivery</p>
          <p className="mt-1 text-sm text-slate-300">A workflow is not labelled “live” because code exists. The configured path must be tested in the target environment first.</p>
        </div>
        <a href="#demo" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100">Map My Workflow <ArrowRight className="w-4 h-4" /></a>
      </div>
    </div>
  </section>
);
