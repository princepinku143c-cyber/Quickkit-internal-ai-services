import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, Tag, User, Share2, CheckCircle2, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blog-posts';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const post = BLOG_POSTS.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-300 font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Article Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">The requested article could not be located in our archive.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Related posts (different id, same or adjacent category)
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id && (p.category === post.category || true)).slice(0, 3);

  const articleUrl = `https://quickkitai.com/blog/${post.id}`;
  const canonicalUrl = articleUrl;

  // Convert human date to valid ISO 8601 string for Googlebot
  const isoDate = (() => {
    try {
      const parsed = new Date(post.date);
      return !isNaN(parsed.getTime()) ? parsed.toISOString() : '2026-11-14T00:00:00Z';
    } catch {
      return '2026-11-14T00:00:00Z';
    }
  })();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [
      'https://quickkitai.com/og-image.png'
    ],
    url: articleUrl,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: 'QuickKit AI Architecture Team',
      url: 'https://quickkitai.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickKit AI',
      url: 'https://quickkitai.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://quickkitai.com/apple-touch-icon.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quickkitai.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://quickkitai.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl }
    ]
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-blue-500/30">
      <Helmet>
        <title>{`${post.title} | QuickKit AI`}</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.title}, ${post.category}, AI agents, business automation, QuickKit AI`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | QuickKit AI`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="QuickKit AI" />
        <meta property="og:image" content="https://quickkitai.com/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | QuickKit AI`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://quickkitai.com/og-image.png" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-white font-black uppercase tracking-tight hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>
          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">Deploy AI</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-36 pb-16 border-b border-slate-800 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb links */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-6 uppercase tracking-wider">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-slate-300">Blog</Link>
            <span>/</span>
            <span className="text-blue-400 truncate max-w-xs">{post.category}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-6 font-bold uppercase tracking-widest">
            <Tag className="w-3.5 h-3.5" /> {post.category}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              <span>QuickKit AI Architecture Team</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Article Content */}
      <main className="container mx-auto px-6 max-w-4xl py-16">
        <article className="prose prose-invert max-w-none space-y-10 text-slate-300 text-lg leading-relaxed">
          {/* Lead Paragraph */}
          <p className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed border-l-4 border-blue-500 pl-6 py-2 bg-slate-900/40 rounded-r-2xl">
            {post.excerpt}
          </p>

          {/* BLUF: Key Takeaways (GEO / AI Answer Engine Snippet Optimized) */}
          <div className="my-8 p-6 md:p-8 bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-500/30 rounded-2xl shadow-xl shadow-blue-950/20">
            <div className="flex items-center gap-3 mb-4 text-blue-400 font-black uppercase text-xs tracking-[0.25em]">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Key Takeaways (Executive Summary)</span>
            </div>
            <ul className="space-y-3 text-slate-200 text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Core Solution:</strong> {post.excerpt}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Deployment Velocity:</strong> 72-hour custom deployment — test your working multi-agent system live before paying $1.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Operational Impact:</strong> Replaces manual data entry and sluggish response times with 24/7 autonomous agents, cutting response times to under 60 seconds and overhead by up to 90%.</span>
              </li>
            </ul>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-4">
              1. The Modern Challenge in Business Operations
            </h2>
            <p>
              Manual workflows, fragmented communication channels, and repetitive operational tasks drain company resources
              every day. Businesses scaling their operations encounter critical bottlenecks: delayed response times, dropped leads,
              and team burnout. Relying purely on human manual labor to manage 24/7 pipelines is no longer viable in a high-velocity global market.
            </p>
            <p>
              This is where goal-oriented AI automation bridges the gap. Instead of simple conditional scripts or static chatbots,
              companies are now leveraging autonomous AI agents capable of planning, executing complex multi-step workflows, and continuously learning from system interactions.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-4">
              2. How Autonomous AI Agents Solve This Problem
            </h2>
            <p>
              Autonomous agents differ fundamentally from traditional software bots. While legacy tools require rigid if-then triggers,
              an AI agent powered by state-of-the-art reasoning architectures can dynamically parse context, determine the optimal path of action,
              and call external tools or APIs in real time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
                <div className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> Continuous 24/7 Execution
                </div>
                <p className="text-sm text-slate-400">
                  Operate non-stop across global timezones. Inbound leads are qualified and answered within 60 seconds, day or night.
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
                <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Tool &amp; API Integration
                </div>
                <p className="text-sm text-slate-400">
                  Directly read, write, and sync records across your CRM, email providers, payment processors, and custom databases.
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
                <div className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" /> Error-Resilient Workflows
                </div>
                <p className="text-sm text-slate-400">
                  Built-in feedback loops, self-correction, and human-in-the-loop escalation paths guarantee operational safety.
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
                <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" /> Predictable Unit Economics
                </div>
                <p className="text-sm text-slate-400">
                  Scale your business output 10x without proportional increases in overhead or headcount costs.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-4">
              3. Practical 3-Day Implementation Roadmap
            </h2>
            <p>
              At QuickKit AI, we believe you shouldn&apos;t wait months for enterprise deployments. Our rapid implementation standard
              deploys end-to-end autonomous systems in 72 hours:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong className="text-white">Day 1 — Architecture &amp; Data Pipeline:</strong> Map current business inputs, configure API webhooks, and calibrate the system context prompt to your exact business rules.
              </li>
              <li>
                <strong className="text-white">Day 2 — Agent Integration &amp; Sandbox Testing:</strong> Connect CRM endpoints, verify lead qualification gates, and stress-test synthetic interactions to verify high accuracy.
              </li>
              <li>
                <strong className="text-white">Day 3 — Production Rollout &amp; Live Verification:</strong> Deploy on secure cloud infrastructure, activate real-time telemetry monitoring, and verify end-to-end execution.
              </li>
            </ol>
          </section>

          {/* High Impact Call-to-Action Card */}
          <div className="my-12 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900/80 border border-blue-500/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-[11px] font-mono text-blue-300 uppercase tracking-widest font-black mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Free to Start 2026
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
                Deploy This System For Your Business
              </h3>
              <p className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
                See your custom AI agent and automation architecture live before paying anything. Our team guarantees rapid 3-day turnaround.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/"
                  className="px-8 py-4 bg-white text-nexus-dark font-black text-sm uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  Explore AI Architect <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center"
                >
                  View Transparent Pricing
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles Grid */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-widest font-bold mb-4">
              <BookOpen className="w-4 h-4" /> Keep Reading
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-8">
              Related Insights &amp; Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.id}`}
                  className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col justify-between transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full mb-3 inline-block">
                      {rel.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug mb-3">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-4 pt-4 border-t border-slate-800/50">
                    <span>{rel.readTime}</span>
                    <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-nexus-card border-t border-nexus-border py-12 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6">
          <p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">
            QuickKit AI • Global Autonomous Workforce OS
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link to="/ai-agents" className="hover:text-blue-400 transition-colors">AI Agents</Link>
            <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
            <Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
            <Link to="/solutions/real-estate" className="hover:text-blue-400 transition-colors">Real Estate AI</Link>
            <Link to="/solutions/e-commerce" className="hover:text-blue-400 transition-colors">E-Commerce AI</Link>
            <Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
