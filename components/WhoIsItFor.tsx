import React from 'react';
import { Building2, HeartPulse, GraduationCap, ShoppingBag, Home, BriefcaseBusiness, ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  { icon: Home, color:'blue', title:'Real Estate', desc:'Capture property leads, qualify buyers, automate follow-ups, schedule site visits and keep CRM records updated.' },
  { icon: HeartPulse, color:'emerald', title:'Clinics & Healthcare', desc:'Handle enquiries, appointment workflows, reminders and routine patient communication with human escalation where needed.' },
  { icon: GraduationCap, color:'purple', title:'Education & Coaching', desc:'Automate enquiries, lead nurturing, scheduling, reminders, admissions workflows and learner communication.' },
  { icon: ShoppingBag, color:'cyan', title:'E-commerce', desc:'Automate customer questions, order updates, abandoned-cart workflows, support and review requests.' },
  { icon: Building2, color:'amber', title:'Agencies & Professional Services', desc:'Automate lead intake, client onboarding, reporting, follow-ups, CRM updates and recurring operations.' },
  { icon: BriefcaseBusiness, color:'pink', title:'Local & Growing Businesses', desc:'Turn repetitive enquiries, booking, messaging, follow-ups and reporting into managed AI workflows.' },
];
const colors: Record<string,string> = { blue:'bg-blue-500/10 text-blue-400 border-blue-500/20', emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', purple:'bg-purple-500/10 text-purple-400 border-purple-500/20', cyan:'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', amber:'bg-amber-500/10 text-amber-400 border-amber-500/20', pink:'bg-pink-500/10 text-pink-400 border-pink-500/20' };

interface Props { onBookDemo: () => void; }
export const WhoIsItFor: React.FC<Props> = ({ onBookDemo }) => (
  <section id="industries" className="py-24 bg-nexus-dark border-t border-slate-900 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/5 blur-[100px] pointer-events-none" />
    <div className="container mx-auto px-6 max-w-6xl relative z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-6 uppercase tracking-[0.2em] font-black">Industries</div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">AI Systems Built Around Your Industry</h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto">QuickKitAI adapts the agent workflow, integrations and memory to how your business actually operates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
        {INDUSTRIES.map((item) => { const Icon=item.icon; return (
          <div key={item.title} className="p-7 bg-slate-950/50 border border-slate-800 hover:border-slate-600 rounded-2xl transition-all hover:shadow-lg">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colors[item.color]}`}><Icon className="w-6 h-6"/></div>
            <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        );})}
      </div>
      <div className="text-center">
        <button onClick={onBookDemo} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all hover:-translate-y-0.5">Discuss Your Business Workflow <ArrowRight className="w-4 h-4"/></button>
        <p className="text-slate-600 text-xs mt-4 uppercase tracking-widest font-bold">Custom workflow design · Managed deployment</p>
      </div>
    </div>
  </section>
);
