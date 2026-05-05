import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

interface NavbarProps {
  onContact: () => void;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onContact, isAuthenticated }) => {
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
        <div className="cursor-pointer" onClick={() => scrollTo('hero')}>
          <Logo size={40} showText={true} />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">Home</a>
          <a href="#ai-agents" onClick={(e) => { e.preventDefault(); scrollTo('ai-agents'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">Services</a>
          <a href="#ai-agents" onClick={(e) => { e.preventDefault(); scrollTo('ai-agents'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">AI Agents</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">Pricing</a>
          <a href="#demo" onClick={(e) => { e.preventDefault(); scrollTo('demo'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">Demo</a>
          <a href="#roi" onClick={(e) => { e.preventDefault(); scrollTo('roi'); }} className="text-sm font-bold text-slate-300 hover:text-white transition">ROI Calculator</a>
          
          <Link to={isAuthenticated ? "/dashboard" : "/login"} replace className="text-sm font-bold text-blue-400 hover:text-blue-300 transition ml-4">
            {isAuthenticated ? "Dashboard" : "Client Portal"}
          </Link>
          
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>

          <button 
            onClick={onContact}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] ml-2 inline-flex items-center justify-center cursor-pointer"
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#030712] border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl z-[60]">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }} className="text-left text-lg font-bold text-white">Home</a>
          <a href="#ai-agents" onClick={(e) => { e.preventDefault(); scrollTo('ai-agents'); }} className="text-left text-lg font-bold text-slate-300">Services</a>
          <a href="#ai-agents" onClick={(e) => { e.preventDefault(); scrollTo('ai-agents'); }} className="text-left text-lg font-bold text-slate-300">AI Agents</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }} className="text-left text-lg font-bold text-slate-300">Pricing</a>
          <a href="#demo" onClick={(e) => { e.preventDefault(); scrollTo('demo'); }} className="text-left text-lg font-bold text-slate-300">Demo</a>
          <a href="#roi" onClick={(e) => { e.preventDefault(); scrollTo('roi'); }} className="text-left text-lg font-bold text-slate-300">ROI Calculator</a>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} replace onClick={() => setIsOpen(false)} className="text-left text-lg font-bold text-blue-400 border-t border-slate-800 pt-4">
            {isAuthenticated ? "Dashboard" : "Client Portal"}
          </Link>
          <button onClick={() => { setIsOpen(false); onContact(); }} className="text-left text-lg font-black text-blue-600">Contact</button>
        </div>
      )}
    </nav>
  );
};
