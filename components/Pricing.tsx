import React from 'react';
import { Language } from '../types';
import { Check, Info, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

interface PricingProps {
  lang: Language;
}

export const Pricing: React.FC<PricingProps> = ({ lang }) => {
  return (
    <section id="pricing" className="py-32 bg-nexus-dark relative border-t border-nexus-border">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">
            <Zap className="w-3 h-3" /> Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Simple, Predictable Investment</h2>
          <p className="text-slate-400 text-lg">
            No messy tiers or hidden fees. You pay for the initial build and a simple monthly retainer so we can keep your internal systems running perfectly.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 mb-20 animate-slide-up [animation-delay:200ms]">
          <div className="relative flex flex-col md:flex-row rounded-[2.5rem] border border-blue-500 bg-slate-900 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
            
            {/* Left: Financials */}
            <div className="md:w-5/12 p-8 md:p-12 bg-nexus-card border-r border-slate-800 flex flex-col justify-center text-center">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">One-time Build</p>
                <div className="text-4xl md:text-5xl font-black text-white">Setup Fee</div>
                <p className="text-sm text-slate-400 mt-2 italic">Based on service selected in catalog</p>
              </div>

              <div className="h-[1px] w-full bg-slate-800 my-6"></div>

              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-500/70 font-black mb-2">Ongoing Retainer</p>
                <div className="text-3xl md:text-4xl font-black text-emerald-400">Monthly Maintenance</div>
                <p className="text-sm text-slate-400 mt-2 italic">Based on system complexity</p>
              </div>
            </div>

            {/* Right: Value */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl mb-8 flex flex-col items-start gap-4">
                 <div className="flex items-center gap-3 w-full">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                    <h4 className="text-emerald-400 font-black text-xl mb-1 uppercase tracking-widest">Risk-Free Onboarding</h4>
                 </div>
                 <div className="space-y-2 mt-2">
                    <p className="text-lg text-white font-bold inline-flex items-center gap-2"><Check className="text-emerald-400 w-5 h-5"/> First 30 days FREE support & optimization included</p>
                    <p className="text-sm text-slate-400">We set everything up for you, manage it, and optimize it continuously. No risk, just results.</p>
                 </div>
              </div>

              <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">What's Included Monthly:</h4>
              <ul className="space-y-3 mb-8">
                {["24/7 Monitoring & Uptime", "Proactive Bug Fixing", "Minor Flow Updates & Tweaks", "Continuous AI Agent Tuning", "Priority Email Support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-md">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 flex flex-col md:flex-row items-start gap-8 animate-slide-up [animation-delay:400ms]">
           <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-400" />
           </div>
           <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">Third-Party Costs Are Not Included</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                You will own all your digital real estate. Any third-party software costs must be paid directly by you to the provider. We do not markup software costs.
              </p>
              <div className="flex flex-wrap gap-3">
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">API Charges (OpenAI/Gemini)</div>
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">HubSpot / CRM Subscriptions</div>
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">Twilio / WhatsApp Charges</div>
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">Email Platforms (GWorkspace)</div>
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">VPS/Hosting (If needed)</div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
