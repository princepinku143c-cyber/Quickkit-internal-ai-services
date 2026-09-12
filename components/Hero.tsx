import React from 'react';
import { ShieldCheck, Server, Bot, ArrowRight, MessageCircle, QrCode, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

interface HeroProps { lang: Language; onLaunchArchitect: (prompt: string) => void; }

export const Hero: React.FC<HeroProps> = () => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi, I want to automate my real estate sales process with AI. I need help with property leads, WhatsApp follow-ups, AI calling, site-visit booking and CRM automation.');
    window.open(`${WHATSAPP_DIRECT_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openWhatsAppQR = () => window.open('/quickkit-ai-whatsapp-qr.svg', '_blank', 'noopener,noreferrer');

  const tryWithChatGPT = () => {
    const prompt = encodeURIComponent('I am evaluating QuickKit AI for my real estate business in India. Explain what QuickKit AI offers for property lead generation, lead qualification, WhatsApp follow-up, AI calling, site-visit booking, CRM automation, managed AI teammates, pricing, setup, maintenance, AI/API usage and how I can get started. Use the information available on https://quickkitai.com and clearly separate verified website information from anything you infer.');
    window.open(`https://chatgpt.com/?q=${prompt}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 overflow-hidden bg-nexus-dark">
      <div className="absolute inset-0 opacity-[0.045] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[820px] h-[460px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[680px] h-[220px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/8 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 mb-7 tracking-[0.22em] uppercase font-black"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Managed AI Teammates for Real Estate in India</div>
        <p className="text-sm md:text-base font-black mb-5 tracking-[0.42em] text-slate-500 uppercase">QUICKKIT AI</p>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-7 leading-[0.98] tracking-[-0.055em] text-white animate-slide-up max-w-5xl mx-auto"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-400">AI Teammates for Your</span><br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Real Estate Business</span></h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-7 leading-relaxed">Your AI teammates capture leads, qualify buyers, follow up on WhatsApp, make calls, book site visits and keep your CRM moving — 24/7.</p>
        <div className="flex flex-wrap justify-center gap-2.5 mb-10"><span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">Property Lead Teammate</span><span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">WhatsApp Follow-up</span><span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">AI Calling</span><span className="px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300">CRM Automation</span></div>
        <div className="max-w-3xl mx-auto mb-5 flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="px-9 py-4 bg-white text-nexus-dark rounded-xl font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_50px_rgba(255,255,255,0.12)] uppercase tracking-[0.16em]">See Your AI Workforce <ArrowRight className="w-4 h-4" /></button>
          <button onClick={openWhatsApp} className="px-9 py-4 bg-blue-600/10 border border-blue-500/30 text-blue-300 rounded-xl font-black text-sm hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.16em]"><MessageCircle className="w-4 h-4" /> Talk on WhatsApp</button>
        </div>
        <button onClick={tryWithChatGPT} className="mb-9 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-blue-500/50 hover:bg-slate-900 transition-all text-xs font-black uppercase tracking-widest"><Sparkles className="w-4 h-4 text-blue-400" /> Ask ChatGPT About QuickKit</button>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-9 text-xs">
          <span className="text-slate-500">WhatsApp: <strong className="text-slate-300">@{WHATSAPP_USERNAME}</strong></span>
          <button onClick={openWhatsAppQR} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 transition-colors" aria-label="Open QuickKit AI WhatsApp QR code"><QrCode className="w-4 h-4" /> Scan WhatsApp QR</button>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl mx-auto mb-9">Built for Indian real estate workflows. AI/API usage is billed separately according to actual usage; setup and maintenance are shown in INR.</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-nexus-border/30 pt-7 w-full max-w-3xl mx-auto"><div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><Bot className="w-3.5 h-3.5 text-blue-500" /> Lead Qualification</div><div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><Server className="w-3.5 h-3.5 text-purple-500" /> Managed Infrastructure</div><div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Monitoring & Maintenance</div></div>
      </div>
    </section>
  );
};
