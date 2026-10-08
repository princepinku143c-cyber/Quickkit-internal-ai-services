import React from 'react';
import { ArrowRight, BarChart3, Bot, CheckCircle2, MessageCircle, QrCode, ShieldCheck, Sparkles, Timer, UsersRound, Workflow, Zap } from 'lucide-react';
import { Language } from '../types';
import { RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

interface HeroProps { lang: Language; onLaunchArchitect: (prompt: string) => void; }

const workflow = [
  { icon: MessageCircle, label:'Speed-to-lead', value:'≤ 12 sec' },
  { icon: Bot, label:'AI workforce', value:'5 agents' },
  { icon: Workflow, label:'Follow-up', value:'WhatsApp' },
  { icon: CheckCircle2, label:'Performance', value:'10 visits*' },
  { icon: BarChart3, label:'Scale', value:'24/7' },
];

export const Hero: React.FC<HeroProps> = () => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi Raja, I want to see the 5-Agent AI Workforce demo and the Dussehra offer.');
    window.open(`${WHATSAPP_DIRECT_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };
  const openQR = () => window.open('/quickkit-ai-whatsapp-qr.svg', '_blank', 'noopener,noreferrer');

  return (
    <section id="hero" className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#030712] pt-28 pb-16">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{backgroundImage:'linear-gradient(rgba(96,165,250,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.8) 1px, transparent 1px)',backgroundSize:'64px 64px'}} />
      <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-blue-600/12 blur-[160px] pointer-events-none" />
      <div className="absolute right-[-180px] bottom-[-180px] w-[520px] h-[520px] rounded-full bg-emerald-500/7 blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-5 md:px-8 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 xl:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-[10px] font-mono font-black uppercase tracking-[.22em] text-amber-300 mb-7">
              <Sparkles className="w-3 h-3" /> Dussehra · 3 pilot slots · 50% lifetime lock
            </div>

            <div className="text-xs md:text-sm font-black tracking-[.38em] text-slate-500 uppercase mb-5">RAJA AI SYSTEMS</div>

            <h1 className="text-5xl sm:text-6xl xl:text-[78px] font-black leading-[.92] tracking-[-.06em] text-white max-w-4xl">
              Stop losing high-ticket leads
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-emerald-300">after the ad click.</span>
            </h1>

            <p className="mt-7 text-lg md:text-xl leading-relaxed text-slate-400 max-w-2xl">
              A 5-member autonomous AI workforce built around WhatsApp: responds in seconds, qualifies buyers, books site visits, revives dormant leads and protects your follow-up pipeline 24/7.
            </p>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
              {[
                ['12 sec','speed-to-lead',Timer],
                ['5','AI teammates',UsersRound],
                ['10','site visits*',CheckCircle2],
                ['48h','target deployment',Zap],
              ].map(([v,l,Icon]) => <div key={String(l)} className="rounded-2xl border border-white/8 bg-slate-950/65 px-3 py-3.5"><div className="flex items-center gap-2">{React.createElement(Icon as React.ElementType,{className:'w-4 h-4 text-blue-300'})}<span className="text-lg font-black text-white">{String(v)}</span></div><div className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-600">{String(l)}</div></div>)}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {['WhatsApp voice + text','Competitor intelligence','CRM + no-show guard','Dead lead reactivation','Google reputation'].map(x=><span key={x} className="rounded-full border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs font-bold text-slate-300">{x}</span>)}
            </div>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button onClick={() => document.getElementById('offer')?.scrollIntoView({behavior:'smooth'})} className="group rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[.14em] text-slate-950 shadow-[0_0_60px_rgba(255,255,255,.10)] transition-all hover:-translate-y-0.5 hover:bg-slate-100">
                See the 50% Offer <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
              </button>
              <button onClick={openWhatsApp} className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-6 py-4 text-sm font-black uppercase tracking-[.14em] text-emerald-300 transition-all hover:-translate-y-0.5">
                <MessageCircle className="inline w-4 h-4 mr-2"/> Live WhatsApp Demo
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <button onClick={openQR} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 font-bold text-slate-300 hover:border-emerald-500/40"><QrCode className="w-3.5 h-3.5 text-emerald-400"/> Scan WhatsApp</button>
              <span>Direct: @{WHATSAPP_USERNAME}</span>
            </div>

            <div className="mt-9 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4">
              <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[.2em] text-emerald-300"><ShieldCheck className="w-4 h-4"/> Performance SLA</div>
              <p className="mt-1 text-sm font-black text-white">10 qualified physical site visits in 30 days* · 100% setup-fee refund trigger*</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">*Subject to the signed SLA's qualifying traffic/access and proof conditions.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/8 blur-3xl pointer-events-none"/>
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,.45)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400/70"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"/></div><span className="text-xs font-mono font-bold text-slate-500">RAJA AI · WORKFORCE CONTROL</span></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> ONLINE</span></div>
              <div className="p-5 md:p-6">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">DUSSEHRA OFFER</div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2"><span className="text-xl font-bold text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularSetupINR.toLocaleString('en-IN')}</span><span className="text-4xl font-black text-white">₹{RAJA_COMMERCIAL_OFFER.festiveSetupINR.toLocaleString('en-IN')}</span><span className="text-xs font-bold text-slate-500">one-time setup</span></div>
                  <div className="mt-2 text-sm font-black text-emerald-300">₹{RAJA_COMMERCIAL_OFFER.festiveMonthlyINR.toLocaleString('en-IN')} / month <span className="text-slate-500 font-medium">retainer · locked for life*</span></div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-black text-white">5-Agent Lead-to-Visit System</div><div className="text-[10px] text-slate-500 mt-1">Example real-estate customer journey</div></div><BarChart3 className="w-5 h-5 text-indigo-400"/></div>
                  <div className="grid grid-cols-5 gap-2">{workflow.map(({icon:Icon,label,value},i)=><div key={label} className="relative"><div className="rounded-xl border border-white/8 bg-slate-900/70 p-2.5 h-full"><Icon className="w-4 h-4 text-blue-300 mb-2"/><div className="text-[8px] font-black uppercase tracking-wider text-slate-500">{label}</div><div className="text-[10px] font-bold text-slate-200 mt-1">{value}</div></div>{i<workflow.length-1&&<div className="hidden xl:block absolute -right-2 top-1/2 w-2 h-px bg-blue-400/40"/>}</div>)}</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[['Closer','WhatsApp voice + text'],['Sentinel','Calendar + GPS reminder'],['Reviver','Dormant lead reactivation']].map(([a,b])=><div key={a} className="rounded-xl border border-white/7 bg-white/[.02] p-3"><div className="text-[9px] uppercase tracking-widest text-slate-600">{a}</div><div className="text-[10px] font-bold text-slate-300 mt-1">{b}</div></div>)}
                </div>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-[10px] leading-relaxed text-slate-500"><span className="font-black text-blue-300">TRUTH LAYER:</span> Marketing claims above are the commercial plan documented in the supplied master ledger. Signed SLA terms and qualifying conditions govern actual delivery.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};