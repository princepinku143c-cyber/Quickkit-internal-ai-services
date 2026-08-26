import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

interface SmartBotProps { onOpenArchitect?: () => void; }

export const SmartBot: React.FC<SmartBotProps> = () => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi, I want to discuss a managed AI system for my business.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button onClick={openWhatsApp} aria-label="Chat on WhatsApp" className="bg-slate-800 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-full shadow-lg flex items-center gap-3 transition-all hover:scale-105 group relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
        <div className="relative"><Bot className="w-6 h-6" /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" /></div>
        <span className="font-bold text-sm max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap text-white pr-2">Chat on WhatsApp</span>
      </button>
    </div>
  );
};
