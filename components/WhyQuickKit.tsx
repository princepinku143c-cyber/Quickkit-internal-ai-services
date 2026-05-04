import React from 'react';
import { Mail, ArrowRight, Bot, Clock, ShieldCheck, Zap, Target, Video } from 'lucide-react';

export const WhyQuickKit: React.FC = () => {
  const reasons = [
    {
      icon: Target,
      color: 'blue',
      title: 'Built For YOUR Business — Not a Template',
      desc: 'Every AI system is designed specifically for your workflow. We study how your business works and build exactly what you need. No generic tools.',
    },
    {
      icon: Video,
      color: 'emerald',
      title: 'See It Live Before You Pay a Penny',
      desc: 'We build your demo first — completely free. You see exactly what you\'re getting on a live call. Zero risk. Full transparency.',
    },
    {
      icon: Bot,
      color: 'purple',
      title: 'AI That Works Like Real Employees',
      desc: 'Our AI systems reply to customers, follow up leads, update your CRM, and handle support — just like a trained team member, but without the salary.',
    },
    {
      icon: Clock,
      color: 'amber',
      title: 'Runs Automatically 24/7',
      desc: 'Your business doesn\'t stop at 5pm. Neither does your AI. It handles messages, leads, and operations around the clock without supervision.',
    },
    {
      icon: ShieldCheck,
      color: 'cyan',
      title: 'Error-Free. Reliable. Tested.',
      desc: 'Every system is rigorously tested before handover. No bugs, no data leaks, no mistakes. Just smooth, flawless execution.',
    },
    {
      icon: Zap,
      color: 'pink',
      title: 'Delivered in Days, Not Months',
      desc: 'Other agencies take months. We deliver your first working AI system in 5–7 days. Your competitors won\'t see it coming.',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    pink: 'bg-pink-500/10 text-pink-400',
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Why QuickKit AI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 mt-4">
            Why 600+ Businesses Choose Us
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We don't just build AI tools. We build AI systems that <span className="text-white font-bold">actually run your business.</span>
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
                <div className={`w-12 h-12 rounded-xl ${colorMap[r.color]} flex items-center justify-center mb-5`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{r.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{r.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

          <div className="flex-1 relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-3">🤖 Not Sure If AI Is Right for You?</h3>
            <p className="text-slate-300">
              Send us a quick message describing your business and we'll send you a <strong className="text-white">free automation analysis</strong> — no strings attached.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto relative z-10 text-center">
            <a
              href="mailto:sales@quickkitai.com?subject=Free%20Automation%20Analysis%20Request&body=Hi%20QuickKit%20Team%2C%0A%0AMy%20business%20does%3A%20%0A%0AI%20want%20to%20automate%3A%20%0A%0AThanks!"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <Mail size={18} />
              Email Us for Free Analysis
            </a>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
            >
              Book a Free Demo
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
