import React from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, PlayCircle, ShieldCheck, Sparkles, Tag, UsersRound } from 'lucide-react';
import { WHATSAPP_DIRECT_URL } from '../constants';

const scenes = [
  ['00–05s','THE HOOK','Luxury property + late-night lead notification.','STOP BURNING ADS!'],
  ['05–18s','THE AGITATION','Buyer messages at night while the human sales desk is offline.','The lead is already shopping elsewhere.'],
  ['18–38s','THE 5-AGENT SOLUTION','WhatsApp response, booking, GPS reminder, dormant-lead revival and reputation workflow.','Meet Raja AI Systems.'],
  ['38–48s','THE WRITTEN SLA','Explain the signed performance conditions and refund terms, if included.','TARGETS ONLY WHEN SIGNED'],
  ['48–60s','PILOT PRICING + CTA','current 50% pilot offer with regular anchor, discounted setup and monthly management.','₹35K SETUP · ₹1.20L/MO*'],
];

export const AdCampaignSection: React.FC = () => (
  <section id="ad" className="py-28 bg-[#030712] border-y border-white/6 relative overflow-hidden">
    <div className="absolute left-1/2 -translate-x-1/2 top-[-250px] w-[900px] h-[500px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none"/>
    <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-blac���q�^