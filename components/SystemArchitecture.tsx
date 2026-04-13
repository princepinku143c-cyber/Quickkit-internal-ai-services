import React from 'react';
import { Database, BrainCircuit, Terminal, ArrowRight, LayoutDashboard, MessageSquareText, TrendingUp, Users } from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  return (
    <section id="system" className="py-32 bg-nexus-dark relative border-t border-slate-900 border-b">
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-20 animate-slide-up">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">
              <Database className="w-3 h-3" /> Core Infrastructure
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Backend Intelligence Engine</h2>
           <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
             How our highly optimized three-tier architecture handles your entire business automation under the hood. 
           </p>
        </div>

        {/* Backend Tech Stack */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mb-24">
           {/* Smart AI CRM */}
           <div className="flex-1 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-orange-500/50 transition-colors group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:scale-105 transition-transform"><Database className="w-8 h-8 text-orange-400" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-white">Smart AI CRM</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-1">(CRM LAYER)</span>
                 </div>
              </div>
              <ul className="space-y-3 text-slate-400">
                 <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-400"/> Centralized Lead Store</li>
                 <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-400"/> Deal Pipeline Management</li>
                 <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-400"/> Client Activity Tracking</li>
              </ul>
           </div>

           {/* Nimoclaw */}
           <div className="flex-1 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-colors group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:scale-105 transition-transform"><BrainCircuit className="w-8 h-8 text-purple-400" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-white">Nimoclaw</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-1">(LOGIC ORCHESTRATOR)</span>
                 </div>
              </div>
              <ul className="space-y-3 text-slate-400 text-sm">
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0"/> Semantic Routing Engine</li>
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0"/> Continuous Context Evaluation</li>
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0"/> Dynamic Agent Allocation</li>
              </ul>
           </div>

           {/* OpenClaw */}
           <div className="flex-1 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-105 transition-transform"><Terminal className="w-8 h-8 text-emerald-400" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-white">OpenClaw</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-1">(ACTION RUNTIME)</span>
                 </div>
              </div>
              <ul className="space-y-3 text-slate-400 text-sm">
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"/> Parallel API Execution</li>
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"/> Secure Code Sandbox</li>
                 <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"/> High-load Data Transformations</li>
              </ul>
           </div>
        </div>

        {/* Real Flow Example */}
        <div className="max-w-5xl mx-auto bg-[#0a0f1c] border border-slate-800 rounded-[3rem] p-10 md:p-16 mb-24 relative overflow-hidden">
           <h3 className="text-3xl font-black text-white text-center mb-12 relative z-10"><span className="text-emerald-400">Real Execution Workflow</span> Example</h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 text-center">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative z-10">
                 <div className="w-12 h-12 bg-blue-500/10 rounded-full mx-auto flex items-center justify-center mb-4 border border-blue-500/30 font-black text-blue-400">1</div>
                 <h4 className="text-white font-bold mb-2">Lead Entry</h4>
                 <p className="text-sm text-slate-400">Client fills out website form.</p>
              </div>
              <div className="hidden lg:block absolute top-[150px] w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 z-0"></div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/20 relative z-10 mt-6 lg:mt-0">
                 <div className="w-12 h-12 bg-orange-500/10 rounded-full mx-auto flex items-center justify-center mb-4 border border-orange-500/30 font-black text-orange-400">2</div>
                 <h4 className="text-white font-bold mb-2">Data Sync</h4>
                 <p className="text-sm text-slate-400">Data directly into Smart AI CRM CRM.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-purple-500/20 relative z-10 mt-6 lg:mt-0">
                 <div className="w-12 h-12 bg-purple-500/10 rounded-full mx-auto flex items-center justify-center mb-4 border border-purple-500/30 font-black text-purple-400">3</div>
                 <h4 className="text-white font-bold mb-2">Nimoclaw Trigger</h4>
                 <p className="text-sm text-slate-400">Detects new lead, decides logic.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/20 relative z-10 mt-6 lg:mt-0">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-4 border border-emerald-500/30 font-black text-emerald-400">4</div>
                 <h4 className="text-white font-bold mb-2">OpenClaw Action</h4>
                 <p className="text-sm text-slate-400">Email send, follow-up, CRM update.</p>
              </div>
           </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-gradient-to-tr from-slate-900 to-[#111827] border border-blue-500/30 p-1 relative overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.15)] group">
           <div className="absolute top-0 right-0 bg-blue-600 px-6 py-1.5 text-[10px] font-black uppercase text-white tracking-widest rounded-bl-xl z-20 shadow-lg">Client Dashboard Preview</div>
           <div className="bg-nexus-dark rounded-[2.3rem] overflow-hidden">
              <div className="flex border-b border-slate-800 bg-[#0a0f1c] p-4 items-center gap-4">
                 <div className="flex gap-2 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                 </div>
                 <div className="bg-slate-900 text-slate-400 text-xs font-mono px-4 py-1.5 rounded-md border border-slate-700 w-full flex items-center gap-2"><LayoutDashboard className="w-3 h-3 text-blue-400 shrink-0" /> app.quickkit.ai/dashboard</div>
              </div>
              <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] bg-[size:30px_30px]">
                 <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl group-hover:border-blue-500/50 transition">
                    <Users className="w-6 h-6 text-blue-400 mb-3" />
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">New Leads</p>
                    <p className="text-3xl font-black text-white">124</p>
                 </div>
                 <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl group-hover:border-blue-500/50 transition">
                    <MessageSquareText className="w-6 h-6 text-purple-400 mb-3" />
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Messages Sent</p>
                    <p className="text-3xl font-black text-white">4,892</p>
                 </div>
                 <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl group-hover:border-blue-500/50 transition">
                    <Terminal className="w-6 h-6 text-emerald-400 mb-3" />
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Reports</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                       <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Done</p>
                    </div>
                 </div>
                 <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl group-hover:border-blue-500/50 transition">
                    <BrainCircuit className="w-6 h-6 text-emerald-400 mb-3" />
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Agent Status</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Active (8)</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};
