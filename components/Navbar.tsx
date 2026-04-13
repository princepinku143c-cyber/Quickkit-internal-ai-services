import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/90 backdrop-blur-md border-b border-slate-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logoGrad)"/>
                <path d="M8 14L12 10L16 14L12 18Z" fill="white" fillOpacity="0.9"/>
                <path d="M12 10L16 6L20 10L16 14Z" fill="white" fillOpacity="0.6"/>
                <path d="M16 14L20 10L24 14L20 18Z" fill="white" fillOpacity="0.3"/>
                <defs>
                    <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1"/>
                        <stop offset="1" stopColor="#8b5cf6"/>
                    </linearGradient>
                </defs>
            </svg>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none">QUICKKIT</span>
            <span className="bg-[#6366f1] text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]">AI</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <button onClick={() => scrollTo('hero')} className="text-sm font-bold text-slate-300 hover:text-white transition">Home</button>
          <button onClick={() => scrollTo('services')} className="text-sm font-bold text-slate-300 hover:text-white transition">Services</button>
          <button onClick={() => scrollTo('ai-agents')} className="text-sm font-bold text-slate-300 hover:text-white transition">AI Agents</button>
          <button onClick={() => scrollTo('pricing')} className="text-sm font-bold text-slate-300 hover:text-white transition">Pricing</button>
          <button onClick={() => scrollTo('demo')} className="text-sm font-bold text-slate-300 hover:text-white transition">Demo</button>
          <button onClick={() => scrollTo('roi')} className="text-sm font-bold text-slate-300 hover:text-white transition">ROI Calculator</button>
          <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-blue-400 transition ml-4">Client Portal</Link>
          
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>

          <button 
            onClick={() => scrollTo('contact')} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] ml-2"
          >
            Contact
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#030712] border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl">
          <button onClick={() => scrollTo('hero')} className="text-left text-lg font-bold text-white">Home</button>
          <button onClick={() => scrollTo('services')} className="text-left text-lg font-bold text-slate-300">Services</button>
          <button onClick={() => scrollTo('ai-agents')} className="text-left text-lg font-bold text-slate-300">AI Agents</button>
          <button onClick={() => scrollTo('pricing')} className="text-left text-lg font-bold text-slate-300">Pricing</button>
          <button onClick={() => scrollTo('demo')} className="text-left text-lg font-bold text-slate-300">Demo</button>
          <button onClick={() => scrollTo('roi')} className="text-left text-lg font-bold text-slate-300">ROI Calculator</button>
          <Link to="/login" onClick={() => setIsOpen(false)} className="text-left text-lg font-bold text-blue-400 border-t border-slate-800 pt-4">Client Portal</Link>
          <button onClick={() => scrollTo('contact')} className="text-left text-lg font-black text-blue-600">Contact</button>
        </div>
      )}
    </nav>
  );
};
