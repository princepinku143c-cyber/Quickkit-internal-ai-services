import React from 'react';
import { Language } from '../types';
import { Check, Info, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

interface PricingProps {
  lang: Language;
}

export const Pricing: React.FC<PricingProps> = ({ lang }) => {
  return (
    <section id="pricing" className="py-32 bg-nexus-dark relative border-t border-nexus-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">
            <Zap className="w-3 h-3" /> Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Simple, Predictable Tiers</h2>
          <p className="text-slate-400 text-lg">
            Choose the level of intelligence your business needs. One-time setup fee + flexible monthly retainer.
          </p>
        </div>
        
        {/* New 3-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          
          {/* TIER 1: Basic */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-emerald-500/30 transition-all relative">
             <div className="mb-6">
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Start with AI</span>
                <h3 className="text-2xl font-black text-white mt-4">Basic Package</h3>
                <p className="text-slate-400 text-sm mt-1">The Chat Assistant</p>
             </div>
             <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-white">$0</span>
                   <span className="text-2xl text-slate-500 font-bold">-</span>
                   <span className="text-4xl font-black text-white">$599</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2 border-b border-slate-800 pb-4">One-time Build Fee</p>
             </div>
             
             <div className="flex-1 space-y-6">
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Setup & Core Features</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> OpenClaw (Smart Chat)</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Customer Support Automation</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Email Drafting & Lead Qual</li>
                   </ul>
                </div>
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">AI Infrastructure</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Limited Context Memory</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Basic Usage Dashboard</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Standard LLM (BYO API Key)</li>
                   </ul>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Ideal For:</p>
                <p className="text-sm text-slate-300">Beginners / Small Businesses dipping toes into AI.</p>
             </div>
          </div>

          {/* TIER 2: Advanced (Highlighted) */}
          <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500/50 rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-lg">Most Popular</div>
             <div className="mb-6 mt-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">Train your AI</span>
                <h3 className="text-2xl font-black text-white mt-4">Advanced Package</h3>
                <p className="text-slate-400 text-sm mt-1">The Business Pro</p>
             </div>
             <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-white">$599</span>
                   <span className="text-2xl text-slate-500 font-bold">-</span>
                   <span className="text-4xl font-black text-white">$799</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2 border-b border-slate-800 pb-4">One-time Build Fee</p>
             </div>
             
             <div className="flex-1 space-y-6">
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Setup & Core Features</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> OpenClaw + ChromaDB (Memory)</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> AI Trained on YOUR PDFs/Docs</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> Smart Contextual Responses</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> Slack & WhatsApp (via n8n)</li>
                   </ul>
                </div>
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">AI Infrastructure</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> Persistent Vector Memory</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> Dashboard Token/Cost Tracking</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> Advanced Multi-Model Orchestration Layer</li>
                   </ul>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase text-blue-400 tracking-widest mb-1">Ideal For:</p>
                <p className="text-sm text-slate-300">Growing teams with high client interaction volume.</p>
             </div>
          </div>

          {/* TIER 3: Premium */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-purple-500/30 transition-all relative">
             <div className="mb-6">
                <span className="text-[10px] font-black tracking-widest uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">Replace Manual Work</span>
                <h3 className="text-2xl font-black text-white mt-4">Full Automation</h3>
                <p className="text-slate-400 text-sm mt-1">The AI Employee</p>
             </div>
             <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-white">$799</span>
                   <span className="text-2xl text-slate-500 font-bold">-</span>
                   <span className="text-4xl font-black text-white">$1299<span className="text-2xl text-purple-400">+</span></span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2 border-b border-slate-800 pb-4">One-time Build Fee</p>
             </div>
             
             <div className="flex-1 space-y-6">
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Setup & Core Features</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Paperclip (Browser Automation)</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> CRM Auto-Login & Task Execution</li>
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> LinkedIn/Email Outreach Gen</li>
                   </ul>
                </div>
                <div>
                   <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">AI Infrastructure</p>
                   <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Full Memory + Context Awareness</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Premium Dedicated VPS Deployment</li>
                      <li className="flex items-start gap-2"><Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Enterprise Intelligence Layer (BYO API Key)</li>
                   </ul>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Ideal For:</p>
                <p className="text-sm text-slate-300">Scaling Agencies & Enterprise Operations.</p>
             </div>
          </div>
          
        </div>

        {/* 3-Step Delivery Protocol (Moved Below Pricing) */}
        <div className="max-w-5xl mx-auto mb-20 bg-nexus-card border border-slate-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />
           <div className="flex flex-col lg:flex-row gap-12 relative z-10">
              
              <div className="lg:w-1/3">
                 <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6" />
                 <h3 className="text-2xl font-black text-white mb-4">Zero-Friction Delivery Protocol</h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-6">
                   All packages include <strong className="text-white">1 Month Free Maintenance</strong> and full <strong className="text-blue-400">Smart AI CRM</strong> dashboard access to track tokens, manage agents, and view real-time operations.
                 </p>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Guaranteed Satisfaction</p>
                    <p className="text-xs text-slate-300">You don't pay until the live Demo meets your exact specifications.</p>
                 </div>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center mb-4 absolute -top-4 -left-4 border border-slate-700 shadow-xl">1</div>
                    <h4 className="text-white font-bold mb-2">Build & Demo (Free)</h4>
                    <p className="text-sm text-slate-400">We architect your custom AI agents and show you a working prototype on our live server.</p>
                 </div>
                 <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center mb-4 absolute -top-4 -left-4 border border-slate-700 shadow-xl">2</div>
                    <h4 className="text-white font-bold mb-2">Approval & Pay</h4>
                    <p className="text-sm text-slate-400">Once you say "Yes" to the results, you pay the setup invoice to authorize deployment.</p>
                 </div>
                 <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 font-black flex items-center justify-center mb-4 absolute -top-4 -left-4 border border-blue-500/50 shadow-xl">3</div>
                    <h4 className="text-white font-bold mb-2">Full Handover</h4>
                    <p className="text-sm text-slate-400">We transfer everything to your private workspace, including the interactive CRM Dashboard.</p>
                 </div>
              </div>

           </div>
        </div>

        {/* Exclusions */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-[2rem] border border-slate-800 bg-[#0a0f1c] flex flex-col md:flex-row items-center gap-8 animate-slide-up [animation-delay:400ms]">
           <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" /> Third-Party Subscriptions Not Included</h4>
                  You own all your digital real estate. Any required infrastructure (e.g. Dedicated VPS, OpenAI/Anthropic API usage) is billed directly via your own API keys and billing methods. We do not markup or manage your software costs.

           </div>
        </div>
      </div>
    </section>
  );
};
