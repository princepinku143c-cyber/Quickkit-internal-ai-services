import React from 'react';

const ImpactCard = ({ title, desc, colorClass }: any) => (
  <div className="glass-card rounded-2xl p-8 text-center group hover:border-blue-500/20 transition-all">
    <div className={`mx-auto mb-6 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${colorClass}`}>
      <span className="text-2xl font-black">AI</span>
    </div>
    <h3 className={`text-lg font-bold mb-3 ${colorClass}`}>{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export const BusinessImpact: React.FC = () => (
  <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Business Impact</div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">What Your AI Workforce Can Automate</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-6" />
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Instead of promising arbitrary percentages, we show the actual work your configured agents can take over.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ImpactCard title="Lead Capture & Qualification" desc="Capture inbound enquiries, collect the required details, qualify leads and route them to the right workflow or human team member." colorClass="text-blue-400" />
        <ImpactCard title="CRM & Data Operations" desc="Create or update records, move leads through defined stages, trigger follow-ups and keep connected business systems in sync." colorClass="text-emerald-400" />
        <ImpactCard title="WhatsApp & Customer Communication" desc="Automate approved customer conversations, FAQs, follow-ups and routing where the required WhatsApp/API integrations are configured." colorClass="text-cyan-400" />
        <ImpactCard title="Voice & Appointment Workflows" desc="Support configured voice workflows such as reception, qualification, reminders or appointment routing when the required voice provider is connected." colorClass="text-amber-400" />
        <ImpactCard title="Email & Outreach" desc="Run configured email sequences, notifications, lead follow-ups and operational messages with appropriate provider limits and safeguards." colorClass="text-pink-400" />
        <ImpactCard title="Reports & Internal Workflows" desc="Collect information, trigger routine processes, generate summaries and route tasks across the connected systems your business uses." colorClass="text-purple-400" />
      </div>
    </div>
  </section>
);
