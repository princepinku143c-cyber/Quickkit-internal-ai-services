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
      <div className="gr¶»§q«^