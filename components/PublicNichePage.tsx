import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SeoMeta } from './SeoMeta';
import { Zap, Sparkles, CheckCircle2, MapPin, Clock, ArrowRight, Bot } from 'lucide-react';

interface NicheDetails {
  title: string;
  sub: string;
  description: string;
  keywords: string;
  features: string[];
}

const NICHE_DATA: Record<string, NicheDetails> = {
  'real-estate': {
    title: 'AI Agents for Real Estate in India',
    sub: 'Qualify property leads, capture requirements, follow up on WhatsApp and keep CRM workflows moving 24/7.',
    description: 'QuickKit AI builds managed AI agent systems for Indian real-estate businesses, including lead qualification, WhatsApp follow-up, CRM workflows and sales automation.',
    keywords: 'real estate AI agents India, real estate AI automation India, property lead automation, WhatsApp real estate AI, real estate CRM automation',
    features: ['Property enquiry intake and qualification', 'Budget, location and requirement capture', 'WhatsApp and follow-up automation', 'CRM pipeline and lead workflow automation']
  },
  'e-commerce': {
    title: 'AI Agents for E-Commerce in India',
    sub: 'Automate customer support, order questions, product discovery and repetitive commerce workflows.',
    description: 'Managed AI agents for Indian e-commerce businesses covering customer support, product questions, order workflows and business automation.',
    keywords: 'ecommerce AI agents India, ecommerce AI automation India, AI customer support ecommerce, ecommerce workflow automation',
    features: ['Product and order question handling', 'Customer support automation', 'Lead and customer follow-up workflows', 'CRM and business system integrations']
  },
  'healthcare': {
    title: 'AI Agents for Healthcare Clinics in India',
    sub: 'Automate approved administrative workflows such as enquiries, intake and appointment coordination.',
    description: 'Managed AI automation for Indian healthcare businesses focused on approved administrative workflows, patient enquiries, intake and appointment coordination.',
    keywords: 'healthcare AI agents India, clinic AI automation India, appointment automation India, healthcare workflow automation',
    features: ['Administrative enquiry handling', 'Structured intake workflows', 'Appointment coordination', 'CRM and approved system integrations']
  },
  'agency': {
    title: 'AI Agents for Digital Agencies in India',
    sub: 'Automate lead intake, client onboarding, proposals and repetitive agency operations.',
    description: 'Managed AI agents for Indian digital and creative agencies covering lead qualification, onboarding, proposals, client communication and workflow automation.',
    keywords: 'agency AI agents India, digital agency AI automation, client onboarding AI, agency workflow automation India',
    features: ['Lead qualification and intake', 'Client onboarding automation', 'Proposal and follow-up workflows', 'CRM and project workflow automation']
  },
  'travel': {
    title: 'AI Agents for Travel Agencies in India',
    sub: 'Capture travel requirements, answer routine enquiries and automate approved follow-up workflows.',
    description: 'Managed AI automation for Indian travel businesses covering enquiry intake, itinerary workflows, customer support and follow-up automation.',
    keywords: 'travel AI agents India, travel agency AI automation, itinerary AI India, travel CRM automation',
    features: ['Destination and budget requirement capture', 'Travel enquiry automation', 'Itinerary workflow assistance', 'CRM and follow-up automation']
  }
};

export const PublicNichePage: React.FC = () => {
  const { niche } = useParams<{ niche: string }>();
  const data = NICHE_DATA[niche || ''] || {
    title: `AI Agents for ${niche ? niche.replace(/-/g, ' ') : 'Business'} in India`,
    sub: 'Deploy managed AI agents for sales, support, CRM, WhatsApp and repetitive business workflows.',
    description: 'QuickKit AI builds and manages custom AI agent systems for Indian businesses across sales, support, CRM, messaging and business workflows.',
    keywords: 'AI agents India, AI automation India, managed AI agents, business AI automation, custom AI agents India',
    features: ['Custom business workflow automation', 'AI sales and support workflows', 'WhatsApp and CRM integrations', 'Managed deployment and maintenance']
  };

  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.title,
    description: data.description,
    provider: { '@type': 'Organization', name: 'QuickKit AI', url: 'https://quickkitai.com' },
    areaServed: { '@type': 'Country', name: 'India' },
    serviceType: 'AI automation and managed AI agent deployment'
  };

  return (
    <div className="bg-[#030712] min-h-screen text-slate-300 font-sans flex flex-col">
      <SeoMeta title={`${data.title} | QuickKit AI`} description={data.description} keywords={data.keywords} schemaObj={schemaObj} />
      <header className="border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Zap className="text-white w-5 h-5" /></div><span className="font-bold text-white text-lg">QuickKit AI</span></Link>
          <Link to="/contact" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">Talk to us</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32 flex-1 text-center">
        <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest inline-flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> India Business AI</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight mt-10">{data.title}</h1>
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mt-8">{data.sub}</p>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mt-14 text-left">
          {data.features.map((feature) => <div key={feature} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-slate-300 font-semibold">{feature}</span></div>)}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to="/contact" className="py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">Discuss your workflow <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/" className="py-4 px-8 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest">Explore QuickKit AI</Link>
        </div>
      </main>
      <footer className="border-t border-slate-800/60 py-8"><div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> India</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Managed AI operations</span><span>© {new Date().getFullYear()} QuickKit AI. All rights reserved.</span></div></footer>
    </div>
  );
};
