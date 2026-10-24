import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Scale, ArrowLeft } from 'lucide-react';

export const LegalPages = () => {
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.pathname.split('/').pop();
    if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, [location]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-32 px-6 spac¶»§q«^