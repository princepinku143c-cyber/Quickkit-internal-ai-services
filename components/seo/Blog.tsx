import React from 'react';
import { SeoMeta } from '../SeoMeta';
import { ArrowLeft, BookOpen, ShieldCheck, Building2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RESOURCES = [
  {
    title: 'AI Lead Qualification for Real Estate in India',
    category: 'Practical Guide',
    description: 'A step-by-step workflow for property enquiry intake, qualification questions, CRM handoff, site-visit confirmation, and performance measurement.',
    href: '/guides/real-estate-ai-lead-qualification',
    icon: Building2,
    label: 'Read the guide'
  },
  {
    title: 'Real Estate AI: Questions Buyers Actually Ask',
    category: 'Questions & Answers',
    description: 'Straight answers about AI agents, WhatsApp workflows, voice workflows, property lead qualification, site visits, CRM integrations, and how to evaluate an AI provider.',
    href: '/real-estate-ai-questions',
    icon: MessageCircle,
    label: 'Browse answers'
  },
  {
    title: 'Real Estate AI Automation Services',
    category: 'Service Overview',
    description: 'Review the lead-capture, qualification, follow-up, appointment, and CRM workflows that can be scoped and verified for a real-estate team.',
    href: '/services/real-estate',
    icon: ShieldCheck,
    label: 'Explore the service'
  }
];

export const Blog = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <SeoMeta
        title="Real Estate AI Knowledge Hub | Raja AI Systems"
        description="Practical resources on real-estate AI lead qualification, WhatsApp follow-up, site-visit workflows, CRM handoff, and managed AI automation in India."
        keywords="real estate AI guide India, property lead qualification, AI WhatsApp follow-up, real estate CRM automation, site visit workflow"
        canonical="https://quickkitai.com/blog"
      />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/services/real-estate" className="hover:text-white transition-colors">Real Estate</Link>
            <Link to="/real-estate-ai-questions" className="hover:text-white transition-colors">Questions</Link>
            <span className="text-blue-400">Knowledge Hub</span>
          </div>
        </div>
      </nav>
      <header className="pt-32 pb-16 border-b border-slate-800 bg-slate-900/20">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="flex items-center justify-center gap-3 text-blue-500 mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Real Estate AI, Explained Clearly
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Practical, reader-facing resources for Indian builders, developers, brokerages, and sales teams. We list published guides and service information here rather than presenting unfinished summaries as full articles.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-6 max-w-5xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RESOURCES.map(({ title, category, description, href, icon: Icon, label }) => (
            <article key={href} className="group bg-slate-900/40 border border-slate-800 rounded-3xl p-7 hover:bg-slate-800/50 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-5 text-blue-400">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">{category}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-4">{title}</h2>
              <p className="text-slate-400 leading-relaxed mb-7">{description}</p>
              <Link to={href} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300 hover:text-emerald-200">
                {label} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-9">
          <h2 className="text-2xl font-black text-white">What makes a useful AI automation resource?</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            We focus on verifiable workflows, clear integration boundaries, human handoff, data protection, and measurable operating outcomes. A connector listed in a catalogue is not treated as a live production integration until it is tested for the client account.
          </p>
        </section>
      </main>
      <footer className="py-10 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Raja AI Systems · Practical AI Automation Resources</p>
      </footer>
    </div>
  );
};
