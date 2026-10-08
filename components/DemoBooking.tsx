import React from 'react';
import { ArrowUpRight, CalendarDays, CheckCircle2, Mail, MessageCircle, ShieldCheck, Workflow, Wrench } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, MANAGED_SYSTEMS } from '../constants';

interface DemoBookingProps { onBookDemo?: () => void; }
const CALENDLY_URL = 'https://calendly.com/princepinku143c/30min';

export const DemoBooking: React.FC<DemoBookingProps> = ({ onBookDemo }) => (
  <section id="demo" data-page="demo" className="py-28 bg-[#080d17] border-t border-white/6 relative overflow-hidden">
    <div className="absolute -left-40 top-10 w-[500px] h-[500px] rounded-full bg-blue-600/7 blur-[120px] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-blue-300"><MessageCircle className="w-3 h-3" /> Start with the workflow</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Tell us the work you want your AI team to own.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">We can scope the workflow, identify the right teammates, define the connected systems and outline the verification path before deployment.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/65 p-7 md:p-9">
          <p className="text-[10px] font-mono font-black uppercase tracking-[.22em] text-slate-600">Delivery path</p>
          <div className="mt-6 space-y-5">
            {[
              [Workflow,'01','Diagnose','Map the repetitive work, business rules and handoff points.'],
              [CheckCircle2,'02','Design','Define agents, tools, integrations, memory and escalation rules.'],
              [ShieldCheck,'03','Pilot + Verify','Exercise the real workflow and check the external actions before production.'],
              [Wrench,'04','Maintain','Continue monitoring, fixes and system maintenance under the managed model.'],
            ].map(([Icon,n,title,body])=><div key={String(n)} className="flex gap-4"><div className="w-10 h-10 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center justify-center shrink-0">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300'})}</div><div><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{String(n)} · {String(title)}</div><p className="mt-1 text-sm leading-relaxed text-slate-400">{String(body)}</p></div></div>)}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5"><p className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300">Published starting prices</p><p className="mt-2 text-sm font-black text-white">KVM 4 ₹{MANAGED_SYSTEMS.KVM4.setupINR.toLocaleString('en-IN')} · KVM 8 ₹{MANAGED_SYSTEMS.KVM8.setupINR.toLocaleString('en-IN')}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">First month managed operation included. Maintenance starts in month 2. AI/API and third-party provider usage is separate.</p></div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/65 p-7 md:p-9 flex flex-col justify-center gap-4">
          <button type="button" onClick={onBookDemo} className="group flex items-center gap-4 rounded-2xl border border-blue-500/25 bg-blue-500/8 p-5 text-left hover:bg-blue-500/12 transition-all"><div className="w-12 h-12 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-center"><Workflow className="w-5 h-5 text-blue-300" /></div><div className="flex-1"><p className="text-base font-black text-white">Request a tailored scope</p><p className="mt-1 text-xs text-slate-500">Send your business requirements through the lead form.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-blue-300" /></button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I want to discuss a managed AI workforce for my business.')}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 hover:bg-emerald-500/10 transition-all"><div className="w-12 h-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-emerald-300" /></div><div className="flex-1"><p className="text-base font-black text-white">Message on WhatsApp</p><p className="mt-1 text-xs text-slate-500">Start directly with a workflow or business problem.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-300" /></a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Managed AI Workforce Inquiry')}`} className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500/25 transition-all"><div className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center"><Mail className="w-5 h-5 text-slate-300" /></div><div className="flex-1"><p className="text-base font-black text-white">Email the team</p><p className="mt-1 text-xs text-slate-500">{CONTACT_EMAIL}</p></div><ArrowUpRight className="w-5 h-5 text-slate-600" /></a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 hover:bg-purple-500/10 transition-all"><div className="w-12 h-12 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-300" /></div><div className="flex-1"><p className="text-base font-black text-white">Book a 30-minute call</p><p className="mt-1 text-xs text-slate-500">Open the booking page and choose an available time.</p></div><ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-purple-300" /></a>
        </div>
      </div>
    </div>
  </section>
);