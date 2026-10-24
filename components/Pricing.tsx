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
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-amber-300"><Sparkles className="w-3 h-3"/> Current Pilot Offer</div>
        <h2 className=¶»§q«^