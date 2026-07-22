import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Clock, ChevronRight, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blog-posts';

// Get unique categories
const categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];

export const Blog = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = BLOG_POSTS.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'All' || p.category === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <Helmet>
        <title>AI Automation Blog 2026 | QuickKit AI — AI Agents, CRM & Workflow Guides</title>
        <meta name="description" content="Read the latest guides on AI agents, free AI CRM, workflow automation from QuickKit AI. 80+ articles." />
        <link rel="canonical" href="https://quickkitai.com/blog" />
      </Helmet>

      {/* Navigation */}
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

      {/* Hero */}
      <div className="pt-32 pb-16 border-b border-slate-800 bg-slate-900/20">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <div className="flex items-center justify-center gap-3 text-blue-500 mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Knowledge Base</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Architect Insights
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {filtered.length} articles on AI agents, CRM automation, and workflow optimization.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-6 max-w-6xl pt-8 pb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                activeCat === cat
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              {cat} {cat !== 'All' && `(${BLOG_POSTS.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-6 max-w-6xl py-8 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-slate-500">No articles found</p>
            <button onClick={() => { setSearch(''); setActiveCat('All'); }} className="mt-4 text-blue-400 hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link to={\} key={post.id}>
                <article className={`group bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer h-full flex flex-col ${
                  i === 0 && activeCat === 'All' && !search ? 'md:col-span-2 lg:col-span-2' : ''
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </div>
                  </div>
                  <h2 className={`font-black text-white uppercase tracking-tight mb-3 group-hover:text-blue-400 transition-colors ${
                    i === 0 && activeCat === 'All' && !search ? 'text-3xl' : 'text-lg'
                  }`}>
                    {post.title}
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-6 text-sm flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                    <span className="text-xs font-mono text-slate-500">{post.date}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      Read <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QuickKit AI — {filtered.length} Articles</p>
      </footer>
    </div>
  );
};
