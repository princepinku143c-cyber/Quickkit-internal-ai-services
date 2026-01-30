
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

        <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tighter text-white">
          Internal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">AI Services</span> Agency
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-mono leading-relaxed">
          Deploy premium automation infrastructure. We manage the accounts, updates, and maintenance. 
          <span className="text-blue-400 block mt-2 font-bold border-b border-blue-500/30 w-fit mx-auto">Everything delivered within 3 days.</span>
        </p>

        {/* AI Architect Command Center */}
        <div className="max-w-3xl mx-auto mb-6">
          <form onSubmit={handleLaunch} className={`relative group transition-all duration-300 ${error ? 'animate-shake' : ''}`}>
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
             
             <div className={`relative flex items-center bg-nexus-card border ${error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-nexus-border'} rounded-2xl p-2 pl-6 shadow-2xl transition-all`}>
                <Sparkles className={`w-6 h-6 ${error ? 'text-red-400' : 'text-blue-400'} shrink-0 animate-pulse`} />
                <input 
                  id="architect-input"
                  type="text"
                  value={userPrompt}
                  onChange={(e) => { setUserPrompt(e.target.value); if(error) setError(false); }}
                  placeholder="Tell me exactly what you want to automate..."
                  className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white text-lg font-mono placeholder:text-slate-700"
                />
                <button 
                  type="submit"
                  className="px-10 py-4 bg-white text-nexus-dark rounded-xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] whitespace-nowrap active:scale-95"
                >
                  BUILD ROADMAP <ArrowRight className="w-4 h-4" />
                </button>
             </div>
             {error && (
               <p className="absolute -bottom-8 left-6 text-red-400 text-[10px] font-mono flex items-center gap-1 uppercase tracking-widest font-bold">
                 <AlertCircle className="w-3 h-3" /> Input required to launch Architect
               </p>
             )}
          </form>
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
