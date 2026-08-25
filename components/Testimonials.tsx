import React from 'react';
import { CheckCircle2, Bot, BarChart3, Workflow } from 'lucide-react';

export const Testimonials: React.FC = () => (
  <section className="py-32 bg-[#030712] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 mb-8 uppercase tracking-[0.2em] font-black"><CheckCircle2 className="w-3 h-3" /> Real Systems. Real Workflows.</div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">See What We Actually Build</h2>
        <p className="text-slate-400 text-lg leading-relaxed">We will publish verified client case studies as they become available. Until then, explore the types of systems QuickKitAI can configure and manage for your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl">
          <Bot className="w-8 h-8 text-blue-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">AI Agent Workforce</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Configure specialized agents for lead handling, customer communication, research, operations and other defined workflows.</p>
        </div>
        <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl">
          <Workflow className="w-8 h-8 text-purple-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">Connected Automations</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Connect the tools your business already uses and automate repeatable processes across CRM, messaging, email and other supported APIs.</p>
        </div>
        <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl">
          <BarChart3 className="w-8 h-8 text-emerald-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">Operational Visibility</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Monitor configured workflows, usage and system status so your team can see what the AI workforce is doing and where human attention is needed.</p>
        </div>
      </div>
    </div>
  </section>
);
