import React from 'react';
import { Bot, CalendarDays, Database, Globe2, Mail, MessageCircle, Network, Phone, Workflow, Zap } from 'lucide-react';

const TOOLS = [
  [MessageCircle, 'WhatsApp', 'Messaging'],
  [Database, 'CRM', 'Pipeline + records'],
  [CalendarDays, 'Google Calendar', 'Appointments'],
  [Mail, 'Email', 'Sequences + alerts'],
  [Globe2, 'Web Forms', 'Lead intake'],
  [Zap, 'AI Models', 'Reasoning + content'],
  [Workflow, 'n8n / Webhooks', 'Orchestration'],
  [Phone, 'Voice / Telephony', 'Calls + routing'],
  [Network, 'Business APIs', 'Custom actions'],
  [Bot, 'AI Agents', 'Task ownership'],
];

export const IntegrationMarquee: React.FC = () => {
  const items = [...TOOLS, ...TOOLS];
  return (
    <section className="relative overflow-hidden border-y border-white/6 bg-[#050912] py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,.10),transparent_48%)] pointer-events-none" />
      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <p className="text-[10px] font-mono font-black uppercase tracking-[.3em] text-blue-300">Connect the stack you already use</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-[-.035em] text-white">One workforce. Many systems.</h2>
          <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl mx-auto">QuickKit can orchestrate connected messaging, CRM, calendars, forms, APIs and AI services. Exact integrations are configured and verified per client.</p>
        </div>

        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
          <div className="flex w-max items-stretch gap-4 animate-[quickkit-marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
            {items.map(([Icon, name, desc], i) => (
              <div key={`${String(name)}-${i}`} className="group flex h-20 min-w-[190px] items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/85 px-5 shadow-[0_12px_40px_rgba(0,0,0,.18)] hover:border-blue-500/25 hover:bg-slate-900 transition-all">
                {React.createElement(Icon as React.ElementType, { className:'w-6 h-6 text-slate-300 group-hover:text-blue-300 transition-colors shrink-0' })}
                <div><div className="text-sm font-black text-white whitespace-nowrap">{String(name)}</div><div className="text-[10px] text-slate-600 mt-1 whitespace-nowrap">{String(desc)}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {['Lead capture','AI qualification','WhatsApp','Voice','Follow-up','Site visits','CRM sync','Human escalation'].map(item => (
            <span key={item} className="rounded-full border border-slate-800 bg-slate-950/70 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">{item}</span>
          ))}
        </div>
        <p className="mt-5 text-center text-[10px] font-mono uppercase tracking-widest text-slate-700">Availability depends on client accounts, provider access, API limits and workflow configuration.</p>
      </div>
      <style>{`@keyframes quickkit-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  );
};