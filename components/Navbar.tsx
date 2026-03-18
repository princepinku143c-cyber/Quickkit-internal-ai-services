
import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Lock, Cpu } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, isAdmin, onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = TRANSLATIONS[lang].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${scrolled ? 'bg-nexus-dark/90 backdrop-blur-md border-b border-nexus-border py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
          <div className="bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform relative overflow-hidden">
            <Cpu className="text-white w-6 h-6 relative z-10 animate-pulse" />
            <div className="absolute inset-0 bg-white/20 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">QuickKit</span>
            <span className="text-[10px] font-mono text-blue-400 font-bold tracking-[0.2em] uppercase">Global Systems</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('services')} className="text-slate-300 hover:text-white transition">{t.services}</button>
          <button onClick={() => scrollTo('demo')} className="text-slate-300 hover:text-white transition">{t.demo}</button>
          <button onClick={() => scrollTo('catalog')} className="text-slate-300 hover:text-white transition">{t.catalog}</button>
          
          <button 
            onClick={() => scrollTo('roi')} 
            className="px-5 py-2 bg-nexus-card border border-nexus-border rounded-full text-cyan-400 hover:border-cyan-400 transition"
          >
            {t.roi}
          </button>



          <button 
            onClick={onLoginClick}
            className="text-slate-400 hover:text-white transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> {t.login}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-nexus-dark border-b border-nexus-border p-6 flex flex-col gap-4 shadow-2xl">
          <button onClick={() => scrollTo('services')} className="text-left text-slate-300">{t.services}</button>
          <button onClick={() => scrollTo('demo')} className="text-left text-slate-300">{t.demo}</button>
          <button onClick={() => scrollTo('catalog')} className="text-left text-slate-300">{t.catalog}</button>
          <button onClick={() => scrollTo('roi')} className="text-left text-cyan-400 font-bold">{t.roi}</button>
          <button onClick={onLoginClick} className="text-left text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4" /> {t.login}
          </button>

        </div>
      )}
    </nav>
  );
};
