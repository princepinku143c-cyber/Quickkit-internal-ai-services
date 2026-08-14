import React, { useState } from 'react';
import { Check, X, Zap, ArrowRight, Star, Building2, Sparkles } from 'lucide-react';

interface PricingProps {
  lang?: string;
  onSelectPlan: (plan: string) => void;
}

const PLANS = [
  {
    id: 'GROWTH',
    badge: 'Growth System',
    color: 'blue',
    title: 'Growth AI System',
    monthly: 499,
    setup: 699,
    cta: 'Start Scaling',
    crmBadge: '⚡ Basic CRM Included',
    tagline: 'Built for growing businesses needing leads, follow-ups & automation.',
    features: [
      '2–3 AI Agents (Chatbot + Lead Gen + Follow-up)',
      'Lead Generation System',
      'Email Automation',
      'Basic CRM Dashboard',
      'Priority Support',
      'Premium AI Memory',
      'Security Layer Included',
      'AI Usage Included (Limit-Based)',
      'Smart Follow-up Automation',
      'Business Workflow Automation',
    ],
    notIncluded: ['Advanced Analytics Dashboard', 'Full CRM Access', 'Enterprise Infrastructure'],
  },
  {
    id: 'BUSINESS',
    badge: 'MOST POPULAR 🔥',
    color: 'purple',
    title: 'Business AI Automation',
    monthly: 999,
    setup: 1499,
    cta: 'Automate My Business',
    popular: true,
    crmBadge: '✅ Full CRM Included',
    tagline: 'Complete AI automation suite for scaling businesses.',
    features: [
      '3–6 AI Agents (Sales + CRM + Marketing + Support)',
      'Full CRM System Access',
      'WhatsApp + Email + Integrations',
      'Custom Automation Workflows',
      'Advanced Analytics Dashboard',
      'Advanced Premium Memory',
      'Advanced Security Layer',
      'Scalable AI Usage',
      'Team Workflow Automation',
      'Smart Lead Tracking',
      'Multi-Step Automation Systems',
    ],
    notIncluded: [],
  },
  {
    id: 'ENTERPRISE',
    badge: 'Custom',
    color: 'slate',
    title: 'Enterprise AI System',
    monthly: null,
    setup: 3000,
    cta: 'Book a Demo',
    crmBadge: '✅ Enterprise CRM Included',
    enterprise: true,
    tagline: 'Custom AI infrastructure for large-scale businesses & enterprise operations.',
    features: [
      '6–12+ Fully Custom AI Agents',
      'Unlimited Premium Memory',
      'Full Business Automation Suite',
      'Custom API Integrations',
      'Dedicated Private AI Deployment',
      'Enterprise-Level Security Layers',
      'Unlimited Scaling',
      'Fully Customizable CRM',
      'Advanced Analytics & Reporting',
      'Multi-Team Access Control',
      'AI Infrastructure Optimization',
      'Dedicated Priority Support',
      'Private Business AI Ecosystem',
    ],
    notIncluded: [],
  },
];

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  slate: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const checkColorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  slate: 'text-slate-400',
};

const btnColorMap: Record<string, string> = {
  emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  purple: 'bg-purple-600 hover:bg-purple-500 text-white',
  slate: 'bg-white hover:bg-slate-100 text-slate-900',
};

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-32 bg-nexus-dark relative border-t border-nexus-border overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">
            <Zap className="w-3 h-3" /> Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Choose Your AI Automation Plan
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Start with a simple AI assistant or scale to a <span className="text-white font-bold">fully automated business system.</span>
            <br />
            <span className="text-emerald-400 font-bold text-sm">You only pay after you see and approve the live demo. Zero risk.</span>
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] border p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.15)] md:-translate-y-4'
                  : plan.enterprise
                  ? 'bg-gradient-to-b from-slate-800/60 to-slate-950 border-slate-700 hover:border-slate-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" /> Most Popular
                </div>
              )}

              {/* Badge */}
              <div className="mb-5 mt-2">
                <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${colorMap[plan.color]}`}>
                  {plan.badge}
                </span>
                <h3 className="text-xl font-black text-white mt-4 leading-tight">{plan.title}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-slate-800">
                {plan.monthly !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${plan.monthly}</span>
                      <span className="text-slate-500 font-bold text-sm">/month</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                      + ${plan.setup.toLocaleString()} one-time setup
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">Custom</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                      Setup from ${plan.setup.toLocaleString()}+
                    </p>
                  </>
                )}
                <div className="mt-2">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                    {plan.crmBadge}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${checkColorMap[plan.color]}`} />
                    <p className="text-sm text-slate-300 leading-snug">{f}</p>
                  </div>
                ))}
                {plan.notIncluded?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 opacity-40">
                    <X className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                    <p className="text-sm text-slate-500 leading-snug line-through">{f}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-0.5 ${btnColorMap[plan.color]}`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Zero Risk Protocol */}
        <div className="max-w-5xl mx-auto bg-nexus-card border border-slate-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="lg:w-1/3">
              <Sparkles className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Zero-Risk Delivery Promise</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                All plans include <strong className="text-white">1 Month Free Maintenance</strong>. We build your system first — you pay only after approving the live demo.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">100% Satisfaction</p>
                <p className="text-xs text-slate-300">Don't approve? You owe us nothing.</p>
              </div>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Request & Scope', desc: 'Tell Kelly what you need. We analyze your business requirements.' },
                { step: '2', title: 'We Build the Demo', desc: 'Our team builds your custom AI system and shows you a live demo — completely free.' },
                { step: '3', title: 'Approve & Pay', desc: 'You love it → you pay → we hand over full access. That simple.' },
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

        {/* Enterprise note */}
        <div className="max-w-4xl mx-auto mt-10 p-6 rounded-2xl border border-slate-800 bg-[#0a0f1c] flex flex-col md:flex-row items-center gap-6">
          <Building2 className="w-8 h-8 text-slate-500 shrink-0" />
          <div>
            <h4 className="text-white font-bold mb-1">Need a custom enterprise solution?</h4>
            <p className="text-slate-400 text-sm">Our enterprise plans are fully custom-built. Pricing depends on scope, number of agents, and integration complexity. Email us at <span className="text-blue-400">sales@quickkitai.com</span> or book a demo above.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
