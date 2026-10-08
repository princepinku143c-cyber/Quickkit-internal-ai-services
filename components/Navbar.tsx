import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

interface NavbarProps { onContact?: () => void; isAuthenticated?: boolean; }

export const Navbar: React.FC<NavbarProps> = ({ onContact, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/92 backdrop-blur-2xl border-b border-white/8 py-3' : 'bg-gradient-to-b from-[#030712]/75 to-transparent py-5'}`}>
      <div className="container mx-auto px-5 md:px-8 flex justify-between items-center">
        <button className="cursor-pointer bg-transparent border-0 p-0" onClick={() => scrollTo('hero')} aria-label="Go to homepage">
          <Logo size={38} showText={true} />
        </button>

        <div className="hidden lg:flex items-center gap-5">
          <button onClick={() => scrollTo('workflow')} className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">How It Works</button>
          <button onClick={() => scrollTo('ai-agents')} className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">AI Team</button>
          <button onClick={() => scrollTo('industries')} className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">Solutions</button>
          <button onClick={() => scrollTo('pricing')} className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">Pricing</button>
          <button onClick={() => scrollTo('roi')} className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">ROI</button>
          <Link to="/real-estate-ai-questions" className="text-[12px] font-bold text-slate-400 hover:text-white transition-colors">AI Answers</Link>
          <Link to={portalPath} className="text-[12px] font-bold text-blue-300 hover:text-blue-200 transition-colors">{isAuthenticated ? 'Client Portal' : 'Client Login'}</Link>
          <button onClick={() => scrollTo('demo')} className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-[0_0_32px_rgba(255,255,255,.09)]">Build AI Workforce</button>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <button onClick={() => scrollTo('demo')} className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-wider">Build AI Team</button>
          <button className="text-white p-2" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#030712]/98 backdrop-blur-2xl border-b border-white/8 p-6 flex flex-col gap-4 shadow-2xl z-[60]">
          <button onClick={() => scrollTo('hero')} className="text-left text-base font-bold text-white">Home</button>
          <button onClick={() => scrollTo('workflow')} className="text-left text-base font-bold text-slate-300">How It Works</button>
          <button onClick={() => scrollTo('ai-agents')} className="text-left text-base font-bold text-slate-300">AI Team</button>
          <button onClick={() => scrollTo('industries')} className="text-left text-base font-bold text-slate-300">Solutions</button>
          <button onClick={() => scrollTo('pricing')} className="text-left text-base font-bold text-slate-300">Pricing</button>
          <button onClick={() => scrollTo('roi')} className="text-left text-base font-bold text-slate-300">ROI</button>
          <Link to="/real-estate-ai-questions" onClick={() => setIsOpen(false)} className="text-left text-base font-bold text-slate-300">AI Answers</Link>
          <Link to={portalPath} onClick={() => setIsOpen(false)} className="text-left text-base font-bold text-blue-300 border-t border-slate-800 pt-4">{isAuthenticated ? 'Client Portal' : 'Client Login'}</Link>
          <button onClick={() => { setIsOpen(false); openContact(); }} className="text-left text-base font-black text-white pt-1">Talk to QuickKit AI →</button>
        </div>
      )}
    </nav>
  );
};