import React from 'react';

export const SocialProofBar: React.FC = () => {
  return (
    <div className="w-full border-t border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          
          <div className="text-center px-4">
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              600+
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Businesses Automated
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4">
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              10M+
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Tasks Automated Monthly
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4">
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Uptime Guarantee
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="text-center px-4">
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
              4.9/5
            </div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">
              Client Satisfaction
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
