import React from 'react';
import { Mail, ArrowRight, Video, Target, ShieldCheck, Zap } from 'lucide-react';

export const WhyQuickKit: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Why QuickKit AI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">
            Why 600+ Businesses Choose Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom-Built, Not Template</h3>
            <p className="text-slate-400 leading-relaxed">
              Every agent is designed specifically for YOUR business. No cookie-cutter solutions — we study your workflow and build exactly what you need.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <Video size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Strategy Call Before Payment</h3>
            <p className="text-slate-400 leading-relaxed">
              We don't take money first. You get a <strong className="text-white">free demo + Zoom call</strong> to understand exactly what you're getting. Full transparency — zero risk.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Error-Free Execution</h3>
            <p className="text-slate-400 leading-relaxed">
              Our AI agents are tested rigorously before deployment. No bugs, no data leaks, no mistakes. Your operations run <strong className="text-white">flawlessly 24/7</strong>.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning-Fast Delivery</h3>
            <p className="text-slate-400 leading-relaxed">
              Most agencies take months. We deliver your first working agent in <strong className="text-white">5-7 days</strong>. Your competitors won't know what hit them.
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">🤖 Want to Learn How AI Works?</h3>
            <p className="text-slate-300">
              Not sure if AI is right for your business? Send us a quick email describing your workflow and we'll send you a <strong className="text-white">free analysis</strong> of what can be automated — no strings attached.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto relative z-10 text-center">
            <a 
              href="mailto:sales@quickkit.online?subject=I%20want%20to%20learn%20about%20AI%20Automation&body=Hi%20QuickKit%20Team%2C%0A%0AI%20want%20to%20learn%20how%20AI%20automation%20can%20help%20my%20business.%0A%0AMy%20business%20is%20about%3A%20%0A%0AThanks!" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <Mail size={20} />
              Email Us to Learn More
            </a>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
            >
              Request Custom Demo
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
