import React from 'react';
import { CheckCircle2, CalendarDays, BarChart4, Lightbulb, ShieldCheck, Mail, MessageCircle, ArrowUpRight } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '../constants';

interface DemoBookingProps { onBookDemo?: () => void; }

const CALENDLY_URL = 'https://calendly.com/princepinku143c/30min';

export const DemoBooking: React.FC<DemoBookingProps> = () => (
  <section id="demo" data-page="demo" className="py-24 bg-[#0a0f1c] relative border-t border-slate-800">
    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-6 uppercase tracking-widest font-black">
          <MessageCircle className="w-4 h-4" /> Talk to QuickKit AI
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Talk to us directly. Book a call when you're ready.</h2>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">Message us on WhatsApp, send an email, or choose a time for a call. No embedded video-call screen and no broken calendar iframe on mobile.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Lightbulb className="w-64 h-64"/></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-8 border-b border-slate-700/50 pb-4">What happens next</h3>
            <ul className="space-y-6 mb-10">
              <li className="flex items-start gap-4"><div className="p-2.5 bg-blue-500/10 rounded-xl shrink-0 border border-blue-500/20"><CheckCircle2 className="w-5 h-5 text-blue-400"/></div><div><h4 className="text-white font-bold text-lg mb-1">Tell us what you need</h4><p className="text-sm text-slate-400 leading-relaxed">Explain your business workflow, automation requirement or AI agent idea in a message or email.</p></div></li>
              <li className="flex items-start gap-4"><div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0 border border-emerald-500/20"><BarChart4 className="w-5 h-5 text-emerald-400"/></div><div><h4 className="text-white font-bold text-lg mb-1">We scope the right system</h4><p className="text-sm text-slate-400 leading-relaxed">We discuss suitable agents, Hermes-based architecture, integrations and KVM 4/KVM 8 capacity.</p></div></li>
              <li className="flex items-start gap-4"><div className="p-2.5 bg-purple-500/10 rounded-xl shrink-0 border border-purple-500/20"><ShieldCheck className="w-5 h-5 text-purple-400"/></div><div><h4 className="text-white font-bold text-lg mb-1">Book a call if useful</h4><p className="text-sm text-slate-400 leading-relaxed">Choose an available time directly from the booking page. The call can then be used for the detailed walkthrough.</p></div></li>
            </ul>
            <div className="bg-nexus-dark/50 p-6 rounded-2xl border border-slate-700/50 space-y-2"><p className="text-sm text-white font-bold uppercase tracking-widest">₹19,999 KVM 4 · ₹39,999 KVM 8</p><p className="text-sm text-slate-400">First month managed operation included. AI/API usage is billed separately according to actual usage.</p></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col justify-center gap-5">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I want to discuss a managed AI system for my business.')}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"><MessageCircle className="w-7 h-7 text-emerald-400"/></div>
            <div className="flex-1"><p className="text-white font-black text-lg">Message on WhatsApp</p><p className="text-sm text-slate-400">Start a direct conversation with us.</p></div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400"/>
          </a>

          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Managed AI System Inquiry')}`} className="group flex items-center gap-5 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"><Mail className="w-7 h-7 text-blue-400"/></div>
            <div className="flex-1"><p className="text-white font-black text-lg">Send us an Email</p><p className="text-sm text-slate-400">{CONTACT_EMAIL}</p></div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400"/>
          </a>

          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 hover:border-purple-500/50 transition-all shadow-lg shadow-purple-950/20">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20"><CalendarDays className="w-7 h-7 text-purple-400"/></div>
            <div className="flex-1"><p className="text-white font-black text-lg">Book a Call</p><p className="text-sm text-slate-400">Open the secure booking page and choose your time.</p></div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400"/>
          </a>

          <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold pt-2">WhatsApp · Email · Scheduled Call</p>
        </div>
      </div>
    </div>
  </section>
);
