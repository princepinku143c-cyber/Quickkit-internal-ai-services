import React, { useState } from 'react';
import { Check, ArrowRight, Star, Sparkles, Server, Wrench, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { PlanTier } from '../types';
import { LeadForm } from './LeadForm';
import { MANAGED_SYSTEMS } from '../constants';

interface PricingProps { lang?: string; onSelectPlan: (plan: string) => void; }

const PLANS = [
  {
    id: 'KVM_4',
    badge: 'Best for growing teams',
    color: 'blue',
    title: 'KVM 4 AI System',
    setup: MANAGED_SYSTEMS.KVM4.setupINR,
    maintenance: MANAGED_SYSTEMS.KVM4.maintenanceINRPerMonthFromMonth2,
    popular: true,
    cta: 'Start with KVM 4',
    tagline: 'A managed AI foundation for teams starting serious automation.',
    infrastructure: 'KVM 4',
    features: ['Hermes-powered AI system setup', 'AI agent configuration & deployment', 'Memory and system configuration', 'Initial testing & optimization', 'First month managed operation included', 'AI/API usage billed separately by actual usage', 'From month 2: ₹15,000/month maintenance'],
  },
  {
    id: 'KVM_8',
    badge: 'Higher capacity',
    color: 'purple',
    title: 'KVM 8 AI System',
    setup: MANAGED_SYSTEMS.KVM8.setupINR,
    maintenance: MANAGED_SYSTEMS.KVM8.maintenanceINRPerMonthFromMonth2,
    popular: false,
    cta: 'Start with KVM 8',
    tagline: 'More headroom for larger workloads, more agents and heavier automation.',
    infrastructure: 'KVM 8',
    features: ['Hermes-powered AI system setup', 'AI agent configuration & deployment', 'Memory and system configuration', 'Initial testing & optimization', 'First month managed operation included', 'AI/API usage billed separately by actual usage', 'From month 2: ₹30,000/month maintenance'],
  },
];

const colorMap: Record<string, string> = { blue: 'text-blue-300 bg-blue-500/10 border-blue-500/30', purple: 'text-purple-300 bg-purple-500/10 border-purple-500/30' };
const checkColorMap: Record<string, string> = { blue: 'text-blue-400', purple: 'text-purple-400' };
const btnColorMap: Record<string, string> = { blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_35px_rgba(59,130,246,.25)]', purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_35px_rgba(168,85,247,.18)]' };

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);

  const choosePlan = (planId: string) => {
    onSelectPlan(planId);
    setSelectedPlan(planId === 'KVM_8' ? PlanTier.PRO : PlanTier.STARTER);
  };

  return (
  <>
  <section id="pricing" className="py-28 md:py-32 bg-nexus-dark relative border-t border-nexus-border overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-blue-600/6 blur-[120px] rounded-full pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 relative z-10">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-mono text-blue-300 mb-5 uppercase tracking-[.2em] font-black"><Sparkles className="w-3 h-3" /> Transparent India pricing</div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-[-.04em]">Start with the infrastructure. Scale the workforce.</h2>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">One-time setup for your managed AI system. The first month of managed operation is included. From month 2, maintenance is predictable; AI and third-party API usage stays separate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
        {PLANS.map(plan => <div key={plan.id} className={`relative flex flex-col rounded-[2rem] border p-7 md:p-8 transition-all duration-300 ${plan.popular ? 'bg-gradient-to-b from-blue-900/30 via-slate-950 to-slate-950 border-blue-400/45 shadow-[0_20px_80px_rgba(37,99,235,.12)] md:-translate-y-3' : 'bg-gradient-to-b from-purple-900/15 via-slate-950 to-slate-950 border-purple-400/25 hover:border-purple-400/40'}`}>
          {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[.18em] px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1.5"><Star className="w-3 h-3 fill-white" /> Recommended</div>}

          <div className="mb-7 mt-2">
            <span className={`text-[9px] font-black tracking-[.18em] uppercase px-3 py-1 rounded-full border ${colorMap[plan.color]}`}>{plan.badge}</span>
            <h3 className="text-2xl font-black text-white mt-5">{plan.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{plan.tagline}</p>
          </div>

          <div className="mb-6 pb-6 border-b border-white/7">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight text-white">₹{plan.setup.toLocaleString('en-IN')}</span>
              <span className="text-slate-500 font-bold text-xs pb-2">one-time setup</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Server className="w-4 h-4 text-slate-500" /> {plan.infrastructure} infrastructure</div>
            <div className="mt-4 rounded-xl border border-white/7 bg-white/[.02] p-3.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-black uppercase tracking-wider"><Wrench className="w-4 h-4 text-emerald-400" /> From month 2</div>
              <div className="text-white font-black text-lg mt-1">₹{plan.maintenance.toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-bold"> / month maintenance</span></div>
            </div>
          </div>

          <div className="flex-1 space-y-3 mb-8">{plan.features.map((f, i) => <div key={i} className="flex items-start gap-2.5"><Check className={`w-4 h-4 shrink-0 mt-0.5 ${checkColorMap[plan.color]}`} /><p className="text-sm text-slate-300 leading-snug">{f}</p></div>)}</div>

          <div className="mb-6 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2"><Cpu className="w-4 h-4" /> Usage billing</div>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">AI models and third-party APIs are separate and usage-based. Your actual cost depends on the services, providers and volume connected to the system.</p>
          </div>

          <button onClick={() => choosePlan(plan.id)} className={`w-full py-4 rounded-2xl font-black uppercase tracking-[.12em] text-xs transition-all active:scale-[.99] flex items-center justify-center gap-2 hover:-translate-y-0.5 ${btnColorMap[plan.color]}`}>{plan.cta} <ArrowRight className="w-4 h-4" /></button>
        </div>)}
      </div>

      <div className="max-w-5xl mx-auto rounded-[2rem] border border-white/8 bg-slate-950/60 p-7 md:p-10">
        <div className="grid md:grid-cols-3 gap-7">
          {[
            [Zap, '1. Setup', 'We configure the selected infrastructure, AI agents, memory and workflows.'],
            [ShieldCheck, '2. Verify', 'We test the configured workflow before treating the pilot as live.'],
            [Wrench, '3. Maintain', 'From month 2, ongoing monitoring and maintenance continue at the published rate.'],
          ].map(([Icon, title, desc]) => <div key={String(title)} className="relative">
            {React.createElement(Icon as React.ElementType, { className: 'w-7 h-7 text-blue-300 mb-4' })}
            <h4 className="text-white font-black mb-2">{String(title)}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{String(desc)}</p>
          </div>)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 p-5 rounded-2xl border border-slate-800 bg-[#0a0f1c] flex flex-col md:flex-row items-center gap-5">
        <Server className="w-7 h-7 text-slate-500 shrink-0" />
        <div><h4 className="text-white font-bold mb-1">Need a custom setup?</h4><p className="text-slate-500 text-sm">For workloads beyond KVM 4 or KVM 8, contact us for a custom infrastructure and maintenance quote.</p></div>
      </div>
    </div>
  </section>
  {selectedPlan && <LeadForm lang="en" close={() => setSelectedPlan(null)} initialData={{ bizType: '', plan: selectedPlan }} prefilledNotes={`I am interested in the ${selectedPlan === PlanTier.PRO ? 'KVM 8' : 'KVM 4'} managed AI system.`} />}
  </>
  );
};