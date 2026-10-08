import React from 'react';
import { ArrowUpRight, CalendarDays, CheckCircle2, Mail, MessageCircle, ShieldCheck, Sparkles, Timer, UsersRound, Workflow } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '../constants';

interface DemoBookingProps { onBookDemo?: () => void; }
const CALENDLY_URL = 'https://calendly.com/princepinku143c/30min';

export const DemoBooking: React.FC<DemoBookingProps> = ({ onBookDemo }) => (
  <section id="demo" className="py-28 bg-[#080d17] border-t border-white/6 relative overflow-hidden">
    <div className="absolute -right-40 top-0 w-[520px] h-[520px] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none"/>
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-amber-300"><Sparkles className="w-3 h-3"/> Founder-led pilot</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.05em]">See the 5-Agent Workforce on your actual workflow.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">Bring one real use case. We map the journey, demonstrate the relevant agent behavior and explain what is verified, what is configurable and what the signed SLA covers.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-7 md:p-9">
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[['12 sec','speed target',Timer],['5','core agents',UsersRound],['48h','deployment target',CheckCircle2]].map(([v,l,Icon])=><div key={String(l)} className="rounded-2xl border border-slate-800 bg-black/20 p-4 text-center">{React.createElement(Icon as React.ElementType,{className:'w-4 h-4 text-blue-300 mx-auto mb-2'})}<div className="text-xl font-black text-white">{String(v)}</div><div className="mt-1 text-[8px] font-mono uppercase tracking-widest text-slate-600">{String(l)}</div></div>)}
          </div>
          <p className="text-[10px] font-mono font-black uppercase tracking-[.22em] text-slate-600">The pilot path</p>
          <div className="mt-6 space-y-5">
            {[
              [Workflow,'01','Map the revenue leak','Identify where leads slow down, where follow-up breaks and what the AI workforce should own.'],
              [MessageCircle,'02','Run the WhatsApp-first demo','See the 12-second responder, qualification logic, voice-note flow and appointment path.'],
              [ShieldCheck,'03','Confirm the SLA + proof rules','Review the 30-day performance target and the conditions used to define a qualified outcome.'],
              [CheckCircle2,'04','Deploy + measure','Start the agreed pilot and measure the actual workflow rather than relying on marketing percentages.'],
            ].map(([Icon,n,title,body])=><div key={String(n)} className="flex gap-4"><div className="w-10 h-10 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center justify-center shrink-0">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300'})}</div><div><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{String(n)} · {String(title)}</div><p className="mt-1 text-sm leading-relaxed text-slate-400">{String(body)}</p></div></div>)}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
            <div className="text-[9px] font-mono font-black uppercase tracking-widest text-amber-300">Dussehra commercial</div>
            <div className="mt-2 text-sm font-black text-white"><span className="text-slate-600 line-through">₹70,000</span> → ₹35,000 setup</div>
            <div className="mt-1 text-sm font-black text-emerald-300"><span className="text-slate-600 line-through">₹2,40,000</span> → ₹1,20,000 / month</div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-600">50% festive pricing for up to 3 pilot clients; discounted retainer is described in the supplied master ledger as locked for life under the agreed contract.</p>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-7 md:p-9 flex flex-col justify-center gap-4">
          <button type="button" onClick={onBookDemo} className="group flex items-center gap-4 rounded-2xl border border-blue-500/25 bg-blue-500/8 p-5 text-left hover:bg-blue-500/12 transition-all"><div className="w-12 h-12 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-center"><Workflow className="w-5 h-5 text-blue-300"/></div><div className="flex-1"><p className="text-base font-black text-white">Claim a pilot slot</p><p className="mt-1 text-xs text-slate-500">Send your requirements and review the scope + SLA path.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600"/></button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Raja, I want the 5-Agent AI Workforce demo and Dussehra pilot offer.')}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 hover:bg-emerald-500/10 transition-all"><div className="w-12 h-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-emerald-300"/></div><div className="flex-1"><p className="text-base font-black text-white">Message Raja on WhatsApp</p><p className="mt-1 text-xs text-slate-500">Open the live demo conversation directly.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600"/></a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Raja AI Systems — 5-Agent Workforce Pilot')}`} className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500/25 transition-all"><div className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center"><Mail className="w-5 h-5 text-slate-300"/></div><div className="flex-1"><p className="text-base font-black text-white">Email the team</p><p className="mt-1 text-xs text-slate-500">{CONTACT_EMAIL}</p></div><ArrowUpRight className="w-5 h-5 text-slate-600"/></a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 hover:bg-purple-500/10 transition-all"><div className="w-12 h-12 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-300"/></div><div className="flex-1"><p className="text-base font-black text-white">Book the 15-minute demo</p><p className="mt-1 text-xs text-slate-500">Choose an available time.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600"/></a>
        </div>
      </div>
    </div>
  </section>
);