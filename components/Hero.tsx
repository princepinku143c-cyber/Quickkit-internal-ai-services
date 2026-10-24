import React from 'react';
import { ArrowRight, BarChart3, Bot, CheckCircle2, MessageCircle, QrCode, ShieldCheck, Sparkles, Timer, UsersRound, Workflow, Zap } from 'lucide-react';
import { Language } from '../types';
import { RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

interface HeroProps { lang: Language; onLaunchArchitect: (prompt: string) => void; }

const workflow = [
  { icon: MessageCircle, label:'Speed-to-lead', value:'Fast reply' },
  { icon: Bot, label:'AI workforce', value:'5 agents' },
  { icon: Workflow, label:'Follow-up', value:'WhatsApp' },
  { icon: CheckCircle2, label:'Performance', value:'10 visits*' },
  { icon: BarChart3, label:'Scale', value:'24/7' },
];

export const Hero: React.FC<HeroProps> = () => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi Raja, I want to see the 5-Agent AI Workforce demo and the current pilot offer.');
    window.open(`${WHATSAPP_DIRECT_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };
  const openQR = () => window.open('/quickkit-ai-whatsapp-qr.svg', '_blank', 'noopener,noreferrer');

  return (
    <section id="hero" className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#030712] pt-28 pb-16">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{backgroundImage:'linear-gradient(rgba(96,165,250,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.8) 1px, transparent 1px)',backgroundSize:'64px 6¶»§q«^