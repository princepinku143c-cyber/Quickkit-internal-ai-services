import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoMeta } from '../SeoMeta';
import { ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../../data/blog-posts';

export const Blog = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <SeoMeta title="AI Automation Blog 2026 | QuickKit AI" description="84 articles on AI agents, CRM automation, and workflow automation." keywords="AI agents, CRM automation, AI blog, QuickKit AI" ogType="blog" />
      <Helmet>
        <title>AI Automation Blog 2026 | QuickKit AI</title>
        <meta name="description" content="Read the latest guides on AI agents, free AI CRM, workflow automation from QuickKit AI. 80+ articles." />
        <link rel="canonical" href="https://quickkitai.com/blog" />
      </Helmet>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <span className="text-blue-400">Blog</span>
          </div>
        </div>
      </nav>
      <div className="pt-32 pb-20 border-b border-slate-800 bg-slate-900/20">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="flex items-center justify-center gap-3 text-blue-500 mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Knowledge Base</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Architect Insights
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {BLOG_POSTS.length} articles on AI agents, CRM automation, and next-generation workflow automation.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-6 max-w-5xl py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...BLOG_POSTS].reverse().map((post, i) => (
            <article key={post.id} className={`group bg-slate-900/40 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 cursor-pointer ${i === 0 ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{post.category}</span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono"><Clock className="w-3 h-3" />{post.readTime}</div>
              </div>
              <h2 className={`font-black text-white uppercase tracking-tight mb-4 group-hover:text-blue-400 transition-colors ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>{post.title}</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <span className="text-sm font-mono text-slate-500">{post.date}</span>
                <Link to={`/blog/${post.id}`} className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Read Article <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QuickKit AI Knowledge Base</p>
      </footer>
    </div>
  );
};
