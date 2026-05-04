import React from 'react';
import {
  Target, MessageCircle, TrendingUp, Megaphone,
  ShoppingCart, BarChart3, ArrowRight, ShieldCheck, Zap, Globe, Building2
} from 'lucide-react';

interface AIAgentsProps {
  onSelectAgent: (item: any) => void;
}

const ENTERPRISE_CATEGORIES = [
  {
    id: 'lead-gen',
    icon: Target,
    color: 'blue',
    badge: 'Starter Enterprise',
    title: 'Lead Generation',
    priceRange: '$2,000 – $4,000',
    description: 'Automated lead capture, qualification, and CRM routing — so your sales team only talks to ready-to-buy prospects.',
    useCases: ['Website chatbot lead capture', 'LinkedIn outreach automation', 'Lead scoring & qualification', 'CRM auto-population'],
  },
  {
    id: 'customer-support',
    icon: MessageCircle,
    color: 'emerald',
    badge: 'Most Used ⭐',
    title: 'Customer Support',
    priceRange: '$3,000 – $6,000',
    description: 'Deploy 24/7 AI support agents that handle tickets, answer FAQs, and escalate complex issues to your human team.',
    useCases: ['WhatsApp & chat support bot', 'Ticket routing & auto-reply', 'FAQ automation', 'Refund & order status handling'],
  },
  {
    id: 'sales-automation',
    icon: TrendingUp,
    color: 'purple',
    badge: 'High ROI 🔥',
    title: 'Sales Automation',
    priceRange: '$4,000 – $8,000',
    description: 'Automate your entire sales pipeline — from first touch to closed deal — with AI that follows up, books meetings, and nurtures leads.',
    useCases: ['Automated follow-up sequences', 'Meeting booking & calendar sync', 'Proposal & quote generation', 'Deal pipeline tracking'],
  },
  {
    id: 'marketing',
    icon: Megaphone,
    color: 'amber',
    badge: 'Popular',
    title: 'Marketing Automation',
    priceRange: '$3,000 – $7,000',
    description: 'Run smarter campaigns with AI that creates content, segments audiences, and optimizes ad spend without manual effort.',
    useCases: ['Email campaign automation', 'Social media scheduling', 'Ad performance reporting', 'Audience segmentation'],
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    color: 'cyan',
    badge: 'High ROI 🔥',
    title: 'E-commerce Automation',
    priceRange: '$4,000 – $9,000',
    description: 'Automate your online store operations — inventory updates, order processing, abandoned cart recovery, and customer follow-ups.',
    useCases: ['Abandoned cart recovery', 'Order status notifications', 'Inventory & stock sync', 'Customer review requests'],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: 'pink',
    badge: 'Starter Enterprise',
    title: 'Analytics & Reporting',
    priceRange: '$2,500 – $5,000',
    description: 'Get AI-generated business reports delivered to your inbox. No more manual data pulling — your AI does it automatically.',
    useCases: ['Automated weekly/monthly reports', 'KPI tracking dashboards', 'Sales performance alerts', 'Cross-platform data sync'],
  },
];

const colorVariants: Record<string, { border: string; icon: string; badge: string; priceBadge: string }> = {
  blue:    { border: 'hover:border-blue-500/40',    icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',    priceBadge: 'text-blue-300' },
  emerald: { border: 'hover:border-emerald-500/40', icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', priceBadge: 'text-emerald-300' },
  purple:  { border: 'hover:border-purple-500/40',  icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',  badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',  priceBadge: 'text-purple-300' },
  amber:   { border: 'hover:border-amber-500/40',   icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   priceBadge: 'text-amber-300' },
  cyan:    { border: 'hover:border-cyan-500/40',    icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',    priceBadge: 'text-cyan-300' },
  pink:    { border: 'hover:border-pink-500/40',    icon: 'bg-pink-500/10 text-pink-400 border-pink-500/20',    badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20',    priceBadge: 'text-pink-300' },
};

const dotColors: Record<string, string> = {
  blue: 'bg-blue-500', emerald: 'bg-emerald-500', purple: 'bg-purple-500',
  amber: 'bg-amber-500', cyan: 'bg-cyan-500', pink: 'bg-pink-500',
};

export const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent }) => {
  return (
    <section id="ai-agents" className="py-32 bg-[#030712] border-t border-slate-900 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/8 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 mb-8 uppercase tracking-[0.2em] font-black">
            <Building2 className="w-3 h-3" /> Enterprise AI Solutions
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter animate-slide-up">
            Enterprise AI Solutions
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-4">
            Custom-built AI systems for companies that need <span className="text-white font-bold">full automation at scale.</span> We handle everything — you focus on growing.
          </p>
          <p className="text-slate-500 text-sm italic">
            Pricing depends on business size, integrations, and automation complexity.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8 opacity-60 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise-Grade Security</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Zap className="w-4 h-4 text-blue-400" /> Rapid Deployment</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Globe className="w-4 h-4 text-indigo-400" /> Any Platform Integration</div>
          </div>
        </div>

        {/* 6 Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24 mt-16">
          {ENTERPRISE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const v = colorVariants[cat.color];
            return (
              <div
                key={cat.id}
                className={`group bg-[#080c14] border border-slate-800 ${v.border} rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col`}
              >
                {/* Badge */}
                <div className={`self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-5 ${v.badge}`}>
                  {cat.badge}
                </div>

                {/* Icon + Title */}
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${v.icon}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 leading-tight">{cat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{cat.description}</p>

                {/* Use Cases */}
                <div className="space-y-2 mb-6">
                  {cat.useCases.map((u, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-400">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[cat.color]}`} />
                      {u}
                    </div>
                  ))}
                </div>

                {/* Pricing & CTA */}
                <div className="border-t border-slate-800 pt-5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Setup Investment</p>
                  <p className={`text-xl font-black mb-4 ${v.priceBadge}`}>{cat.priceRange}</p>
                  <button
                    onClick={() => onSelectAgent({ id: cat.id, name: cat.title, outcome: cat.description })}
                    className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-700 text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                  >
                    Book a Free Demo <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Done-For-You AI Systems */}
        <div className="border-t border-slate-900 pt-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 mb-6 uppercase tracking-[0.2em] font-black">
              <Zap className="w-3 h-3" /> Done-For-You
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Done-For-You AI Systems</h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Fully built AI systems tailored to your business needs. We handle everything end-to-end.
            </p>
            <p className="text-slate-500 text-sm italic mt-2">Pricing depends on business complexity and integration requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Starter AI System',
                subtitle: 'Launch Your AI-Powered Business',
                desc: 'Launch your AI-powered business system with automated chat, lead capture, and follow-ups.',
                price: '$999 – $2,000',
                badge: null,
                cta: 'Get Started',
                features: [
                  'AI Chat System (Customer replies + lead capture)',
                  'Lead Capture Setup',
                  'Email Automation',
                  'Basic Automation Workflows',
                  '2 weeks support',
                ],
              },
              {
                title: 'Growth AI System',
                subtitle: 'Most Popular 🔥',
                desc: 'Turn your business into a lead-generating machine with automation, CRM, and follow-up systems.',
                price: '$2,500 – $5,000',
                badge: 'Most Popular 🔥',
                cta: 'Start Scaling',
                features: [
                  'Lead Generation System',
                  'Follow-up Automation',
                  'CRM Integration',
                  'Marketing Automation',
                  'Analytics Dashboard',
                  '1-month support',
                ],
              },
              {
                title: 'Full AI Business System',
                subtitle: 'Complete Business Automation',
                desc: 'Fully automate your sales, marketing, support, and operations with an AI-powered system.',
                price: '$5,000 – $12,000+',
                badge: null,
                cta: 'Automate My Business',
                features: [
                  'Sales Automation System',
                  'Customer Support Automation',
                  'Marketing Automation',
                  'Full CRM System',
                  'Custom Integrations',
                  '2–3 months support',
                ],
              },
            ].map((bundle, idx) => (
              <div
                key={idx}
                className={`relative bg-[#080c14] border rounded-[2.5rem] p-10 transition-all hover:shadow-xl group ${bundle.badge ? 'border-blue-500/40 bg-gradient-to-b from-blue-900/20 to-[#080c14]' : 'border-slate-800 hover:border-slate-600'}`}
              >
                {bundle.badge && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-blue-400 shadow-xl whitespace-nowrap">
                    {bundle.badge}
                  </div>
                )}
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mt-4">{bundle.subtitle}</p>
                <h4 className="text-xl font-black text-white mb-3">{bundle.title}</h4>
                <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-800/50 leading-relaxed">{bundle.desc}</p>

                <div className="space-y-2.5 mb-8">
                  {bundle.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Investment Range</p>
                  <p className="text-xl font-black text-white mb-4">{bundle.price}</p>
                  <button
                    onClick={() => onSelectAgent({ id: `bundle-${idx}`, name: bundle.title, outcome: bundle.desc })}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${bundle.badge ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'bg-white hover:bg-slate-100 text-slate-900'}`}
                  >
                    {bundle.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
