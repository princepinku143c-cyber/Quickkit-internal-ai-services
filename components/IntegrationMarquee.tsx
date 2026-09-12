import React from 'react';

const TOOLS = [
  ['HubSpot', 'hubspot'], ['Salesforce', 'salesforce'], ['Gong', 'gong'], ['Slack', 'slack'],
  ['Telegram', 'telegram'], ['ChatGPT', 'openai'], ['Google Calendar', 'googlecalendar'], ['Hostinger', 'hostinger'],
  ['WhatsApp', 'whatsapp'], ['Google Ads', 'googleads'], ['Meta', 'meta']
];

export const IntegrationMarquee: React.FC = () => {
  const items = [...TOOLS, ...TOOLS];
  return (
    <section className="relative overflow-hidden border-y border-slate-800/80 bg-[#050912] py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.10),transparent_45%)] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.28em] text-blue-400">Your existing stack, connected</p>
          <h2 className="mt-3 text-2xl md:text-4xl font-black tracking-tight text-white">One AI Workforce. Your Tools.</h2>
          <p className="mt-3 text-sm md:text-base text-slate-500">QuickKit coordinates the workflow across the systems your sales team already uses.</p>
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max items-center gap-4 animate-[quickkit-marquee_34s_linear_infinite] hover:[animation-play-state:paused]">
            {items.map(([name, slug], i) => (
              <div key={`${name}-${i}`} className="group flex h-16 min-w-[150px] items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all hover:border-slate-600 hover:bg-slate-900">
                <img src={`https://cdn.simpleicons.org/${slug}`} alt={`${name} logo`} className="h-6 w-6 object-contain opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" loading="lazy" />
                <span className="text-sm font-bold text-slate-300 whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <span className="rounded-full border border-slate-800 px-3 py-1.5">Lead Capture</span>
          <span className="rounded-full border border-slate-800 px-3 py-1.5">Qualification</span>
          <span className="rounded-full border border-slate-800 px-3 py-1.5">Follow-up</span>
          <span className="rounded-full border border-slate-800 px-3 py-1.5">Site Visits</span>
          <span className="rounded-full border border-slate-800 px-3 py-1.5">CRM Sync</span>
        </div>
      </div>
      <style>{`@keyframes quickkit-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  );
};
