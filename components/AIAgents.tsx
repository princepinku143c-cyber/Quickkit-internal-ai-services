import React from 'react';
import { AI_AGENTS_CATALOG, BUNDLE_CATALOG } from '../data/catalog';
import { Bot, ArrowRight, CheckCircle2, Package, ShieldCheck, Zap, Globe, Cpu, BarChart3 } from 'lucide-react';
import { ServiceItem } from '../types';

interface AIAgentsProps {
  onSelectAgent: (item: ServiceItem) => void;
}

export const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent }) => {
  return (
    <section id="ai-agents" className="py-32 bg-[#030712] border-t border-slate-900 relative overflow-hidden">
      {/* Premium background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black animate-pulse">
            <Bot className="w-3 h-3" /> Autonomous Digital Workers
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter animate-slide-up">
            Elite AI Operators
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed animate-slide-up [animation-delay:100ms] mb-12">
            Stop hiring overhead. Deploy role-based AI agents powered by <span className="text-white font-bold">NemoClaw</span> that execute complex business tasks with 100% accuracy, 24/7.
          </p>

          {/* Trust Strip */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise-Grade Security</div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Zap className="w-4 h-4 text-blue-400" /> Instant Deployment</div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Globe className="w-4 h-4 text-indigo-400" /> Multi-Platform Execution</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
          {AI_AGENTS_CATALOG.map((agent, index) => (
            <div 
              key={agent.id}
              className="group bg-[#080c14] border border-slate-800 hover:border-blue-500/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden h-full"
              style={{ animationDelay: `${(index % 3) * 100 + 200}ms` }}
            >
              {/* Overlay Content (Layer 2) */}
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 p-8 flex flex-col pt-16 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
                  <div className="absolute top-6 right-6 p-2 rounded-full bg-blue-500/10 text-blue-400 md:hidden block">
                     Tap to close
                  </div>
                  <h4 className="text-lg font-black text-white mb-6 border-b border-slate-700/50 pb-4">Agent Specifications</h4>
                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">What It Handles</p>
                        <p className="text-sm text-slate-300 leading-relaxed font-mono">{agent.handles}</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Integrations</p>
                        <p className="text-sm text-blue-400 leading-relaxed font-mono">{agent.integrations}</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Best For</p>
                        <p className="text-sm text-emerald-400 leading-relaxed font-mono">{agent.bestFor}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => onSelectAgent(agent)}
                    className="w-full mt-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
                  >
                    DEPLOY AGENT
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
              </div>

              {agent.badge && (
                <div className="absolute top-6 right-6 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full z-10 transition-opacity group-hover:opacity-0">
                  {agent.badge.replace('🔥 ', '')}
                </div>
              )}
              
              <div className="mb-6 relative z-10 transition-opacity group-hover:opacity-0 duration-300 delay-100">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center mb-6 border border-slate-700 transition-all">
                    <Cpu className="w-7 h-7 text-slate-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                    {agent.name}
                 </h3>
                 <p className="text-blue-400 text-[11px] font-bold font-mono uppercase tracking-tight leading-relaxed">
                    {agent.outcome}
                 </p>
              </div>

              <div className="space-y-4 mb-8 flex-1 relative z-10 transition-opacity group-hover:opacity-0 duration-300 delay-75">
                 {agent.actions?.map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                       </div>
                       <p className="text-[13px] text-slate-300 leading-tight">{action}</p>
                    </div>
                 ))}
              </div>

              <div className="border-t border-slate-800/50 pt-6 mb-6 relative z-10 transition-opacity group-hover:opacity-0 duration-300">
                 <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase cursor-help hover:text-blue-400 transition-colors">
                     View Deep Specs (Hover) <ArrowRight className="w-3 h-3" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10 transition-opacity group-hover:opacity-0 duration-300">
                 <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">Build Fee</p>
                    <p className="text-xl font-black text-white">${agent.setupUSD.toLocaleString()}</p>
                 </div>
                 <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <p className="text-[9px] text-emerald-500/70 font-black uppercase mb-1 tracking-widest">Monthly Ops</p>
                    <p className="text-xl font-black text-emerald-400">${agent.monthlyUSD.toLocaleString()}</p>
                 </div>
              </div>

            </div>
          ))}
        </div>

        {/* What These Agents Can Actually Handle Section */}
        <div className="max-w-6xl mx-auto p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-slate-900 to-nexus-dark border border-slate-800 mb-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5"><Cpu className="w-96 h-96 text-blue-500" /></div>
           
           <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-white mb-6">What These Agents Can Actually Handle</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                  Each agent is designed to operate inside real business workflows — from lead capture and CRM updates to scheduling, support handling, reporting, invoicing, and internal coordination.
              </p>
           </div>

           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Capture and qualify leads</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Send follow-ups and update CRM</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Book meetings and manage calendars</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Handle support questions and routing</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Generate reports, summaries, and alerts</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
                 <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                 <p className="text-slate-300 font-medium">Trigger actions across connected tools</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl md:col-span-2">
                 <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                 <p className="text-emerald-400 font-bold">Escalate sensitive actions for human approval</p>
              </div>
           </div>
        </div>

        {/* --- Bundles Section --- */}
        <div className="border-t border-slate-900 pt-32 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Strategic Expansion Packages</h3>
            <p className="text-slate-400 text-lg">Deploy full business transformations with massive savings.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUNDLE_CATALOG.map((bundle, index) => (
               <div key={bundle.id} className="relative bg-nexus-card border border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/50 hover:bg-slate-900 transition-all shadow-xl group">
                 {bundle.badge && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-blue-400 shadow-xl whitespace-nowrap">
                    {bundle.badge.replace('🔥 ', '')}
                  </div>
                 )}
                 <div className="flex items-center justify-center mb-6 mt-4">
                    <div className="p-6 bg-slate-800/50 rounded-[2rem] group-hover:scale-105 transition-transform text-white border border-slate-700">
                       <Package className="w-12 h-12" />
                    </div>
                 </div>
                 <h4 className="text-2xl text-center font-black text-white mb-4">{bundle.name}</h4>
                 <p className="text-slate-400 text-center text-sm mb-8 pb-8 border-b border-slate-800/50 leading-relaxed">{bundle.description}</p>
                 
                 <div className="flex justify-between items-center mb-10">
                   <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-mono font-black mb-1 uppercase tracking-widest">Build Fee</p>
                      <p className="text-3xl font-black text-white">${bundle.setupUSD.toLocaleString()}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-slate-800"></div>
                   <div className="text-center">
                      <p className="text-[10px] text-emerald-400 font-mono font-black mb-1 uppercase tracking-widest">Monthly Ops</p>
                      <p className="text-3xl font-black text-emerald-400">${bundle.monthlyUSD.toLocaleString()}</p>
                   </div>
                 </div>
                 
                 <button onClick={() => onSelectAgent(bundle)} className="w-full bg-white hover:bg-slate-200 text-nexus-dark py-5 rounded-2xl font-black transition-all shadow-xl active:scale-95" > SELECT {bundle.name.split(' ')[0].toUpperCase()} PACKAGE </button>
               </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
