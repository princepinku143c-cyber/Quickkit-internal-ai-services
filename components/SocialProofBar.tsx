import React from 'react';

export const SocialProofBar: React.FC = () => {
  return (
    <div className="w-full border-t border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          
          <div className="text-center px-4 relative group">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-20">Verified via Internal Metrics</div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              600+
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Automations Deployed
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4 relative group">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-20">Network wide aggregation</div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              10M+
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Operations Monthly
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4 relative group">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-emerald-400 px-2 py-1 rounded whitespace-nowrap z-20 border border-emerald-500/20">Monitored 24/7</div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-emerald-500 bg-clip-text text-transparent flex justify-center items-center gap-1">
              99.9%
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              System Reliability
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4 relative group">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-amber-400 px-2 py-1 rounded whitespace-nowrap z-20 border border-amber-500/20">Based on Onboarding Feedback</div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent flex justify-center items-center gap-1">
               4.9<span className="text-2xl text-slate-500">/5</span>
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Avg Setup Satisfaction
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
