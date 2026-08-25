import React from 'react';
import { Mail, ArrowRight, Bot, Clock, ShieldCheck, Target, Video, Server } from 'lucide-react';

export const WhyQuickKit: React.FC = () => {
  const reasons = [
    { icon: Target, color: 'blue', title: 'Built For Your Business', desc: 'We design the agent workflows around your real processes instead of forcing your business into a generic template.' },
    { icon: Video, color: 'emerald', title: 'See the System Before Deployment', desc: 'Start with a live discussion and workflow walkthrough so you understand what will be built before your system goes into production.' },
    { icon: Bot, color: 'purple', title: 'AI Agents That Execute Work', desc: 'Agents can qualify leads, respond to customers, update connected systems, route tasks and run repeatable business workflows.' },
    { icon: Clock, color: 'amber', title: 'Designed for 24/7 Operation', desc: 'Once deployed, your configured workflows can keep running beyond normal business hours without requiring someone to manually trigger every step.' },
    { icon: ShieldCheck, color: 'cyan', title: 'Tested Before Handover', desc: 'We validate the configured workflows and integrations before the system is handed over for production use. No unrealistic error-free promises.' },
    { icon: Server, color: 'pink', title: 'Managed Infrastructure', desc: 'QuickKitAI handles the configured server environment, monitoring and maintenance so you do not have to become an infrastructure expert.' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400', emerald: 'bg-emerald-500/10 text-emerald-400', purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400', cyan: 'bg-cyan-500/10 text-cyan-400', pink: 'bg-pink-500/10 text-pink-400',
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> Why QuickKitAI</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 mt-4">We Build It. We Deploy It. We Manage It.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">QuickKitAI is a managed AI systems service — not just another software dashboard. <span className="text-white font-bold">You get the automation without the infrastructure headache.</span></p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
              <div className={`w-12 h-12 rounded-xl ${colorMap[r.color]} flex items-center justify-center mb-5`}><Icon size={22} /></div>
              <h3 className="text-lg font-bold text-white mb-3">{r.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{r.desc}</p>
            </div>;
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-3">Not Sure What to Automate?</h3>
            <p className="text-slate-300">Tell us what your team does manually. We can map the workflow, identify suitable AI agents and recommend the right managed system.</p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto relative z-10 text-center">
            <a href="mailto:admin@quickkitai.com?subject=AI%20Automation%20Analysis" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] cyber-glow"><Mail size={18} /> Request an Analysis</a>
            <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all">Book a Demo <ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
};
