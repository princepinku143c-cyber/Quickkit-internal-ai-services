import React from 'react';
import { BarChart3, CheckCircle2, FileCheck2, ShieldCheck, Workflow } from 'lucide-react';

export const Testimonials: React.FC = () => (
  <section className="py-28 bg-[#030712] relative overflow-hidden">
    <div className="absolute right-0 top-0 w-[760px] h-[520px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-emerald-300"><ShieldCheck className="w-3 h-3" /> Proof over hype</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">We will not invent social proof.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">There are no fabricated client names, ratings, screenshots or percentage claims here. Verified case studies can be added as real evidence becomes available.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {[
          [FileCheck2,'Evidence-backed delivery','Use a real test lead, a real property/project dataset and the agreed production-like workflow during the pilot.'],
          [Workflow,'Measurable workflow checks','Validate intake, qualification, response, handoff, scheduling and CRM updates instead of relying on a “looks good” demo.'],
          [BarChart3,'Outcomes stay contextual','Savings, conversion, response quality and revenue impact depend on the actual workflow, traffic, team process and provider configuration.'],
        ].map(([Icon,title,body])=><div key={String(title)} className="rounded-[1.6rem] border border-slate-800 bg-slate-950/65 p-7 md:p-8"><div className="w-11 h-11 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center justify-center">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300'})}</div><h3 className="mt-5 text-lg font-black text-white">{String(title)}</h3><p className="mt-3 text-sm leading-relaxed text-slate-400">{String(body)}</p></div>)}
      </div>

      <div className="mt-8 rounded-[1.6rem] border border-emerald-400/15 bg-emerald-400/5 p-6 flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0" /><p className="text-sm leading-relaxed text-slate-300"><strong className="text-white">Commercial promise:</strong> we show what is verified, what is configurable, and what still needs a client account or pilot connection.</p></div>
    </div>
  </section>
);