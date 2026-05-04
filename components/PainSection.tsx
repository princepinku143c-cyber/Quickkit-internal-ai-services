import React from 'react';
import { MessageSquare, UserCheck, RefreshCw, Clock, ArrowDown } from 'lucide-react';

export const PainSection: React.FC = () => {
  const pains = [
    { icon: MessageSquare, text: 'Manually replying to every customer message', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: UserCheck, text: 'Chasing leads one by one via email or WhatsApp', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: RefreshCw, text: 'Doing follow-ups by hand every single day', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Clock, text: 'Wasting hours on tasks that never grow your revenue', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <section className="py-24 bg-[#030712] border-t border-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400 mb-6 uppercase tracking-[0.2em] font-black">
            ⚠️ Sound familiar?
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Still Doing This <span className="text-red-400">Manually?</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every hour you spend on repetitive tasks is an hour <strong className="text-white">not spent growing your business.</strong>
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {pains.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-4 p-6 bg-slate-950/50 border border-red-500/10 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <p className="text-slate-300 font-medium text-lg">❌ {p.text}</p>
              </div>
            );
          })}
        </div>

        {/* Arrow down to solution */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">There's a better way</p>
            <ArrowDown className="w-8 h-8 text-blue-400 animate-bounce" />
            <div className="px-8 py-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
              <p className="text-blue-300 font-bold text-lg">
                ✅ QuickKit AI replaces all of this — automatically, 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
