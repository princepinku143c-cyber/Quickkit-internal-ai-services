import React from 'react';
import { Bot, MessageCircle, QrCode } from 'lucide-react';
import { WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

interface SmartBotProps { onOpenArchitect?: () => void; }

export const SmartBot: React.FC<SmartBotProps> = ({ onOpenArchitect }) => {
  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi, I want to discuss a managed AI workforce for my business.');
    window.open(`${WHATSAPP_DIRECT_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };
  const openQR = () => window.open('/quickkit-ai-whatsapp-qr.svg', '_blank', 'noopener,noreferrer');

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-end gap-2">
      {onOpenArchitect && <button onClick={onOpenArchitect} aria-label="Open AI workflow architect" className="hidden sm:inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-slate-900/95 px-4 py-3 text-xs font-black text-blue-300 shadow-2xl backdrop-blur-xl hover:border-blue-400/40 transition-all"><Bot className="w-4 h-4" /> AI Architect</button>}
      <button onClick={openQR} aria-label={`Open WhatsApp QR for @${WHATSAPP_USERNAME}`} className="w-12 h-12 rounded-full bg-slate-900/95 border border-emerald-500/30 text-emerald-300 shadow-2xl backdrop-blur-xl flex items-center justify-center hover:scale-105 transition-all"><QrCode className="w-5 h-5" /></button>
      <button onClick={openWhatsApp} aria-label={`Chat with QuickKit AI on WhatsApp @${WHATSAPP_USERNAME}`} className="group relative flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300 shadow-2xl backdrop-blur-xl hover:bg-emerald-500/15 transition-all">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#030712]" />
        <MessageCircle className="w-5 h-5" /><span className="text-xs font-black text-white">WhatsApp</span>
      </button>
    </div>
  );
};