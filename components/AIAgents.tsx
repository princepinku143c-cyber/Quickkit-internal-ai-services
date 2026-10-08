import React from 'react';
import { ArrowRight, BarChart3, CalendarCheck, FileText, Globe2, MapPinned, MessageCircle, RefreshCw, ShieldCheck, Target, ThumbsUp, UserSearch, UsersRound } from 'lucide-react';

interface AIAgentsProps { onSelectAgent: (item:any)=>void; }

const AGENTS = [
  {id:'agent-1',icon:MessageCircle,color:'blue',title:'12-Second WhatsApp Speed-to-Lead Closer',desc:'Inbound qualifier and appointment booker that works in WhatsApp voice notes + text, designed around the first-contact moment.',tasks:['≤ 12-second response target','Voice note + text','Qualification','Appointment booking']},
  {id:'agent-2',icon:UserSearch,color:'purple',title:'Apify B2B Lead Prospector + Competitor Intelligence',desc:'Builds targeted prospect lists, checks public business/ad signals and turns research into executive-ready dossiers, with a max 50-prospect/day throttle.',tasks:['Google Maps prospecting','Meta Ad Library monitoring','Executive dossiers','50/day throttle']},
  {id:'agent-3',icon:ShieldCheck,color:'emerald',title:'CRM Sentinel + No-Show Guard',desc:'Protects the booking pipeline with calendar locking, GPS reminders and proof-oriented appointment handling.',tasks:['Calendar slot lock','2h location reminder','Maps + transport link','No-show workflow']},
  {id:'agent-4',icon:RefreshCw,color:'amber',title:'Dead Lead Reviver',desc:'Re-engages dormant databases with short conversational hooks and routes responses back into the sales workflow.',tasks:['6+ month dormant leads','Reactivation hooks','Response routing','Database follow-up']},
  {id:'agent-5',icon:ThumbsUp,color:'cyan',title:'5-Star Reputation + Local SEO Sentinel',desc:'Routes positive feedback toward reviews and unhappy feedback toward a private escalation path while supporting local/AI-search visibility work.',tasks:['4–5 star review routing','1–3 star escalation','Reputation workflow','Local/AI-search support']},
];

const colors:Record<string,string>={blue:'text-blue-300 bg-blue-500/10 border-blue-500/20',purple:'text-purple-300 bg-purple-500/10 border-purple-500/20',emerald:'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',amber:'text-amber-300 bg-amber-500/10 border-amber-500/20',cyan:'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'};

export const AIAgents:React.FC<AIAgentsProps>=({onSelectAgent})=>(
  <section id="ai-agents" className="py-28 bg-[#050912] border-y border-white/6 relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-[420px] bg-indigo-600/6 blur-[120px] pointer-events-none"/>
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-indigo-300"><UsersRound className="w-3 h-3"/> THE 5-MEMBER WORKFORCE</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Five specialists. One revenue workflow.</h2>
        <p className="mt-5 text-lg md:text-xl leading-relaxed text-slate-400 max-w-3xl mx-auto">The public product is a coordinated five-agent system — not five disconnected chatbots. Each specialist owns a defined part of acquisition, conversion, operations or reputation.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto mb-12">
        {[['01','Speed-to-lead'],['02','Prospecting'],['03','No-show guard'],['04','Revival'],['05','Reputation']].map(([n,l])=><div key={n} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-center"><div className="text-[9px] font-mono text-slate-700">{n}</div><div className="mt-1 text-[11px] font-black text-white">{l}</div></div>)}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {AGENTS.map(a=>{const Icon=a.icon;return <article key={a.id} className="group flex flex-col rounded-[1.6rem] border border-slate-800 bg-slate-950/75 p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all"><div className="flex justify-between gap-3"><div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colors[a.color]}`}><Icon className="w-6 h-6"/></div><span className="rounded-full border border-slate-800 px-2 py-1 text-[8px] font-mono font-black uppercase tracking-widest text-slate-600">Managed</span></div><h3 className="mt-5 text-lg font-black text-white">{a.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-400 flex-1">{a.desc}</p><div className="mt-5 space-y-2">{a.tasks.map(t=><div key={t} className="flex items-center gap-2 text-[11px] text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400"/>{t}</div>)}</div><button onClick={()=>onSelectAgent({id:a.id,name:a.title,outcome:a.desc})} className="mt-6 w-full rounded-xl border border-slate-700 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-2">Design This Agent <ArrowRight className="w-4 h-4"/></button></article>})}
      </div>
      <div className="mt-10 grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {[
          [BarChart3,'Acquisition layer','Prospecting + inbound speed-to-lead bring attention into the system.'],
          [CalendarCheck,'Conversion layer','Qualification, booking and no-show protection move intent toward physical visits.'],
          [ShieldCheck,'Trust layer','Reactivation and reputation workflows keep the pipeline productive after the first conversation.']
        ].map(([Icon,title,body])=><div key={String(title)} className="rounded-2xl border border-slate-800 bg-black/20 p-6">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300 mb-4'})}<h4 className="text-sm font-black text-white">{String(title)}</h4><p className="mt-2 text-xs leading-relaxed text-slate-500">{String(body)}</p></div>)}
      </div>
      <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5 flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0"/><p className="text-xs leading-relaxed text-slate-400"><strong className="text-white">Safety + proof:</strong> Every agent remains bounded by approved workflow rules, human escalation and the zero-glitch safeguards in the engineering ledger.</p></div>
    </div>
  </section>
);