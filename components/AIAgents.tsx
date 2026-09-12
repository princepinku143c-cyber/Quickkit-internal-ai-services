import React from 'react';
import { Target, MessageCircle, TrendingUp, ArrowRight, Bot, Database, CalendarCheck, Mic2, Workflow, BrainCircuit, UsersRound } from 'lucide-react';

interface AIAgentsProps { onSelectAgent: (item: any) => void; }

const AGENTS = [
  { id:'property-lead', icon:Target, color:'blue', title:'Property Lead Teammate', description:'Captures every property enquiry and moves it into the right sales workflow without waiting for a human.', tasks:['Lead capture & routing','Property / project context','Lead scoring','Instant handoff'] },
  { id:'qualification', icon:TrendingUp, color:'purple', title:'Lead Qualification Teammate', description:'Talks to prospects, understands budget, location, property type and timeline, then surfaces the strongest opportunities.', tasks:['Budget & location','Intent & timeline','Qualification scoring','Priority routing'] },
  { id:'whatsapp', icon:MessageCircle, color:'emerald', title:'WhatsApp Follow-up Teammate', description:'Keeps conversations moving with context-aware replies, reminders and follow-up sequences across the buyer journey.', tasks:['Instant replies','Lead nurturing','Follow-up reminders','Human escalation'] },
  { id:'voice', icon:Mic2, color:'cyan', title:'AI Calling Teammate', description:'Handles configurable voice workflows for qualification, callbacks and appointment conversations before passing high-intent leads to sales.', tasks:['Outbound calls','Qualification flows','Callback workflows','Escalation to humans'] },
  { id:'site-visit', icon:CalendarCheck, color:'amber', title:'Site Visit Teammate', description:'Turns qualified interest into scheduled site visits and keeps the prospect, calendar and sales team aligned.', tasks:['Visit booking','Calendar workflows','Reminders','Rescheduling support'] },
  { id:'crm', icon:Database, color:'pink', title:'CRM Operations Teammate', description:'Keeps lead records, pipeline stages, tasks and follow-up context synchronized as conversations happen.', tasks:['Record updates','Pipeline movement','Task assignment','Data synchronization'] },
];

const colors: Record<string,string> = {
  blue:'text-blue-400 bg-blue-500/10 border-blue-500/20', purple:'text-purple-400 bg-purple-500/10 border-purple-500/20',
  emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cyan:'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  amber:'text-amber-400 bg-amber-500/10 border-amber-500/20', pink:'text-pink-400 bg-pink-500/10 border-pink-500/20'
};

export const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent }) => (
  <section id="ai-agents" className="py-28 bg-[#030712] border-t border-slate-900 relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-96 bg-indigo-600/5 blur-3xl pointer-events-none" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-[0.2em] font-black"><UsersRound className="w-3 h-3"/> AI Workforce</div>
        <h2 className="text-5xl md:text-7xl font-black text-white mt-8 mb-6 tracking-tighter">Meet Your AI Teammates</h2>
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">Not another chatbot. Each teammate owns a real part of your property-sales workflow, works with the tools you connect and hands important conversations to your people.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {AGENTS.map(agent=>{ const Icon=agent.icon; return (
          <div key={agent.id} className="group bg-[#080c14] border border-slate-800 rounded-[1.75rem] p-7 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-4 mb-5"><div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${colors[agent.color]}`}><Icon className="w-7 h-7"/></div><span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Ready</span></div>
            <h3 className="text-xl font-black text-white mb-3">{agent.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{agent.description}</p>
            <div className="space-y-2.5 mb-7 flex-1">{agent.tasks.map(task=><div key={task} className="flex items-center gap-2 text-sm text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"/>{task}</div>)}</div>
            <button onClick={()=>onSelectAgent({id:agent.id,name:agent.title,outcome:agent.description})} className="w-full py-3.5 rounded-xl border border-slate-700 text-white hover:bg-white hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">Design This Teammate <ArrowRight className="w-4 h-4"/></button>
          </div>
        );})}
      </div>

      <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {icon:BrainCircuit,title:'Reasoning Layer',text:'A managed AI core coordinates decisions, tool use and multi-step workflow execution.'},
          {icon:Workflow,title:'Team Workflows',text:'Teammates can work together across one connected property-sales journey instead of isolated automations.'},
          {icon:Database,title:'Business Context',text:'Your approved business rules, property context and connected data shape how the teammates operate.'}
        ].map(item=>{const Icon=item.icon;return <div key={item.title} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6"><Icon className="w-6 h-6 text-blue-400 mb-4"/><h4 className="text-white font-bold mb-2">{item.title}</h4><p className="text-sm text-slate-400 leading-relaxed">{item.text}</p></div>})}
      </div>

      <div className="max-w-5xl mx-auto mt-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950/80 to-blue-950/10 p-6 text-center">
        <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-blue-400 mb-2">Managed AI infrastructure</p>
        <h3 className="text-lg font-black text-white mb-2">KVM 4 or KVM 8</h3>
        <p className="text-sm text-slate-400">KVM 4 is the starting managed infrastructure for lighter workloads. KVM 8 is for higher-capacity workloads and larger AI teammate systems. Exact resource requirements are confirmed during system design.</p>
      </div>
      <p className="max-w-4xl mx-auto mt-7 text-center text-xs text-slate-600">Exact integrations and capabilities depend on the selected workflow, connected services and deployment configuration.</p>
    </div>
  </section>
);
