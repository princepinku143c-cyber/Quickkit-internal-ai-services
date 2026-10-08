import React from 'react';
import { Bot, ShieldCheck, Workflow, Wrench } from 'lucide-react';

const items = [
  [Bot, 'AI Workforce', 'Agents for real business workflows', 'text-blue-300'],
  [Workflow, 'Connected Workflows', 'CRM, messaging, forms & operations', 'text-purple-300'],
  [ShieldCheck, 'Controlled Automation', 'Verification, human escalation & guardrails', 'text-emerald-300'],
  [Wrench, 'Managed Operations', 'Setup, monitoring & ongoing maintenance', 'text-amber-300'],
];

export const SocialProofBar: React.FC = () => (
  <div className="w-full border-y border-white/5 bg-slate-950/60 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-7 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
        {items.map(([Icon, title, desc, color], i) => (
          <div key={String(title)} className="relative px-4 lg:px-7 py-2">
            {i > 0 && <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/10" />}
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              {React.createElement(Icon as React.ElementType, { className: `w-4 h-4 ${color}` })}
              <div className="text-xs md:text-sm font-black text-white">{String(title)}</div>
            </div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-2 leading-relaxed text-center lg:text-left">{String(desc)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);