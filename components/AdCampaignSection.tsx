import React from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, PlayCircle, ShieldCheck, Sparkles, Tag, UsersRound } from 'lucide-react';
import { WHATSAPP_DIRECT_URL } from '../constants';

const scenes = [
  ['00–05s','THE HOOK','Luxury property + late-night lead notification.','STOP BURNING ADS!'],
  ['05–18s','THE AGITATION','Buyer messages at night while the human sales desk is offline.','The lead is already shopping elsewhere.'],
  ['18–38s','THE 5-AGENT SOLUTION','WhatsApp response, booking, GPS reminder, dormant-lead revival and reputation workflow.','Meet Raja AI Systems.'],
  ['38–48s','THE GUARANTEE','Performance shield with the written 30-day SLA and setup-refund message.','10 QUALIFIED SITE VISITS*'],
  ['48–60s','THE PRICE + CTA','Dussehra 50% offer with regular anchor, discounted setup and monthly management.','₹35K SETUP · ₹1.20L/MO*'],
];

export const AdCampaignSection: React.FC = () => (
  <section id="ad" className="py-28 bg-[#030712] border-y border-white/6 relative overflow-hidden">
    <div className="absolute left-1/2 -translate-x-1/2 top-[-250px] w-[900px] h-[500px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none"/>
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-amber-300"><Sparkles className="w-3 h-3"/> 60-second campaign</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.05em]">The ad tells the same story as the product.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">The supplied master ad blueprint is built for inbound WhatsApp DMs: pain → live 5-agent proof → performance SLA → Dussehra offer → founder CTA.</p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_.9fr] gap-6">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 md:p-8">
          {scenes.map(([time,title,body,screen],i)=><div key={time} className="relative flex gap-4 py-5 first:pt-0 last:pb-0">{i<scenes.length-1&&<div className="absolute left-[19px] top-14 bottom-[-4px] w-px bg-slate-800"/>}<div className="w-10 h-10 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-center shrink-0 relative z-10"><span className="text-[9px] font-mono font-black text-blue-300">{i+1}</span></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-mono font-black tracking-widest text-slate-600">{time}</span><span className="rounded-full border border-slate-800 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-600">{title}</span></div><p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p><div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/7 bg-black/20 px-3 py-2 text-xs font-black text-white"><PlayCircle className="w-4 h-4 text-amber-300"/>{screen}</div></div></div>)}
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/5 p-7">
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-emerald-300"><CheckCircle2 className="w-4 h-4"/> Conversion target</div>
            <h3 className="mt-4 text-2xl font-black text-white">Inbound WhatsApp conversation</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">The campaign destination is a direct WhatsApp conversation so the prospect can see the same speed-to-lead and AI-workforce story promised on the landing page.</p>
            <a href={`${WHATSAPP_DIRECT_URL}?text=Hi%20Raja%2C%20I%20want%20the%205-Agent%20AI%20Workforce%20demo.`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-emerald-400">Open WhatsApp CTA <ArrowRight className="w-4 h-4"/></a>
          </div>

          <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/5 p-7">
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-amber-300"><Tag className="w-4 h-4"/> Dussehra offer</div>
            <div className="mt-4 text-sm text-slate-500 line-through">Regular ₹70,000 setup + ₹2,40,000/month</div>
            <div className="mt-1 text-3xl font-black text-white">₹35,000 setup</div>
            <div className="mt-1 text-xl font-black text-emerald-300">₹1,20,000/month</div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">50% pilot pricing for up to 3 clients; the supplied master ledger describes the discounted retainer as locked for life under the agreed contract.</p>
          </div>

          <div className="rounded-[2rem] border border-blue-400/15 bg-blue-400/5 p-7">
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-blue-300"><ShieldCheck className="w-4 h-4"/> Production note</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Ad language and landing-page language now point to the same five-agent system. SLA, qualification, traffic/access conditions and proof rules remain governed by the signed agreement.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
        {[['5','agents'],['12 sec','response target'],['30 days','SLA window'],['10 / 15','visits / consultations'],['₹35k','setup'],['₹1.20L','monthly']].map(([v,l])=><div key={l} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-center"><div className="text-xl font-black text-white">{v}</div><div className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-600">{l}</div></div>)}
      </div>
    </div>
  </section>
);