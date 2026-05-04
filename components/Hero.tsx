
import React from 'react';
import { ShieldCheck, Zap, Cpu, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onLaunchArchitect: (prompt: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onLaunchArchitect }) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-nexus-dark">
      {/* Dynamic dot grid background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 text-center z-10">
        {/* Status chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 mb-8 animate-fade-in tracking-[0.2em] uppercase font-black">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live AI Systems Delivering Results
        </div>

        <p className="text-xl md:text-2xl font-black mb-4 tracking-widest text-slate-500 uppercase">
          QUICKKIT GLOBAL AI
        </p>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter text-white animate-slide-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Automate Your Sales,
          </span>
          <br />
          Leads & Support with AI
          <br className="hidden md:block" />
          <span className="text-slate-400 text-4xl md:text-5xl"> — Without Hiring Staff</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 font-sans leading-relaxed animate-slide-up [animation-delay:200ms]">
          Replace repetitive work with AI systems that <span className="text-white font-bold">generate leads, follow up automatically,</span> and run your operations 24/7.
        </p>

        {/* Primary CTA */}
        <div className="max-w-lg mx-auto mb-6 animate-slide-up [animation-delay:300ms]">
          <button
            onClick={() => {
              document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-14 py-5 bg-white text-nexus-dark rounded-xl font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 uppercase tracking-widest hover:-translate-y-0.5 mx-auto"
          >
            Book a Free Demo <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-4">
            No commitment. See your AI system live before you pay.
          </p>

          {/* Secondary ghost link */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => onLaunchArchitect('Hi Kelly! Tell me how QuickKit AI can help my business.')}
              className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 underline underline-offset-4"
            >
              <Sparkles className="w-3 h-3" /> Or chat with Kelly, our AI consultant
            </button>
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 border-t border-nexus-border/30 pt-8 w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Encrypted
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-md">
            <Cpu className="w-3.5 h-3.5 text-blue-500" /> Zero Commitment Demo
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-md">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> 48-Hour Build Time
          </div>
        </div>
      </div>
    </section>
  );
};
