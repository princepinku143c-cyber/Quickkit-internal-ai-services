import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Globe, User, Megaphone, Bot, CheckCircle2, ArrowLeft,
  Key, FileText, Zap, Target, AlertTriangle, Check, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TopTab = 'overview' | 'issues' | 'perfect-ad';
type SubTab = 'ai-agent-seo' | 'action-plan';

// ─── Data ─────────────────────────────────────────────────────────────────────
const PHASE1 = [
  'Google Search Console mein website add karo',
  'Sitemap.xml generate karo aur submit karo',
  'Robots.txt file add karo',
  'Title and meta description duplicate check aur fix karo',
  'Meta description update karo (use recommended keyphrases)',
  'Alt text update karo (social shares)',
  'Broken links/404s detect karo',
  'PageSpeed Insights score check (target >90)',
  'Manual indexing request karo Google Search Console mein',
];

const PHASE2 = [
  'H1 tag replacement karo (Mockups/Highest focus)',
  'Alt tags and search intent matching karo',
  'Cloudflare CDN setup karo (free)',
  'Schema markup add karo',
  'API docs and integration/features target pages',
  '5 backlink karo (high authority)',
  'ChatGPT vs Competitors comparison page banao',
  'Zapier vs Competitors comparison page banao',
  'Interlinking build karo',
  'Microsoft Clarity integration karo',
];

const PHASE3 = [
  '10 Blog posts publish karo (AI agents topic per)',
  'PR and Outreach start karo',
  'Guest post opportunities dhoondho',
  'Competitors backlink check karo',
  'Social bookmarks setup karo',
  'Video marketing start karo (YouTube)',
  'Newsletter start karo (use Beehiiv/Substack)',
  'Quora and Reddit answers post karo',
  'Competitors roadmap analysis karo (what\'s next)',
  'Audit in 2-3 months check karo',
];

const PROJECTED = [
  { week: 'Week 1–2', result: 'Google indexing improve ho jayegi (Index ratio 2x – 3x)' },
  { week: 'Week 3',   result: "Brand keyword 'QuickKit' rank #1 (current rank: 4)" },
  { week: 'Week 4',   result: 'AI Agent related queries rank 3-5 (Traffic +20–30% estimate)' },
  { week: 'Week 5',   result: 'Backlink profile strong (Target DR 15+ estimate)' },
  { week: 'Week 6',   result: 'Established authority in AI niches (Traffic +50% estimate)' },
];

const AI_KEYWORDS = [
  'ai agents for business 2026',
  'best ai agent platform',
  'ai agents vs chatgpt',
  'multi agent ai system',
  'autonomous ai agents',
  'ai agent workflow automation',
  'free ai agents online',
  'ai agents like devin',
  'business ai agents',
  'ai agent crm',
];

const LATEST_PAGES = [
  'What Are AI Agents? (Educational SEO guide)',
  'QuickKit AI vs ChatGPT – Full Comparison',
  'QuickKit AI vs Zapier – Why AI Agents Win',
  'How Our Multi-Agent System Works (Workflow + Overview)',
  'AI Agents for CRM, Email, Social Media & Trading',
];

const COMPARISON_ROWS = [
  { feature: 'Multi-Agent System',  qk: true,  gpt: false, zapier: false },
  { feature: 'Free CRM',            qk: true,  gpt: false, zapier: false },
  { feature: 'Bulk Email',          qk: true,  gpt: false, zapier: 'warn' },
  { feature: 'Social Media AI',     qk: true,  gpt: 'warn', zapier: 'warn' },
  { feature: 'Trading AI Agents',   qk: true,  gpt: false, zapier: false },
  { feature: 'Voice AI',            qk: true,  gpt: false, zapier: false },
  { feature: 'Free to Start',       qk: true,  gpt: 'warn', zapier: 'warn' },
];

const AD_KEYWORDS = [
  'ai agents for business', 'best ai crm software', 'cheap alternative chatgpt',
  'ai automation tool', 'ai workflow automation', 'ai crm free',
  'multi agent ai platform', 'ai agents like devin', 'replace zapier with ai', 'ai sales automation',
];

const AD_MISTAKES = [
  'Quality Score low hai – Ad copy and landing page mismatch hota hai.',
  'Landing page slow hai (78 speed) – Google penalise karta hai.',
  'CTR history nahi – New ad account = low trust.',
  'Keyword match type wrong – Broad match instead of Exact/Phrase.',
  'Ad extensions missing – Sitelinks, callouts, structured snippets add karo.',
];

// ─── Helper Components ─────────────────────────────────────────────────────────
const CellIcon = ({ val }: { val: boolean | string }) => {
  if (val === true)   return <span className="flex justify-center"><Check size={16} className="text-emerald-400" /></span>;
  if (val === false)  return <span className="flex justify-center"><X size={16} className="text-red-400" /></span>;
  return <span className="flex justify-center"><AlertTriangle size={14} className="text-yellow-400" /></span>;
};

const Pill: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-block px-3 py-1 text-xs font-mono border border-cyan-500/50 text-cyan-300 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-default">
    {text}
  </span>
);

// ─── Checklist Component ───────────────────────────────────────────────────────
const Checklist = ({
  items, color, label
}: { items: string[]; color: string; label: string }) => {
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));
  const toggle = (i: number) => setChecked(c => c.map((v, idx) => idx === i ? !v : v));

  const colors: Record<string, string> = {
    red:    'border-red-500/70 text-red-400',
    orange: 'border-orange-500/70 text-orange-400',
    green:  'border-emerald-500/70 text-emerald-400',
  };
  const border = colors[color];

  return (
    <div className={`rounded-2xl border ${border.split(' ')[0]} bg-slate-900/60 p-5 space-y-3`}>
      <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${border.split(' ')[1]} mb-4`}>{label}</h3>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          className={`w-full flex items-start gap-3 text-left group transition-all`}
        >
          <span className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all
            ${checked[i]
              ? `${border.split(' ')[0]} bg-current`
              : `${border.split(' ')[0]} bg-transparent`
            }`}>
            {checked[i] && <Check size={11} className="text-slate-900" />}
          </span>
          <span className={`text-sm font-mono leading-snug transition-colors
            ${checked[i] ? 'line-through text-slate-600' : 'text-slate-300 group-hover:text-white'}`}>
            {item}
          </span>
        </button>
      ))}
      <p className="text-right font-mono text-[10px] text-slate-600">
        {checked.filter(Boolean).length}/{items.length} complete
      </p>
    </div>
  );
};

// ─── Tab: Action Plan ─────────────────────────────────────────────────────────
const ActionPlanTab = () => (
  <div className="space-y-6">
    <Checklist items={PHASE1} color="red"    label="⚡ PHASE 1 — AAT KARO (24 HOURS)" />
    <Checklist items={PHASE2} color="orange" label="🔧 PHASE 2 — IN HAFTE (7 DAYS)" />
    <Checklist items={PHASE3} color="green"  label="🚀 PHASE 3 — IS MAHINE (30 DAYS)" />

    {/* Projected Results */}
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
        ✅ PROJECTED RESULTS AFTER FIXES
      </h3>
      <div className="space-y-2">
        {PROJECTED.map((p, i) => (
          <div key={i} className="flex items-baseline gap-3 bg-slate-800/50 rounded-xl px-4 py-3">
            <span className="font-mono text-xs font-bold text-cyan-400 shrink-0 w-16">{p.week}</span>
            <span className="text-sm text-slate-300">{p.result}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Tab: AI Agent SEO ────────────────────────────────────────────────────────
const AIAgentSEOTab = () => (
  <div className="space-y-8">
    {/* Strategy Summary */}
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-sm font-bold text-cyan-400 mb-3">🤖 AI AGENT SEO STRATEGY:</h3>
      <p className="text-sm text-slate-300 leading-relaxed">
        Aaj kal AI agents vs ChatGPT alternatives search bohot hain. QuickKit AI asani se inn terms par rank kar sakta hai.
        Yeh keywords millions mein search hote hain — yeh yahi aapka <span className="text-cyan-300 font-semibold">biggest opportunity hai.</span>
      </p>
    </div>

    {/* Perfect H1 */}
    <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-5">
      <h3 className="font-mono text-sm font-bold text-red-400 mb-4">🚨 Perfect H1 Tag for AI Agent Traffic:</h3>
      <div className="rounded-xl border border-cyan-400/40 bg-slate-900/80 p-4 text-center">
        <p className="font-mono text-base font-bold text-cyan-200 leading-snug">
          "The AI Agent Platform That Beats ChatGPT for Business"
        </p>
      </div>
    </div>

    {/* Keywords */}
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Key size={14} /> AI AGENT KEYWORDS TO TARGET:
      </h3>
      <div className="flex flex-wrap gap-2">
        {AI_KEYWORDS.map((kw, i) => <Pill key={i} text={kw} />)}
      </div>
    </div>

    {/* Latest Pages */}
    <div className="rounded-2xl border border-orange-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-sm font-bold text-orange-400 mb-4 flex items-center gap-2">
        <FileText size={14} /> LATEST PAGES BANAO:
      </h3>
      <ol className="space-y-2">
        {LATEST_PAGES.map((p, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
            <span className="font-mono text-xs text-orange-400 shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}.</span>
            <span className="text-sm text-slate-300">{p}</span>
          </li>
        ))}
      </ol>
    </div>

    {/* Comparison Table */}
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-5 overflow-x-auto">
      <h3 className="font-mono text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <Zap size={14} /> ADD THIS COMPARISON ON HOMEPAGE — INSTANT SEO TRAFFIC
      </h3>
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-2 pr-4 font-mono text-xs text-slate-500 font-medium">Feature</th>
            <th className="text-center py-2 px-3 font-mono text-xs text-cyan-400 font-bold">QuickKit AI</th>
            <th className="text-center py-2 px-3 font-mono text-xs text-slate-500 font-medium">ChatGPT</th>
            <th className="text-center py-2 px-3 font-mono text-xs text-slate-500 font-medium">Zapier</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{row.feature}</td>
              <td className="py-3 px-3"><CellIcon val={row.qk} /></td>
              <td className="py-3 px-3"><CellIcon val={row.gpt} /></td>
              <td className="py-3 px-3"><CellIcon val={row.zapier} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Tab: Perfect Ad ──────────────────────────────────────────────────────────
const PerfectAdTab = () => (
  <div className="space-y-8">
    {/* Google Ad Mockup */}
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Megaphone size={14} /> GOOGLE SEARCH AD — PERFECT VERSION
      </h3>
      <div className="rounded-2xl bg-white shadow-2xl p-5 max-w-xl">
        <p className="text-[11px] text-slate-400 mb-1">Sponsored</p>
        <p className="text-blue-700 font-semibold text-base leading-snug hover:underline cursor-pointer">
          QuickKit AI – Free AI Agent CRM | Replace ChatGPT + Zapier in 1 Tool | Multi-Agent | CRM | Bulk Email | AI
        </p>
        <p className="text-emerald-700 text-xs mt-1 mb-2">quickkitai.com/free</p>
        <p className="text-slate-700 text-xs leading-relaxed">
          AI Agents that automate your CRM, email, social media & trading signals. Built for businesses. Start FREE today — no credit card needed.
        </p>
        <p className="text-slate-700 text-xs leading-relaxed mt-1">
          Used by smart businesses replacing Salesforce & Zapier. Try QuickKit AI — AI-powered CRM automation with multi-agent workflows.
        </p>
      </div>
    </div>

    {/* Ad Copy Breakdown */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { label: 'HEADLINE 1', copy: 'QuickKit AI – Free AI Agent CRM',           tip: '💡 Brand name + free keyword (High CTR)' },
        { label: 'HEADLINE 2', copy: 'Replace ChatGPT – Zapier in 1 Tool',         tip: '💡 Comparison keywords + 2 major competitors' },
        { label: 'HEADLINE 3', copy: 'Multi Agent | CRM | Bulk Email | AI',         tip: '💡 All features listed (High relevancy)' },
        {
          label: 'DESCRIPTION 1',
          copy: 'AI Agents that automate your CRM, email, social media & trading signals. Built for businesses. Start FREE today — no credit card needed.',
          tip: '💡 Pain point + CTR + Free offer',
        },
        {
          label: 'DESCRIPTION 2',
          copy: 'Used by smart businesses replacing Salesforce & Zapier. Try QuickKit AI — AI-powered CRM automation with multi-agent workflows.',
          tip: '💡 Social proof + competitor keywords list',
        },
      ].map((card, i) => (
        <div key={i} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 hover:border-cyan-500/50 transition-colors">
          <p className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">{card.label}</p>
          <p className="text-slate-200 text-sm font-medium leading-snug mb-3">"{card.copy}"</p>
          <p className="text-slate-500 text-xs italic">{card.tip}</p>
        </div>
      ))}
    </div>

    {/* Target Keywords */}
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5">
      <h3 className="font-mono text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Target size={14} /> TARGET KEYWORDS FOR GOOGLE ADS
      </h3>
      <div className="flex flex-wrap gap-2">
        {AD_KEYWORDS.map((kw, i) => <Pill key={i} text={kw} />)}
      </div>
    </div>

    {/* Mistakes */}
    <div className="rounded-2xl border border-yellow-500/40 bg-yellow-950/20 p-5">
      <h3 className="font-mono text-sm font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <AlertTriangle size={14} /> Ye Galti Na Kare Har Ad!
      </h3>
      <ol className="space-y-2">
        {AD_MISTAKES.map((m, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="font-mono text-xs text-yellow-500 shrink-0 mt-0.5">{i + 1}.</span>
            <span className="text-sm text-yellow-200/80">{m}</span>
          </li>
        ))}
      </ol>
    </div>
  </div>
);

// ─── Main Export ──────────────────────────────────────────────────────────────
export const SEOAudit = () => {
  const [topTab, setTopTab] = useState<TopTab>('issues');
  const [subTab, setSubTab] = useState<SubTab>('action-plan');

  // Which content to render
  const showSubTabs = topTab === 'issues';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <Helmet>
        <title>SEO Audit 2026 | QuickKit AI — AI Agent Rankings & Growth Strategy</title>
        <meta name="description" content="QuickKit AI complete SEO audit for 2026 — actionable phases, AI agent keyword targeting, Google Search Ad copy, and competitor comparison to rank above ChatGPT and Zapier." />
        <meta name="keywords" content="quickkit ai seo audit 2026, ai agents for business, ai agent platform, beat chatgpt, quickkit seo strategy, ai crm seo, ai workflow ranking" />
        <link rel="canonical" href="https://quickkitai.com/seo-audit" />
        <meta property="og:title" content="QuickKit AI SEO Audit 2026 — Rank Above ChatGPT" />
        <meta property="og:description" content="Full interactive SEO audit dashboard with 3-phase action plan, AI agent SEO strategy, and perfect Google Ad copy for 2026." />
        <meta property="og:url" content="https://quickkitai.com/seo-audit" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "QuickKit AI SEO Audit 2026",
          "description": "Interactive SEO Audit Dashboard for QuickKit AI — action plans, keyword targeting, and Google Ad strategy to dominate AI agent search rankings in 2026.",
          "url": "https://quickkitai.com/seo-audit",
          "publisher": { "@type": "Organization", "name": "QuickKit AI", "url": "https://quickkitai.com" },
          "datePublished": "2026-05-18",
          "dateModified": "2026-05-18"
        })}</script>
      </Helmet>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-cyan-400 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </Link>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <span className="text-cyan-400">SEO Audit</span>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="pt-20 pb-6 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-2">QUICKKITAI.COM — UPDATED MAY 2026</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
            <span className="text-cyan-400">QuickKit AI</span>
            <span className="text-slate-600"> — </span>
            <span className="text-pink-400">SEO Audit</span>
          </h1>

          {/* Score Banner */}
          <div className="mt-4 inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 rounded-full px-4 py-1.5 text-xs font-mono font-bold">
            <AlertTriangle size={12} />
            Overall Score: 34/100 — Needs Urgent Fixes
          </div>

          {/* Top Navigation */}
          <div className="mt-6 flex flex-wrap gap-2">
            {([
              { id: 'overview',    icon: Globe,     label: 'Overview' },
              { id: 'issues',      icon: User,      label: 'Issues' },
              { id: 'perfect-ad',  icon: Megaphone, label: 'Perfect Ad' },
            ] as { id: TopTab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTopTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  topTab === id
                    ? 'bg-cyan-400 text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Sub Navigation (only when Issues is active) */}
          {showSubTabs && (
            <div className="mt-3 flex gap-2">
              {([
                { id: 'ai-agent-seo', icon: Bot,          label: 'AI Agent SEO' },
                { id: 'action-plan',  icon: CheckCircle2,  label: 'Action Plan' },
              ] as { id: SubTab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSubTab(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                    subTab === id
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700/50'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8">
        {topTab === 'overview' && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-8 text-center">
            <Globe size={40} className="text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-3">Site Overview</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Overall domain health snapshot. Use the <span className="text-cyan-400 font-semibold">Issues</span> tab to see the full action plan and <span className="text-pink-400 font-semibold">Perfect Ad</span> tab for Google Ads strategy.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'SEO Score',    value: '34/100', color: 'text-red-400' },
                { label: 'Pages',        value: '12',     color: 'text-cyan-400' },
                { label: 'Backlinks',    value: '~5',     color: 'text-orange-400' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-slate-800/50 p-4">
                  <p className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {topTab === 'issues' && subTab === 'action-plan' && <ActionPlanTab />}
        {topTab === 'issues' && subTab === 'ai-agent-seo' && <AIAgentSEOTab />}
        {topTab === 'perfect-ad' && <PerfectAdTab />}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-700">
          QuickKit AI — SEO Audit Report — Created by Prince — May 2026
        </p>
      </footer>
    </div>
  );
};
