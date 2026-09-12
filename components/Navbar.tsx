import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

interface NavbarProps { onContact?: () => void; isAuthenticated?: boolean; }

export const Navbar: React.FC<NavbarProps> = ({ onContact, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') { window.location.href = `/#${id}`; return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openContact = () => {
    setIsOpen(false);
    if (onContact) onContact();
    else window.location.href = '/contact';
  };

  const portalPath = isAuthenticated ? '/client' : '/login';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/88 backdrop-blur-xl border-b border-slate-800/80 py-3.5' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <button className="cursor-pointer bg-transparent border-0 p-0" onClick={() => scrollTo('hero')} aria-label="Go to homepage"><Logo size={40} showText={true} /></button>
        <div className="hidden lg:flex items-center gap-6">
          <button onClick={() => scrollTo('hero')} className="text-[13px] font-bold text-slate-400 hover:text-white transition">Home</button>
          <button onClick={() => scrollTo('ai-agents')} className="text-[13px] font-bold text-slate-400 hover:text-white transition">AI Teammates</button>
          <button onClick={() => scrollTo('industries')} className="text-[13px] font-bold text-slate-400 hover:text-white transition">Solutions</button>
          <button onClick={() => scrollTo('pricing')} className="text-[13px] font-bold text-slate-400 hover:text-white transition">Pricing</button>
          <button onClick={() => scrollTo('roi')} className="text-[13px] font-bold text-slate-400 hover:text-white transition">ROI</button>
          <Link to="/real-estate-ai-questions" className="text-[13px] font-bold text-slate-400 hover:text-white transition">AI Answers</Link>
          <Link to={portalPath} className="text-[13px] font-bold text-blue-400 hover:text-blue-300 transition">{isAuthenticated ? 'Client Portal' : 'Client Login'}</Link>
          <button onClick={() => scrollTo('demo')} className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl font-black text-[12px] transition-all shadow-[0_0_28px_rgba(255,255,255,0.08)]">Build AI Workforce</button>
        </div>
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'}>{isOpen ? <X /> : <Menu />}</button>
      </div>
      {isOpen && <div className="lg:hidden absolute top-full left-0 w-full bg-[#030712]/98 backdrop-blur-xl border-b border-slate-800 p-6 flex flex-col gap-5 shadow-2xl z-[60]">
        <button onClick={() => scrollTo('hero')} className="text-left text-lg font-bold text-white">Home</button>
        <button onClick={() => scrollTo('ai-agents')} className="text-left text-lg font-bold text-slate-300">AI Teammates</button>
        <button onClick={() => scrollTo('industries')} className="text-left text-lg font-bold text-slate-300">Solutions</button>
        <button onClick={() => scrollTo('pricing')} className="text-left text-lg font-bold text-slate-300">Pricing</button>
        <button onClick={() => scrollTo('roi')} className="text-left text-lg font-bold text-slate-300">ROI</button>
        <Link to="/real-estate-ai-questions" onClick={() => setIsOpen(false)} className="text-left text-lg font-bold text-slate-300">AI Answers</Link>
        <Link to={portalPath} onClick={() => setIsOpen(false)} className="text-left text-lg font-bold text-blue-400 border-t border-slate-800 pt-4">{isAuthenticated ? 'Client Portal' : 'Client Login'}</Link>
        <button onClick={() => scrollTo('demo')} className="text-left text-lg font-black text-white">Build AI Workforce</button>
      </div>}
    </nav>
  );
};
