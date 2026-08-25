import React from 'react';
import { Check, ArrowRight, Star, Sparkles, Server, Wrench, Cpu } from 'lucide-react';

interface PricingProps {
  lang?: string;
  onSelectPlan: (plan: string) => void;
}

const PLANS = [
  {
    id: 'KVM_4',
    badge: 'Launch Offer',
    color: 'blue',
    title: 'KVM 4 AI System',
    setup: 19999,
    maintenance: 15000,
    popular: true,
    cta: 'Choose KVM 4',
    tagline: 'Complete managed AI system setup for growing Indian businesses.',
    infrastructure: 'KVM 4',
    features: [
      'Full Hermes AI system setup',
      'AI agent configuration & deployment',
      'Memory and system configuration',
      'Initial system testing & optimization',
      '1–2 months initial managed operation included',
      'AI/API usage billed separately by actual usage',
      'Ongoing maintenance: ₹15,000/month after included operation period',
    ],
  },
  {
    id: 'KVM_8',
    badge: 'Launch Offer',
    color: 'purple',
    title: 'KVM 8 AI System',
    setup: 39999,
    maintenance: 30000,
    popular: false,
    cta: 'Choose KVM 8',
    tagline: 'Higher-capacity managed AI infrastructure for larger workloads.',
    infrastructure: 'KVM 8',
    features: [
      'Full Hermes AI system setup',
      'AI agent configuration & deployment',
      'Memory and system configuration',
      'Initial system testing & optimization',
      '1–2 months initial managed operation included',
      'AI/API usage billed separately by actual usage',
      'Ongoing maintenance: ₹30,000/month after included operation period',
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

const checkColorMap: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
};

const btnColorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  purple: 'bg-purple-600 hover:bg-purple-500 text-white',
};

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-32 bg-nexus-dark relative border-t border-nexus-border overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">
            <Sparkles className="w-3 h-3" /> India Launch Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Managed AI System Setup
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the infrastructure level that fits your business. <span className="text-white font-bold">Setup is paid once.</span>
            <br />
            <span className="text-emerald-400 font-bold text-sm">Initial 1–2 months of managed operation are included at no extra management fee.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] border p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.15)] md:-translate-y-4'
                  : 'bg-gradient-to-b from-purple-900/20 to-slate-950 border-purple-500/30 hover:border-purple-500/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" /> Recommended
                </div>
              )}

              <div className="mb-6 mt-2">
                <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${colorMap[plan.color]}`}>
                  {plan.badge}
                </span>
                <h3 className="text-2xl font-black text-white mt-5 leading-tight">{plan.title}</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{plan.tagline}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{plan.setup.toLocaleString('en-IN')}</span>
                  <span className="text-slate-500 font-bold text-sm">one-time setup</span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-2 uppercase tracking-widest">
                  {plan.infrastructure} infrastructure • Managed launch offer
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                      <Server className="w-4 h-4" /> Setup
                    </div>
                    <div className="text-white font-black text-lg mt-1">₹{plan.setup.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                      <Wrench className="w-4 h-4" /> Maintenance
                    </div>
                    <div className="text-white font-black text-lg mt-1">₹{plan.maintenance.toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-bold">/month</span></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${checkColorMap[plan.color]}`} />
                    <p className="text-sm text-slate-300 leading-snug">{f}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Cpu className="w-4 h-4" /> Usage Billing
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  AI/API usage is <span className="text-white font-bold">separate and usage-based</span>. Typical usage starts around <span className="text-white font-bold">₹5,000–₹10,000+</span> depending on the services and volume used.
                </p>
              </div>

              <button
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-0.5 ${btnColorMap[plan.color]}`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto bg-nexus-card border border-slate-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="lg:w-1/3">
              <Sparkles className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Included Initial Operation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your first <strong className="text-white">1–2 months of managed operation</strong> are included with the setup offer. We operate, monitor and optimize the system so you can validate it in real use.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">No Extra Operation Fee</p>
                <p className="text-xs text-slate-300">AI/API usage remains separate and is billed according to actual consumption.</p>
              </div>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Setup', desc: 'We configure the selected KVM infrastructure and the complete Hermes-powered AI system.' },
                { step: '2', title: 'Operate', desc: 'We run and monitor the system during the included 1–2 month initial operation period.' },
                { step: '3', title: 'Maintain', desc: 'After the included period, ongoing maintenance starts at ₹15,000/month or ₹30,000/month depending on KVM.' },
              ].map(s => (
                <div key={s.step} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center mb-4 absolute -top-4 -left-4 border border-slate-700 shadow-xl">
                    {s.step}
                  </div>
                  <h4 className="text-white font-bold mb-2 mt-2">{s.title}</h4>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-10 p-6 rounded-2xl border border-slate-800 bg-[#0a0f1c] flex flex-col md:flex-row items-center gap-6">
          <Server className="w-8 h-8 text-slate-500 shrink-0" />
          <div>
            <h4 className="text-white font-bold mb-1">Need a custom setup?</h4>
            <p className="text-slate-400 text-sm">For workloads beyond KVM 4 or KVM 8, contact us for a custom infrastructure and maintenance quote.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
