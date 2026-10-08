import React from 'react';
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, Database, MessageCircle, Mic2, Target, TrendingUp, UsersRound, Workflow } from 'lucide-react';

interface AIAgentsProps { onSelectAgent: (item: any) => void; }

const AGENTS = [
  { id:'property-lead', icon:Target, color:'blue', title:'Lead Capture Teammate', description:'Owns the first structured step: capture the enquiry, collect context and route it into the approved workflow.', tasks:['Lead intake & routing','Source/context capture','Structured fields','Escalation rules'] },
  { id:'qualification', icon:TrendingUp, color:'purple', title:'Qualification Teammate', description:'Collects approved qualification signals such as budget, location, property type, intent and timeline.', tasks:['Budget & location','Intent & timeline','Qualification logic','Priority routing'] },
  { id:'whatsapp', icon:MessageCircle, color:'emerald', title:'Conversation + Follow-up Teammate', description:'Keeps approved customer communication moving across messaging workflows while preserving context and human handoff.', tasks:['Instant replies','Nurture sequences','Reminders','Human escalation'] },
  { id:'voice', icon:Mic2, color:'cyan', title:'Voice Teammate', description:'Supports configurable voice workflows for qualification, callbacks, reminders or appointment routing when the required provider is connected.', tasks:['Outbound calls','Qualification flows','Callback paths','Escalation to humans'] },
  { id:'site-visit', icon:CalendarCheck, color:'amber', title:'Appointment Teammate', description:'Moves qualified prospects toward bookings and keeps scheduling, confirmations and changes aligned with your rules.', tasks:['Site-visit booking','Calendar workflows','Confirmations','Rescheduling'] },
];

const colors: Record<string,string> = {
  blue:'text-blue-300 bg-blue-500/10 border-blue-500/20',
  purple:'text-purple-300 bg-purple-500/10 border-purple-500/20',
  emerald:'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  cyan:'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  amber:'text-amber-300 bg-amber-500/10 border-amber-500/20'
};

export const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent }) => (
  <section id="ai-agents" className="py-28 bg-[#050912] border-y border-white/6 relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-[420px] bg-indigo-600/6 blur-[120px] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-indigo-300"><UsersRound className="w-3 h-3" /> 5-core AI workforce</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Meet the AI team behind the workflow.</h2>
        <p className="mt-5 text-lg md:text-xl leading-relaxed text-slate-400 max-w-3xl mx-auto">Five core teammates can own the customer journey from first enquiry to appointment. CRM and infrastructure act as the connected operating layer around them.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-14">
        {[['5','Core AI teammates'],['24/7','Designed operation'],['1','Connected workflow']].map(([value,label])=><div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center"><div className="text-2xl font-black text-white">{value}</div><div className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-600">{label}</div></div>)}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {AGENTS.map(agent => { const Icon=agent.icon; return (
          <div key={agent.id} className="group flex flex-col rounded-[1.6rem] border border-slate-800 bg-slate-950/75 p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all">
            <div className="flex items-start justify-between gap-3"><div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colors[agent.color]}`}><Icon className="w-6 h-6" /></div><span className="rounded-full border border-slate-800 bg-black/20 px-2 py-1 text-[8px] font-mono font-black uppercase tracking-widest text-slate-600">Configurable</span></div>
            <h3 className="mt-5 text-lg font-black text-white">{agent.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 flex-1">{agent.description}</p>
            <div className="mt-5 space-y-2">{agent.tasks.map(task=><div key={task} className="flex items-center gap-2 text-[12px] text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />{task}</div>)}</div>
            <button onClick={()=>onSelectAgent({id:agent.id,name:agent.title,outcome:agent.description})} className="mt-6 w-full rounded-xl border border-slate-700 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-2">Design This Teammate <ArrowRight className="w-4 h-4" /></button>
          </div>
        );})}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {[
          [Workflow,'Orchestration layer','Teammates hand work to one another across the approved customer journey.'],
          [Database,'CRM operations layer','Lead records, stages, tasks and context can be synchronized with the configured CRM.'],
          [CheckCircle2,'Verification layer','Actual external actions are tested before the workflow is treated as live.'],
        ].map(([Icon,title,body])=><div key={String(title)} className="rounded-2xl border border-slate-800 bg-black/20 p-6">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300 mb-4'})}<h4 className="text-sm font-black text-white">{String(title)}</h4><p className="mt-2 text-xs leading-relaxed text-slate-500">{String(body)}</p></div>)}
      </div>
    </div>
  </section>
);