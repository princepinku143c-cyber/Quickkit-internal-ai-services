import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../data/blog-posts';

export const BlogPost = () => {
  const { id } = useParams();
  const post = BLOG_POSTS.find(p => p.id === Number(id));
  if (!post) {
    return <div className="min-h-screen bg-[#030712] text-slate-300 flex items-center justify-center">
      <div className="text-center"><h1 className="text-4xl font-black text-white mb-4">Not Found</h1><Link to="/blog" className="text-blue-400">Back to Blog</Link></div></div>;
  }
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <Helmet><title>{post.title} | QuickKit AI</title><meta name="description" content={post.excerpt} /></Helmet>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <Link to="/blog" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
        </div>
      </nav>
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
            <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-8">{post.title}</h1>
          <div className="border-l-4 border-blue-500/30 pl-6 mb-12">
            <p className="text-slate-400 text-lg leading-relaxed">{post.excerpt}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400 mb-6">Want the full article with implementation guide? Get started with QuickKit AI.</p>
            <div className="flex gap-4 justify-center">
              <a href="/pricing" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors">View Plans</a>
              <Link to="/blog" className="border border-slate-700 hover:border-slate-500 text-white font-bold px-6 py-3 rounded-full transition-colors">More Articles</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
