import React from 'react';
import { CalendarCheck, Database, Mail, MessageCircle, PhoneCall, Target, Workflow } from 'lucide-react';

export const BusinessImpact: React.FC = () => {
  const cards = [
    [Target,'Lead capture + qualification','Capture enquiries, collect required information, score or route them using the rules defined for the workflow.','text-blue-300'],
    [MessageCircle,'WhatsApp + customer communication','Run approved replies, reminders, follow-up sequences and human escalation when the required provider/API is connected.','text-emerald-300'],
    [PhoneCall,'Voice + callback workflows','Support configured qualification, callback, reminder or routing flows with the selected telephony provider.','text-cyan-300'],
    [CalendarCheck,'Site visits + appointments','Move qualified prospects into booking, confirmation, reminder and rescheduling workflows around the connected calendar.','text-amber-300'],
    [Database,'CRM + pipeline operations','Create or update records, stages, tasks and context in the configured CRM or API-connected system.','text-purple-300'],
    [Mail,'Reactivation + operations','Trigger defined follow-up, email, internal alerts, reporting and dormant-lead workflows based on your business rules.','text-pink-300'],
  ];

  return (
    <section className="py-28 bg-[#050912] relative overflow-hidden border-t border-white/6">
      <div className="absolute right-[-180px] top-[-180px] w-[520px] h-[520px] rounded-full bg-blue-500/6 blur-[130px] pointer-events-none" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-blue-300"><Workflow className="w-3 h-3" /> Business impact</div>
          <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Turn repetitive work into a connected operating layer.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">The value is operational: faster handling, clearer qualification, cleaner handoffs and less manual coordination. We do not promise arbitrary percentages or guaranteed revenue.</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {cards.map(([Icon,title,desc,color])=><div key={String(title)} className="rounded-[1.6rem] border border-slate-800 bg-slate-950/65 p-7 hover:border-blue-500/20 hover:-translate-y-1 transition-all"><div className={`w-12 h-12 rounded-xl bg-white/[.03] border border-white/7 flex items-center justify-center ${color}`}>{React.createElement(Icon as React.ElementType,{className:'w-6 h-6'})}</div><h3 className={`mt-5 text-lg font-black ${color}`}>{String(title)}</h3><p className="mt-3 text-sm leading-relaxed text-slate-400">{String(desc)}</p></div>)}
        </div>

        <div className="mt-10 max-w-6xl mx-auto rounded-[2rem] border border-blue-400/15 bg-gradient-to-r from-blue-500/6 via-slate-950/80 to-emerald-500/5 p-7 md:p-9">
          <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-blue-300"><Workflow className="w-4 h-4" /> Revenue workflow pattern</div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-2">
            {['Enquiry','Qualification','Follow-up','Appointment','CRM','Human close'].map((x,i)=><React.Fragment key={x}><div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-center"><div className="text-[9px] font-mono text-slate-600">0{i+1}</div><div className="mt-1 text-xs font-black text-white">{x}</div></div>{i<5&&<div className="hidden md:flex items-center justify-center text-slate-700">→</div>}</React.Fragment>)}
          </div>
        </div>
      </div>
    </section>
  );
};