import React from 'react';
import { ArrowRight, Bot, CheckCircle2, Clock3, Network, Server, ShieldCheck, Target, Wrench } from 'lucide-react';

export const WhyQuickKit: React.FC = () => {
  const reasons = [
    [Target,'Business-first design','We start with the work your people actually do, then map the agents, rules and connected systems around it.','blue'],
    [Bot,'AI teammates, not one giant bot','Separate responsibilities make qualification, follow-up, calling, scheduling and operations easier to control.','purple'],
    [Network,'Connected workflows','The value comes from the handoffs between forms, CRM, messaging, calendar, APIs and human sales — not isolated chat.','cyan'],
    [ShieldCheck,'Verification before “live”','Implementation and completion are different. The configured workflow is tested in the target environment before it is treated as production-ready.','emerald'],
    [Clock3,'Built for 24/7 operation','Once configured, approved repeatable workflows can continue outside normal working hours while exceptions can escalate to people.','amber'],
    [Server,'Managed infrastructure','Setup, monitoring and maintenance are part of the managed-system model so your team does not have to own every infrastructure task.','pink'],
  ] as const;

  const colorMap: Record<string,string> = {
    blue:'bg-blue-500/10 text-blue-300 border-blue-500/20',
    purple:'bg-purple-500/10 text-purple-300 border-purple-500/20',
    cyan:'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    emerald:'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber:'bg-amber-500/10 text-amber-300 border-amber-500/20',
    pink:'bg-pink-500/10 text-pink-300 border-pink-500/20'
  };

  return (
    <section className="py-28 bg-[#050912] border-y border-white/6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(129,140,248,.08),transparent_40%)] pointer-events-none" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.22em] text-purple-300"><Wrench className="w-3 h-3" /> Managed, end to end</div>
          <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Build it. Connect it. Verify it. Manage it.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">QuickKit is positioned as a managed AI systems service. You bring the business goal; the system is scoped, configured, connected and maintained around the approved workflow.</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reasons.map(([Icon,title,desc,color]) => (
            <div key={title} className="group rounded-[1.6rem] border border-slate-800 bg-slate-950/60 p-7 hover:border-blue-500/20 hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>{React.createElement(Icon as React.ElementType,{className:'w-5 h-5'})}</div>
              <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-[1fr_auto] gap-6 rounded-[2rem] border border-emerald-400/15 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-transparent p-7 md:p-9 items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Delivery principle</div>
            <h3 className="mt-3 text-2xl md:text-3xl font-black text-white">No “done” based on code alone.</h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-400 max-w-3xl">A workflow is only called complete after the relevant behavior has been exercised and evidence exists for the agreed pilot or production environment.</p>
          </div>
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100 whitespace-nowrap">Plan My System <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
};