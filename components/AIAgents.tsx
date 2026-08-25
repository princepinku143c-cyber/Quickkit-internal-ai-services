import React from 'react';
import {
  Target, MessageCircle, TrendingUp, Megaphone, ShoppingCart, BarChart3,
  ArrowRight, Bot, Database, CalendarCheck, Mic2, Workflow, BrainCircuit
} from 'lucide-react';

interface AIAgentsProps { onSelectAgent: (item: any) => void; }

const AGENTS = [
  { id:'lead-gen', icon:Target, color:'blue', title:'Lead Generation Agent', description:'Finds, captures, qualifies and routes leads into the right business workflow.', tasks:['Lead capture & qualification','Lead scoring and routing','CRM data entry','Follow-up triggers'] },
  { id:'sales', icon:TrendingUp, color:'purple', title:'Sales & Follow-up Agent', description:'Keeps prospects moving with context-aware follow-ups, meeting workflows and sales handoffs.', tasks:['Follow-up sequences','Lead nurturing','Meeting booking','Proposal / quote workflows'] },
  { id:'support', icon:MessageCircle, color:'emerald', title:'Customer Support Agent', description:'Handles routine customer conversations, FAQs and escalation to your team when needed.', tasks:['Customer questions','FAQ handling','Ticket routing','Human escalation'] },
  { id:'whatsapp', icon:MessageCircle, color:'cyan', title:'WhatsApp & Messaging Agent', description:'Automates business messaging workflows across supported messaging channels.', tasks:['Inbound replies','Lead qualification','Follow-up reminders','Status notifications'] },
  { id:'crm', icon:Database, color:'amber', title:'CRM & Operations Agent', description:'Keeps your CRM and operational records updated as work happens across connected systems.', tasks:['Record creation & updates','Pipeline movement','Task assignment','Data synchronization'] },
  { id:'voice', icon:Mic2, color:'pink', title:'Voice AI Agent', description:'Voice workflows for supported use cases such as reception, qualification and appointment handling.', tasks:['Call handling','Qualification flows','Appointment workflows','Escalation to humans'] },
  { id:'marketing', icon:Megaphone, color:'violet', title:'Marketing Automation Agent', description:'Coordinates repeatable marketing workflows, content tasks and reporting across connected tools.', tasks:['Campaign workflows','Email automation','Content tasks','Performance reporting'] },
  { id:'ecommerce', icon:ShoppingCart, color:'orange', title:'E-commerce Operations Agent', description:'Automates repetitive store operations and customer communication where integrations are available.', tasks:['Order workflows','Customer updates','Abandoned-cart flows','Review requests'] },
  { id:'analytics', icon:BarChart3, color:'rose', title:'Analytics & Reporting Agent', description:'Collects information from connected systems and produces recurring business reports and alerts.', tasks:['KPI reporting','Scheduled reports','Performance alerts','Cross-system summaries'] },
  { id:'appointments', icon:CalendarCheck, color:'indigo', title:'Appointment & Scheduling Agent', description:'Coordinates appointment and calendar workflows for businesses with scheduling needs.', tasks:['Booking flows','Reminder workflows','Calendar synchronization','Rescheduling support'] },
];

const colors: Record<string,string> = {
  blue:'text-blue-400 bg-blue-500/10 border-blue-500/20', purple:'text-purple-400 bg-purple-500/10 border-purple-500/20',
  emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cyan:'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  amber:'text-amber-400 bg-amber-500/10 border-amber-500/20', pink:'text-pink-400 bg-pink-500/10 border-pink-500/20',
  violet:'text-violet-400 bg-violet-500/10 border-violet-500/20', orange:'text-orange-400 bg-orange-500/10 border-orange-500/20',
  rose:'text-rose-400 bg-rose-500/10 border-rose-500/20', indigo:'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
};

export const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent }) => (
  <section id="ai-agents" className="py-32 bg-[#030712] border-t border-slate-900 relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-80 bg-indigo-600/5 blur-3xl pointer-events-none" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-[0.2em] font-black"><Bot className="w-3 h-3"/> AI Workforce</div>
        <h2 className="text-5xl md:text-7xl font-black text-white mt-8 mb-6 tracking-tighter">What Your AI Agents Actually Do</h2>
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">Hermes is the core agent architecture we use as the foundation for managed AI systems. We configure specialized agents around your business workflows, connect the required tools and manage the deployed system for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 max-w-7xl mx-auto">
        {AGENTS.map(agent=>{ const Icon=agent.icon; return (
          <div key={agent.id} className="bg-[#080c14] border border-slate-800 rounded-[2rem] p-7 hover:border-slate-600 transition-all flex flex-col">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${colors[agent.color]}`}><Icon className="w-7 h-7"/></div>
            <h3 className="text-xl font-black text-white mb-3">{agent.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{agent.description}</p>
            <div className="space-y-2.5 mb-7 flex-1">{agent.tasks.map(task=><div key={task} className="flex items-center gap-2 text-sm text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"/>{task}</div>)}</div>
            <button onClick={()=>onSelectAgent({id:agent.id,name:agent.title,outcome:agent.description})} className="w-full py-3.5 rounded-xl border border-slate-700 text-white hover:bg-white hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">Discuss This Agent <ArrowRight className="w-4 h-4"/></button>
          </div>
        );})}
      </div>

      <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {icon:BrainCircuit,title:'Hermes Core',text:'The core agent layer for reasoning, tool use and workflow execution in the deployed system.'},
          {icon:Workflow,title:'Custom Workflows',text:'Agents can be combined into multi-step workflows instead of operating as isolated chatbots.'},
          {icon:Database,title:'Memory & Data',text:'Business context, connected data and system memory are configured for the selected use case.'}
        ].map(item=>{const Icon=item.icon;return <div key={item.title} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6"><Icon className="w-6 h-6 text-blue-400 mb-4"/><h4 className="text-white font-bold mb-2">{item.title}</h4><p className="text-sm text-slate-400 leading-relaxed">{item.text}</p></div>})}
      </div>

      <div className="max-w-5xl mx-auto mt-10 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
        <h3 className="text-lg font-black text-white mb-2">KVM 4 or KVM 8?</h3>
        <p className="text-sm text-slate-400">KVM 4 is the starting managed infrastructure for lighter workloads. KVM 8 is for higher-capacity workloads and larger agent systems. Exact resource requirements are confirmed during system design.</p>
      </div>
      <p className="max-w-4xl mx-auto mt-8 text-center text-xs text-slate-600">Exact integrations and agent capabilities depend on the selected workflow, connected services and deployment configuration.</p>
    </div>
  </section>
);
