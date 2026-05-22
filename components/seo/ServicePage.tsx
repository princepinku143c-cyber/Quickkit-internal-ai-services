import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../Navbar';
import { Link } from 'react-router-dom';

interface ServicePageProps {
  title: string;
  description: string;
  keywords: string;
  children: React.ReactNode;
}

export const ServicePage: React.FC<ServicePageProps> = ({ title, description, keywords, children }) => {
  return (
    <div className="bg-[#030712] min-h-screen font-sans text-slate-100 selection:bg-blue-500/30">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://quickkitai.com${window.location.pathname}`} />
      </Helmet>
      
      <Navbar isAuthenticated={false} />
      
      <main className="pt-24 pb-20 min-h-screen">
        {children}
      </main>

      <footer className="bg-nexus-card border-t border-nexus-border py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Built with Advanced Agentic Architecture</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 text-sm">
            <span>Sales: sales@quickkitai.com</span>
            <span>Support: support@quickkitai.com</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Twitter (X)</a>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link to="/ai-agents" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">AI Agents</Link>
            <Link to="/pricing" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Pricing</Link>
            <Link to="/about" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Terms of Service</Link>
            <Link to="/refund" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Refund Policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
