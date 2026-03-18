import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '../constants';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=AI%20Automation%20Inquiry`}
        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-500/40 transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Email Architect"
      >
        <Mail className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-3 px-2 py-1 bg-blue-600 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">EMAIL ARCHITECT</span>
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to discuss automation.`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 border border-slate-700"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
};