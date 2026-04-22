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
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => scrollTo('hero')}>
          <div className="relative flex-shrink-0 group-hover:scale-110 transition-all duration-500">
            {/* Soft Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-25 group-hover:opacity-60 transition-opacity"></div>
            
            <div className="relative w-10 h-10 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="z-10">
                  <rect width="40" height="40" rx="10" fill="url(#premiumGrad)"/>
                  {/* AI Neural Symbol */}
                  <circle cx="20" cy="20" r="4" fill="white" fillOpacity="0.9"/>
                  <path d="M20 12V16M20 24V28M12 20H16M24 20H28M14.5 14.5L17 17M23 23L25.5 25.5M14.5 25.5L17 23M23 17L25.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
                  <defs>
                      <linearGradient id="premiumGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#3b82f6"/>
                          <stop offset="1" stopColor="#8b5cf6"/>
                      </linearGradient>
                  </defs>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white tracking-[-0.03em] font-sans">QUICKKIT</span>
            <div className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <span className="text-[10px] font-black text-blue-400 tracking-wider">AI</span>
            </div>
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

          <a 
            href="mailto:sales@quickkitai.com"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] ml-2 inline-flex items-center justify-center cursor-pointer"
          >
            Contact
          </a>
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
          <button onClick={() => { setIsOpen(false); window.location.href = "mailto:sales@quickkitai.com"; }} className="text-left text-lg font-black text-blue-600">Contact</button>
        </div>
      )}
    </nav>
  );
};
