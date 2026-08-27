import React from 'react';
import { Mail, MessageCircle, QrCode } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_DIRECT_URL, WHATSAPP_USERNAME } from '../constants';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=AI%20Automation%20Inquiry`}
        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-500/40 transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Email Architect"
      >
        <Mail className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-3 px-2 py-1 bg-blue-600 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">EMAIL ARCHITECT</span>
      </a>
      <a
        href="/quickkit-ai-whatsapp-qr.svg"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 hover:bg-emerald-900/40 text-emerald-400 p-3 rounded-full shadow-lg transition-all hover:scale-105 border border-emerald-500/20"
        aria-label={`Open WhatsApp QR for @${WHATSAPP_USERNAME}`}
      >
        <QrCode className="w-5 h-5" />
      </a>
      <a
        href={`${WHATSAPP_DIRECT_URL}?text=Hi%2C%20I%20want%20to%20discuss%20automation.`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 border border-slate-700"
        aria-label={`WhatsApp @${WHATSAPP_USERNAME}`}
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
};