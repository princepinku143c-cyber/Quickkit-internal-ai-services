import React from 'react';
import { ShieldCheck, Server, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onLaunchArchitect: (prompt: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchArchitect }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 overflow-hidden bg-nexus-dark">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 mb-8 tracking-[0.2em] uppercase font-black">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Managed AI Workforce for Indian Businesses
        </div>

        <p className="text-xl md:text-2xl font-black mb-4 tracking-widest text-slate-500 uppercase">QUICKKIT AI</p>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter text-white animate-slide-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Managed AI Agents</span>
          <br />
          built around your business
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          We build, deploy, operate and maintain AI agents for sales, support, CRM, WhatsApp, voice, marketing and internal workflows — with the infrastructure managed for you.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">KVM 4 / KVM 8</span>
          <span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">INR Pricing</span>
          <span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">1st Month Managed</span>
          <span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">Usage-Based AI/API</span>
        </div>

        <div className="max-w-2xl mx-auto mb-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 bg-white text-nexus-dark rounded-xl font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)] uppercase tracking-widest"
          >
            Book Your AI System Demo <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLaunchArchitect('Show me how QuickKit AI can automate my business and recommend the right AI agents and infrastructure.')}
            className="px-10 py-4 bg-blue-600/10 border border-blue-500/30 text-blue-300 rounded-xl font-black text-sm hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" /> Ask AI Architect
          </button>
        </div>

        <p className="text-xs text-slate-500 max-w-2xl mx-auto mb-10">AI/API usage is billed separately according to actual usage. Setup and maintenance are shown in INR.</p>

        <div className="flex flex-wrap justify-center gap-6 border-t border-nexus-border/30 pt-8 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><Bot className="w-3.5 h-3.5 text-blue-500" /> AI Agents</div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><Server className="w-3.5 h-3.5 text-purple-500" /> Managed Infrastructure</div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Monitoring & Maintenance</div>
        </div>
      </div>
    </section>
  );
};
