import React from 'react';

const items = [
  ['Managed Deployment', 'Configured around your business'],
  ['AI Workforce', 'Agents for real business workflows'],
  ['Human Control', 'Escalation when required'],
  ['Managed Operations', 'Ongoing monitoring and maintenance'],
];

export const SocialProofBar: React.FC = () => (
  <div className="w-full border-t border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {items.map(([title, desc], i) => (
          <div key={title} className="text-center px-3 relative">
            {i > 0 && <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />}
            <div className="text-sm md:text-base font-black text-white uppercase tracking-tight">{title}</div>
            <div className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
