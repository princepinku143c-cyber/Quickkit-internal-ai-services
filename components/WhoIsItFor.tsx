import React from 'react';
import { ArrowRight, Building2, HeartPulse, Home, Landmark, Plane, UsersRound } from 'lucide-react';

interface Props { onBookDemo: () => void; }

const FIT = [
  [Landmark,'Property Developers','Project enquiries, buyer qualification, follow-up, site visits and sales-team handoff.', 'blue'],
  [Building2,'Builders & Brokerages','Connect lead intake, messaging, voice, scheduling and CRM operations into one managed workflow.', 'purple'],
  [HeartPulse,'Premium Healthcare Teams','Coordinate enquiry intake, qualification, reminders, appointment routing and patient-facing operations where appropriate.', 'emerald'],
  [Plane,'Travel & Service Businesses','Automate repetitive enquiry handling, follow-up, scheduling and operations around your existing tools.', 'cyan'],
] as const;

const colors: Record<string,string> = {
  blue:'bg-blue-500/10 text-blue-300 border-blue-500/20',
  purple:'bg-purple-500/10 text-purple-300 border-purple-500/20',
  emerald:'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  cyan:'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
};

export const WhoIsItFor: React.FC<Props> = ({ onBookDemo }) => (
  <section id="industries" className="py-28 bg-[#030712] border-t border-white/6 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/6 blur-[140px] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-15">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.22em] text-blue-300"><UsersRound className="w-3 h-3" /> Best-fit teams</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Automation should fit the business.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">Real estate is the primary public use case. The same managed-agent architecture can be adapted to other high-response businesses through a defined scope and pilot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-6xl mx-auto">
        {FIT.map(([Icon,title,desc,color]) => (
          <div key={title} className="rounded-[1.6rem] border border-slate-800 bg-slate-950/60 p-7 md:p-8 hover:border-blue-500/25 hover:-translate-y-1 transition-all">
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-xl border shrink-0 flex items-center justify-center ${colors[color]}`}>{React.createElement(Icon as React.ElementType,{className:'w-6 h-6'})}</div>
              <div><h3 className="text-xl font-black text-white">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[2rem] border border-white/8 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 p-7 md:p-9 text-center">
        <p className="text-[10px] font-mono font-black uppercase tracking-[.24em] text-slate-500">Common build pattern</p>
        <p className="mt-3 text-lg md:text-xl font-black text-white">Lead source → qualification → conversation → appointment → CRM → human handoff</p>
        <button onClick={onBookDemo} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100">Build Your Workflow <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  </section>
);