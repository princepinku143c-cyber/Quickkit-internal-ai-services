import React from 'react';
import {
  ArrowRight, BarChart3, Bot, CalendarCheck, CheckCircle2, Database,
  MessageCircle, QrCode, Server, ShieldCheck, Sparkles, Workflow, Zap
} from 'lucide-react';
import { Language } from '../types';
import { WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

interface HeroProps { lang: Language; onLaunchArchitect: (prompt: string) => void; }

const workflow = [
  { icon: Bot, label: 'Capture', value: 'New lead' },
  { icon: Sparkles, label: 'Qualify', value: 'AI scoring' },
  { icon: MessageCircle, label: 'Follow up', value: 'WhatsApp' },
  { icon: CalendarCheck, label: 'Book', value: 'Site visit' },
  { icon: Database, label: 'Sync', value: 'CRM' },
];

export const Hero: React.FC<HeroProps> = () => {
  const openWhatsApp = () => {
    const text = encodeURIComponent(
      'Hi, I want to explore a managed AI workforce for my business. Please show me the lead, WhatsApp, CRM and site-visit automation options.'
    );
    window.open(`${WHATSAPP_DIRECT_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openWhatsAppQR = () => window.open('/quickkit-ai-whatsapp-qr.svg', '_blank', 'noopener,noreferrer');

  const tryWithChatGPT = () => {
    const prompt = encodeURIComponent(
      'I am evaluating QuickKit AI for an Indian business. Explain its managed AI workforce, real-estate automation capabilities, lead qualification, WhatsApp follow-up, CRM, site-visit workflows, published KVM pricing, setup, maintenance and AI/API usage. Use https://quickkitai.com as the primary source and clearly separate verified information from inference.'
    );
    window.open(`https://chatgpt.com/?q=${prompt}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="hero" className="relative min-h-[94vh] flex items-center overflow-hidden bg-nexus-dark pt-28 pb-16">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(96,165,250,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.8) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-blue-600/12 blur-[150px] pointer-events-none" />
      <div className="absolute right-[-180px] bottom-[-180px] w-[520px] h-[520px] rounded-full bg-emerald-500/7 blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 xl:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-emerald-300 mb-7">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Managed AI Workforce · India
            </div>

            <div className="text-xs md:text-sm font-black tracking-[.38em] text-slate-500 uppercase mb-5">QUICKKIT AI</div>

            <h1 className="text-5xl sm:text-6xl xl:text-[76px] font-black leading-[.94] tracking-[-.055em] text-white max-w-4xl">
              Your business,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-emerald-300">with an AI team behind it.</span>
            </h1>

            <p className="mt-7 text-lg md:text-xl leading-relaxed text-slate-400 max-w-2xl">
              We build and manage AI teammates that capture leads, qualify buyers, follow up, move CRM records, coordinate appointments and keep revenue workflows moving.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {['Lead qualification', 'WhatsApp workflows', 'CRM automation', 'Site visits', 'Managed operations'].map(item => (
                <span key={item} className="rounded-full border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs font-bold text-slate-300">{item}</span>
              ))}
            </div>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="group rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[.14em] text-slate-950 shadow-[0_0_60px_rgba(255,255,255,.10)] transition-all hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Build My AI Workforce <ArrowRight className="inline w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={openWhatsApp}
                className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-6 py-4 text-sm font-black uppercase tracking-[.14em] text-emerald-300 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/10"
              >
                <MessageCircle className="inline w-4 h-4 mr-2" /> Talk on WhatsApp
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <button onClick={tryWithChatGPT} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 font-bold text-slate-300 hover:border-blue-500/40">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Ask ChatGPT about QuickKit
              </button>
              <button onClick={openWhatsAppQR} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 font-bold text-slate-300 hover:border-emerald-500/40">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Scan WhatsApp
              </button>
              <span>Direct: @{WHATSAPP_USERNAME}</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/5 pt-6">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Managed & monitored</div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500"><Server className="w-4 h-4 text-blue-400" /> Your infrastructure</div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500"><Workflow className="w-4 h-4 text-purple-400" /> Connected workflows</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/8 blur-3xl pointer-events-none" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,.45)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400/70"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"/></div>
                  <span className="text-xs font-mono font-bold text-slate-500">QUICKKIT AI · WORKFORCE CONTROL</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Online</span>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-blue-400/15 bg-blue-400/5 p-4">
                    <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-widest text-slate-500">Lead flow</span><Zap className="w-4 h-4 text-blue-400"/></div>
                    <div className="text-2xl font-black text-white mt-2">24/7</div>
                    <div className="text-[10px] text-slate-500 mt-1">automated response layer</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                    <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-widest text-slate-500">Workflow</span><CheckCircle2 className="w-4 h-4 text-emerald-400"/></div>
                    <div className="text-2xl font-black text-white mt-2">Verified</div>
                    <div className="text-[10px] text-slate-500 mt-1">external action, not just text</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div><div className="text-sm font-black text-white">Lead → Revenue Workflow</div><div className="text-[10px] text-slate-500 mt-1">Example managed real-estate journey</div></div>
                    <BarChart3 className="w-5 h-5 text-indigo-400"/>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {workflow.map(({ icon: Icon, label, value }, index) => (
                      <div key={label} className="relative">
                        <div className="rounded-xl border border-white/8 bg-slate-900/70 p-2.5 h-full">
                          <Icon className="w-4 h-4 text-blue-300 mb-2" />
                          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
                          <div className="text-[10px] font-bold text-slate-200 mt-1">{value}</div>
                        </div>
                        {index < workflow.length - 1 && <div className="hidden xl:block absolute -right-2 top-1/2 w-2 h-px bg-blue-400/40" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ['CRM', 'Synced', Database],
                    ['WhatsApp', 'Ready to configure', MessageCircle],
                    ['Site visit', 'Book + remind', CalendarCheck],
                  ].map(([title, value, Icon]) => (
                    <div key={String(title)} className="rounded-xl border border-white/7 bg-white/[.02] p-3">
                      <Icon className="w-4 h-4 text-slate-400 mb-2" />
                      <div className="text-[9px] uppercase tracking-widest text-slate-600">{String(title)}</div>
                      <div className="text-[10px] font-bold text-slate-300 mt-1">{String(value)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-[10px] leading-relaxed text-slate-400">
                  <span className="font-black text-amber-300">TRUTH LAYER:</span> External integrations are configured per client. Production delivery is verified during the pilot before it is labelled live.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
