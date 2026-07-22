import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blog-posts';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Best AI Agents for Business in 2026',
    excerpt: 'A complete breakdown of the top multi-agent AI platforms that are replacing manual workflows, ChatGPT plugins, and Zapier for growing businesses.',
    date: 'May 18, 2026',
    readTime: '7 min read',
    category: 'AI Agents',
  },
  {
    id: 2,
    title: 'ChatGPT vs QuickKit AI — Which is Better for Business?',
    excerpt: 'ChatGPT is a chatbot. QuickKit AI is a multi-agent automation engine. Here\'s the full comparison of features, pricing, and business impact.',
    date: 'May 15, 2026',
    readTime: '6 min read',
    category: 'Comparison',
  },
  {
    id: 3,
    title: 'How to Automate Your CRM with AI Agents',
    excerpt: 'Stop manually managing contacts. Learn how AI agents can automatically capture, qualify, and follow up leads — replacing Salesforce and HubSpot.',
    date: 'May 12, 2026',
    readTime: '5 min read',
    category: 'AI CRM',
  },
  {
    id: 4,
    title: 'Free AI CRM Software: Top 5 Picks for 2026',
    excerpt: 'You don\'t need to pay for Salesforce. Discover the top free AI CRM platforms in 2026 that automate lead capture, follow-ups, and pipeline management.',
    date: 'May 10, 2026',
    readTime: '6 min read',
    category: 'AI CRM',
  },
  {
    id: 5,
    title: 'What are AI Agents? Complete Guide for Businesses (2026)',
    excerpt: 'AI Agents are autonomous systems that complete tasks without human input. This guide explains what they are, how they work, and how to deploy them.',
    date: 'May 8, 2026',
    readTime: '8 min read',
    category: 'Education',
  },
  {
    id: 6,
    title: 'AI vs Traditional CRM: Full Comparison for 2026',
    excerpt: 'Why static databases are dead. We break down the differences between traditional CRMs and agent-first architectures like QuickKit AI.',
    date: 'May 5, 2026',
    readTime: '7 min read',
    category: 'Comparison',
  },
  {
    id: 7,
    title: 'How to Generate Social Media Content with AI — Full Guide',
    excerpt: 'From Instagram captions to LinkedIn posts — discover how AI social media agents can produce, schedule, and publish content 24/7 without a team.',
    date: 'May 3, 2026',
    readTime: '5 min read',
    category: 'Social AI',
  },
  {
    id: 8,
    title: 'Free Bulk Email Sender with AI: Best Tools in 2026',
    excerpt: 'Send thousands of personalised emails without paying for Mailchimp. Compare the best free AI bulk email tools that use AI to maximise open rates.',
    date: 'April 30, 2026',
    readTime: '6 min read',
    category: 'Email Automation',
  },
  {
    id: 9,
    title: 'ICT Trading Signals with AI — How It Works',
    excerpt: 'Learn how AI agents monitor forex and crypto markets, identify ICT concepts (order blocks, FVGs), and generate trading signals automatically.',
    date: 'April 28, 2026',
    readTime: '9 min read',
    category: 'Trading AI',
  },
  {
    id: 10,
    title: 'Replace Zapier with QuickKit AI Workflows — Complete Guide',
    excerpt: 'Zapier runs basic if/then rules. QuickKit AI runs autonomous agents that think, decide, and act. Here\'s why businesses are making the switch.',
    date: 'April 25, 2026',
    readTime: '5 min read',
    category: 'AI Agents',
  },
];


export const Blog = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <Helmet>
        <title>AI Automation Blog 2026 | QuickKit AI — AI Agents, CRM & Workflow Guides</title>
        <meta name="description" content="Read the latest guides on AI agents for business, free AI CRM, ChatGPT alternatives, and workflow automation from the QuickKit AI team. Updated 2026." />
        <meta name="keywords" content="ai agents for business 2026, chatgpt vs quickkit ai, free ai crm blog, ai workflow automation guide, replace zapier with ai, ai trading signals, bulk email ai" />
        <link rel="canonical" href={`https://quickkitai.com/blog`} />
        <meta property="og:title" content="AI Automation Blog 2026 | QuickKit AI" />
        <meta property="og:description" content="Guides on AI agents, CRM automation, bulk email, social media AI and trading signals. Written by the QuickKit AI team." />
        <meta property="og:url" content="https://quickkitai.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <span className="text-blue-400">Blog</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            Deep dives into AI CRM, autonomous agents, and next-generation workflow automation for modern enterprises.
          </p>
        </div>
      </div>

      {/* Blog Feed */}
      <div className="container mx-auto px-6 max-w-5xl py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <article key={post.id} className={`group bg-slate-900/40 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 cursor-pointer ${i === 0 ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
              </div>
              
              <h2 className={`font-black text-white uppercase tracking-tight mb-4 ${i === 0 ? 'text-4xl' : 'text-2xl'} group-hover:text-blue-400 transition-colors`}>
                {post.title}
              </h2>
              
              <p className="text-slate-400 leading-relaxed mb-8">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <span className="text-sm font-mono text-slate-500">{post.date}</span>
                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Read Article <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QuickKit AI Knowledge Base</p>
      </footer>
    </div>
  );
};
