import React from 'react';
import { Building2, Home, BriefcaseBusiness, ArrowRight, UsersRound, Landmark } from 'lucide-react';

const TEAMS = [
  { icon: Landmark, color:'blue', title:'Property Developers', desc:'Capture project enquiries, qualify buyers, nurture every opportunity and keep sales teams focused on high-intent prospects.' },
  { icon:Building2, color:'purple', title:'Builders & Project Sales Teams', desc:'Connect lead intake, WhatsApp, AI calling, site visits and CRM updates into one managed sales workflow.' },
  { icon:UsersRound, color:'emerald', title:'Brokerages & Channel Partners', desc:'Give every enquiry a fast first response, consistent qualification and structured handoff without adding headcount.' },
  { icon:Home, color:'cyan', title:'Real Estate Operators', desc:'Replace fragmented follow-up with an AI workforce that works across your daily tools and processes.' },
];
const colors: Record<string,string> = { blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20', emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', cyan:'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };

interface Props { onBookDemo: () => void; }
export const WhoIsItFor: React.FC<Props> = ({ onBookDemo }) => (
  <section id="industries" className="py-28 bg-nexus-dark border-t border-slate-900 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-blue-600/5 blur-[120px] pointer-events-none" />
    <div className="container mx-auto px-6 max-w-6xl relative z-10">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-6 uppercase tracking-[0.2em] font-black"><UsersRound className="w-3 h-3"/> Built for Real Estate Teams</div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-5">AI Teammates Built Around Your Sales Team</h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">QuickKit adapts the workflow, integrations and business context to how your property operation actually sells.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        {TEAMS.map((item) => { const Icon=item.icon; return (
          <div key={item.title} className="group p-7 md:p-8 bg-slate-950/50 border border-slate-800 hover:border-blue-500/25 rounded-[1.5rem] transition-all hover:-translate-y-1 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
            <div className="flex items-start gap-5"><div className={`shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${colors[item.color]}`}><Icon className="w-6 h-6"/></div><div><h3 className="text-xl font-black text-white mb-2">{item.title}</h3><p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p></div></div>
          </div>
        );})}
      </div>
      <div className="text-center">
        <button onClick={onBookDemo} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-[0_16px_50px_rgba(255,255,255,0.08)]">Build Your AI Workforce <ArrowRight className="w-4 h-4"/></button>
        <p className="text-slate-600 text-xs mt-4 uppercase tracking-widest font-bold">Custom workflow design · Managed deployment · Human handoff</p>
      </div>
    </div>
  </section>
);
