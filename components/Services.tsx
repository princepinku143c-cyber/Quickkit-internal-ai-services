
import React from 'react';
import { MessageCircle, UserPlus, Calendar, CreditCard, Database, Shield } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ServicesProps {
  lang: Language;
}

export const Services: React.FC<ServicesProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].services;

  const icons = [
    <MessageCircle className="w-8 h-8 text-cyan-400" />,
    <UserPlus className="w-8 h-8 text-purple-400" />,
    <Calendar className="w-8 h-8 text-pink-400" />,
    <CreditCard className="w-8 h-8 text-yellow-400" />,
    <Database className="w-8 h-8 text-blue-400" />,
    <Shield className="w-8 h-8 text-green-400" />
  ];

  return (
    <section id="services" className="py-24 bg-slate-900 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.cards.map((card, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
              <div className="bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icons[idx]}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
