import React from 'react';
import { Building2, Code2, ShoppingBag, Users, Mic2, BarChart, ArrowRight } from 'lucide-react';

const WHO_FOR = [
  {
    icon: Building2,
    color: 'blue',
    title: 'Agencies',
    desc: 'Automate client onboarding, reporting, and follow-ups. Deliver more without hiring.',
    example: '"We saved 20 hrs/week on client communication."',
  },
  {
    icon: Code2,
    color: 'purple',
    title: 'SaaS Founders',
    desc: 'Automate user onboarding, churn prevention emails, and support tickets at scale.',
    example: '"Our trial-to-paid conversion jumped 40%."',
  },
  {
    icon: ShoppingBag,
    color: 'emerald',
    title: 'E-commerce Stores',
    desc: 'Recover abandoned carts, send order updates, and automate customer reviews.',
    example: '"Cart recovery automated. Revenue up 30%."',
  },
  {
    icon: Mic2,
    color: 'amber',
    title: 'Coaches & Consultants',
    desc: 'Automate booking, follow-ups, course delivery, and client check-ins.',
    example: '"I closed 3x more clients with zero extra work."',
  },
  {
    icon: Users,
    color: 'cyan',
    title: 'Service Businesses',
    desc: 'Handle inquiries, schedule appointments, send reminders — all on autopilot.',
    example: '"Our no-show rate dropped by 65%."',
  },
  {
    icon: BarChart,
    color: 'pink',
    title: 'Growing SMBs',
    desc: 'Replace manual work with AI systems that scale as your business grows.',
    example: '"We run 5x more operations with the same team."',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

interface WhoIsItForProps {
  onBookDemo: () => void;
}

export const WhoIsItFor: React.FC<WhoIsItForProps> = ({ onBookDemo }) => {
  return (
    <section className="py-24 bg-nexus-dark border-t border-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 mb-6 uppercase tracking-[0.2em] font-black">
            🎯 Who This Is For
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Built For <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Businesses Like Yours</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Whether you're a solo founder or a 50-person team, QuickKit AI eliminates the busywork so you can focus on what matters.
          </p>
          <p className="text-emerald-400 font-bold text-sm mt-3 uppercase tracking-widest">
            Save 10+ hours/week · Increase leads by 2–3x
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {WHO_FOR.map((item, i) => {
            const Icon = item.icon;
            const c = colorMap[item.color];
            return (
              <div key={i} className={`p-7 bg-slate-950/50 border border-slate-800 hover:border-slate-600 rounded-2xl transition-all hover:shadow-lg group`}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${c}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <p className="text-xs text-slate-600 italic border-l-2 border-slate-800 pl-3">{item.example}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onBookDemo}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            See If This Works For My Business <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-slate-600 text-xs mt-4 uppercase tracking-widest font-bold">Free demo · No credit card · 48-hr delivery</p>
        </div>
      </div>
    </section>
  );
};
