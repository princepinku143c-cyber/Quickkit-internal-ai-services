import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../Navbar';
import { Link } from 'react-router-dom';
interface ServicePageProps { title: string; description: string; keywords: string; children: React.ReactNode; }
export const ServicePage: React.FC<ServicePageProps> = ({ title, description, keywords, children }) => (
  <div className="bg-[#030712] min-h-screen font-sans text-slate-100 selection:bg-blue-500/30">
    <Helmet><title>{title}</title><meta name="description" content={description}/><meta name="keywords" content={keywords}/><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/><link rel="canonical" href={`https://quickkitai.com${window.location.pathname}`}/></Helmet>
    <Navbar isAuthenticated={false}/><main className="pt-24 pb-20 min-h-screen">{children}</main>
    <footer className="bg-nexus-card border-t border-nexus-border py-12"><div className="container mx-auto px-6 text-center text-slate-500"><p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">QuickKit AI · Real Estate AI Automation</p><div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400"><Link to="/#ai-agents">AI Agents</Link><Link to="/#pricing">Pricing</Link><Link to="/#demo">Demo</Link><Link to="/#roi">ROI Calculator</Link><Link to="/real-estate-ai-questions">Real Estate AI Questions</Link><Link to="/about">About Us</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></div><p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p></div></footer>
  </div>
);
