
import React from 'react';
import { PLANS } from '../constants';
import { Language } from '../types';
import { Check, Info, AlertCircle } from 'lucide-react';

interface PricingProps {
  lang: Language;
}

export const Pricing: React.FC<PricingProps> = ({ lang }) => {
  return (
    <section id="pricing" className="py-24 bg-nexus-dark relative border-t border-nexus-border">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Internal Infrastructure Plans</h2>
          <p className="text-slate-400 text-lg">
            High-efficiency managed services. We handle the technical maintenance while you focus on the business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {Object.values(PLANS).map((plan) => (
            <div key={plan.name} className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500 ${plan.name.includes('Enterprise') ? 'border-blue-500 bg-slate-900 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-105 z-10' : 'border-nexus-border bg-nexus-card hover:border-slate-700'}`}>
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-blue-400 font-mono tracking-tighter uppercase">{plan.bestFor}</p>
              </div>
              
              <div className="mb-8 p-6 bg-nexus-dark/50 rounded-2xl border border-nexus-border">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${plan.priceMonth.toLocaleString()}</span>
                    <span className="text-slate-500 text-sm font-mono">/ 28 Days</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Maintenance & Efficiency+</p>
                
                {plan.priceSetup > 0 ? (
                  <div className="mt-4 pt-4 border-t border-nexus-border flex justify-between items-center">
                    <span className="text-sm text-slate-400">One-time Setup</span>
                    <span className="text-xl font-bold text-white">${plan.priceSetup.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-nexus-border text-center">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Zero Setup - Full Subscription</span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feat}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-5 rounded-2xl font-black transition-all transform active:scale-95 ${plan.name.includes('Enterprise') ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white text-nexus-dark hover:bg-slate-200'}`}>
                Deploy Infrastructure
              </button>
            </div>
          ))}
        </div>

        {/* Technical Disclosure */}
        <div className="max-w-4xl mx-auto glass-panel p-8 rounded-[2rem] border border-nexus-border flex flex-col md:flex-row items-start gap-8">
           <div className="p-4 bg-blue-500/10 rounded-2xl">
              <Info className="w-10 h-10 text-blue-400" />
           </div>
           <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2 underline decoration-blue-500 underline-offset-4">Managed Service Protocols</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Our agency operates on a <strong>28-day maintenance cycle</strong>. This includes real-time workflow monitoring, security patching for account changes, and account efficiency updates. 
              </p>
              <div className="flex flex-wrap gap-4">
                 <div className="bg-nexus-dark px-3 py-1.5 rounded-lg border border-nexus-border text-[10px] font-mono text-slate-300">
                    MAINTENANCE &lt; $1K: <span className="text-white">$100</span>
                 </div>
                 <div className="bg-nexus-dark px-3 py-1.5 rounded-lg border border-nexus-border text-[10px] font-mono text-slate-300">
                    MAINTENANCE &gt; $1K: <span className="text-white">10% SETUP</span>
                 </div>
                 <div className="bg-nexus-dark px-3 py-1.5 rounded-lg border border-red-500/20 text-[10px] font-mono text-red-400">
                    API COSTS: CLIENT MANAGED
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
