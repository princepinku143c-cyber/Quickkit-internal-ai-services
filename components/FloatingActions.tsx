import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      <a
        href={`tel:${WHATSAPP_NUMBER}`}
        className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
        aria-label="Call Us"
      >
        <Phone className="w-6 h-6" />
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need automation services.`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/30 transition-transform hover:scale-110 animate-bounce"
        aria-label="WhatsApp Us"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};