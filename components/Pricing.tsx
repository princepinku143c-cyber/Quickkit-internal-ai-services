import React from 'react';
import { ArrowRight, CalendarCheck, Check, Clock3, Database, MessageCircle, ShieldCheck, Sparkles, Star, UsersRound, Workflow, Zap } from 'lucide-react';
import { RAJA_COMMERCIAL_OFFER } from '../constants';

interface PricingProps { lang?: string; onSelectPlan: (plan: string) => void; }

const FEATURES = [
  '5-member autonomous AI workforce',
  'WhatsApp voice-note + text speed-to-lead workflow',
  'Prospecting + competitor intelligence workflow',
  'CRM sentinel + no-show guard',
  'Dormant lead reactivation workflow',
  'Reputation + local/AI-search support workflow',
  'Managed VPS deployment, monitoring and maintenance',
  'Performance SLA: 10 qualified site visits / 15 qualified consultations in 30 days*',
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => (
  <section id="offer" className="py-28 md:py-32 bg-[#030712] border-t border-white/6 relative overflow-hidden">
    <div className="absolute left-1/2 -translate-x-1/2 -top-60 w-[1000px] h-[560px] rounded-full bg-amber-500/6 blur-[160px] pointer-events-none"/>
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-amber-300"><Sparkles className="w-3 h-3"/> Dussehra Festive Offer</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.05em]">Enterprise AI workforce. Half-price pilot.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">The master commercial plan uses a regular anchor of ₹70,000 setup + ₹2,40,000/month. The Dussehra pilot offer cuts both by 50% for up to 3 pilot clients, with the discounted retainer locked for the life of the agreed contract.</p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-stretch">
        <div className="rounded-[2.2rem] border border-amber-400/25 bg-gradient-to-b from-amber-500/[.07] via-slate-950/95 to-slate-950 p-7 md:p-10 shadow-[0_30px_120px_rgba(245,158,11,.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-amber-300"><Star className="w-3 h-3 fill-amber-300"/> 3 pilot-client slots</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">50% lifetime lock*</span>
          </div>

          <h3 className="mt-7 text-3xl md:text-4xl font-black text-white">5-Member Autonomous AI Workforce</h3>
          <p className="mt-3 text-slate-400 leading-relaxed">Built for high-ticket real estate developers/brokers and high-ticket aesthetic healthcare/dental clinics.</p>

          <div className="mt-8 rounded-[1.7rem] border border-white/8 bg-black/25 p-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Implementation</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="text-lg text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularSetupINR.toLocaleString('en-IN')}</span><span className="text-5xl font-black text-white">₹{RAJA_COMMERCIAL_OFFER.festiveSetupINR.toLocaleString('en-IN')}</span></div>
                <div className="mt-2 text-xs text-slate-500">48-hour deployment target · paid upfront</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Monthly management</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="text-lg text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularMonthlyINR.toLocaleString('en-IN')}</span><span className="text-4xl font-black text-emerald-300">₹{RAJA_COMMERCIAL_OFFER.festiveMonthlyINR.toLocaleString('en-IN')}</span></div>
                <div className="mt-2 text-xs text-slate-500">Starts on Day 30 · locked for life*</div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-emerald-300">Save ₹35,000 setup</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-emerald-300">Save ₹1,20,000/mo</span>
              <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-blue-300">50% off</span>
            </div>
          </div>

          <div className="mt-7 grid md:grid-cols-2 gap-x-5 gap-y-3">
            {FEATURES.map(f=><div key={f} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0"/><span className="text-sm leading-relaxed text-slate-300">{f}</span></div>)}
          </div>

          <button onClick={()=>onSelectPlan('RAJA_DUSSEHRA')} className="mt-8 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[.16em] text-slate-950 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">Claim Pilot Slot <ArrowRight className="w-4 h-4"/></button>
          <p className="mt-4 text-[10px] leading-relaxed text-slate-600">*The performance SLA and lifetime pricing lock are subject to the signed agreement, qualifying traffic/access conditions, proof rules and other commercial terms.</p>
        </div>

        <div className="rounded-[2.2rem] border border-slate-800 bg-slate-950/75 p-7 md:p-10 flex flex-col">
          <div className="text-[10px] font-mono font-black uppercase tracking-[.24em] text-blue-300">Why the offer is structured this way</div>
          <div className="mt-7 space-y-5">
            {[
              [UsersRound,'01','One team, not one bot','Five specialists cover acquisition, first response, no-show protection, reactivation and reputation.'],
              [ShieldCheck,'02','Risk reversal','The public offer includes a 30-day performance SLA with a setup-fee refund trigger when its written conditions are met.'],
              [Clock3,'03','Speed matters','The first teammate is designed around a 12-second WhatsApp response target for the critical first-contact window.'],
              [Workflow,'04','Client-owned traffic','The master plan says clients run their own Meta/Google campaigns while Raja AI Systems monetizes the resulting inbound traffic.'],
              [MessageCircle,'05','WhatsApp-native','The core customer interaction is built around WhatsApp voice notes + text rather than paid Vapi/Bland/Twilio calling APIs.'],
              [Database,'06','Managed operations','Raja AI Systems handles the configured VPS/agent environment, maintenance and ongoing workflow operations.'],
            ].map(([Icon,n,title,body])=><div key={String(n)} className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center justify-center shrink-0">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300'})}</div><div><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{String(n)}</div><h4 className="mt-1 text-sm font-black text-white">{String(title)}</h4><p className="mt-1 text-xs leading-relaxed text-slate-500">{String(body)}</p></div></div>)}
          </div>
          <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-center"><CalendarCheck className="w-5 h-5 text-emerald-300 mx-auto mb-2"/><div className="text-lg font-black text-white">10 / 15</div><div className="text-[9px] uppercase tracking-widest text-slate-600">Visits / consultations*</div></div>
            <div className="rounded-2xl border border-blue-400/15 bg-blue-400/5 p-4 text-center"><Zap className="w-5 h-5 text-blue-300 mx-auto mb-2"/><div className="text-lg font-black text-white">48h</div><div className="text-[9px] uppercase tracking-widest text-slate-600">Deployment target*</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);