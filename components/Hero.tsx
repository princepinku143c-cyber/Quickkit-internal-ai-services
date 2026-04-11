
import React, { useState } from 'react';
import { ShieldCheck, Zap, Cpu, Terminal, Sparkles, ArrowRight, Layers, AlertCircle, ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onLaunchArchitect: (prompt: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onLaunchArchitect }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [error, setError] = useState(false);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Only proceed if input is meaningful (> 5 chars)
    if (userPrompt.trim().length >= 5) {
      setError(false);
      onLaunchArchitect(userPrompt);
    } else {
      setError(true);
      // Visual feedback: Shake the input
      const inputEl = document.getElementById('architect-input');
      inputEl?.focus();
      setTimeout(() => setError(false), 2000);
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-nexus-dark">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      <div className="container mx-auto px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 mb-8 animate-fade-in tracking-[0.2em] uppercase font-black">
          <Terminal className="w-3 h-3" /> System Status: Operational
        </div>

        <p className="text-xl md:text-2xl font-black mb-4 tracking-widest text-slate-500 uppercase">
           QUICKKIT GLOBAL AI
        </p>
        <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tighter text-white animate-slide-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">AI Agents</span> and Automation Workflows Built for Modern Business
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-4xl mx-auto mb-12 font-sans leading-relaxed animate-slide-up [animation-delay:200ms]">
          Automate sales, support, marketing, and operations with intelligent systems powered by <span className="text-white font-bold">Nimoclaw</span>, <span className="text-white font-bold">OpenClaw</span>, and <span className="text-white font-bold">HubSpot</span>. Save time, reduce manual dependency, and scale with confidence.
        </p>

        {/* AI Architect Command Center */}
        <div className="max-w-3xl mx-auto mb-6">
           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 animate-slide-up [animation-delay:400ms]">
            <button 
              onClick={() => {
                const input = document.getElementById('architect-input') as HTMLInputElement | null;
                if(input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    input.focus();
                }
              }}
              className="px-10 py-5 bg-white text-nexus-dark rounded-xl font-black text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 w-full sm:w-auto uppercase tracking-widest"
            >
              CHAT WITH AI ARCHITECT <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.2)] active:scale-95 w-full sm:w-auto uppercase tracking-widest"
            >
              BOOK LIVE DEMO
            </button>
          </div>
          <div className="mt-6">
             <form onSubmit={handleLaunch} className={`relative group transition-all duration-300 w-full max-w-2xl mx-auto ${error ? 'animate-shake' : ''}`}>
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
               <div className={`relative flex flex-col sm:flex-row items-center gap-2 sm:gap-0 bg-nexus-card border ${error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-nexus-border'} rounded-2xl p-2 sm:pl-6 shadow-2xl transition-all`}>
                  <Sparkles className={`hidden sm:block w-6 h-6 ${error ? 'text-red-400' : 'text-blue-400'} shrink-0 animate-pulse`} />
                  <input
                    id="architect-input"
                    type="text"
                    value={userPrompt}
                    onChange={(e) => {
                      setUserPrompt(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder="Describe your custom AI automation project..."
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 sm:py-4 text-white text-base sm:text-lg font-mono placeholder:text-slate-600 w-full"
                  />
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-white text-nexus-dark rounded-xl font-black text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] whitespace-nowrap active:scale-95 uppercase">
                    Start Scoping <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
               {error && (
                 <p className="absolute -bottom-8 left-6 text-red-400 text-[10px] font-mono flex items-center gap-1 uppercase tracking-widest font-bold">
                   <AlertCircle className="w-3 h-3" /> Please describe your project
                 </p>
               )}
             </form>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 mt-10">
           <button 
              onClick={scrollToCatalog}
              className="group flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-blue-400 transition-colors tracking-widest uppercase font-bold"
           >
             <Layers className="w-3.5 h-3.5" /> Or Explore Service Catalog <ChevronDown className="w-3 h-3 group-hover:translate-y-1 transition-transform" />
           </button>

           <div className="flex justify-center gap-8 mt-4 border-t border-nexus-border/30 pt-8 w-full max-w-xl">
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Enterprise Encrypted
             </div>
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <Cpu className="w-3 h-3 text-blue-500" /> 24/7 Monitoring
             </div>
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <Zap className="w-3 h-3 text-amber-500" /> 3 Day Delivery
             </div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </section>
  );
};
