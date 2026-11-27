import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CalendarCheck2, Check, ChevronRight, CircleCheck,
  Clock3, Crown, Database, Gauge, Globe2, LayoutDashboard, MessageCircle,
  Play, ShieldCheck, Sparkles, Star, Target, UsersRound, Wand2, X, Zap
} from 'lucide-react';
import { RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL } from '../constants';

interface PremiumLandingProps {
  onBookDemo: () => void;
}

const agents = [
  {
    no: '01',
    name: 'Speed-to-Lead Closer',
    tone: 'violet',
    icon: Zap,
    metric: 'Fast reply',
    subtitle: 'WhatsApp qualification + booking',
    bullets: ['Instant reply', 'Voice + text', 'Buyer qualification', 'Appointment booking'],
  },
  {
    no: '02',
    name: 'Lead Prospector',
    tone: 'cyan',
    icon: Target,
    metric: 'Daily research',
    subtitle: 'Prospecting + competitor intelligence',
    bullets: ['Targeted research', 'Public business data', 'Competitor monitoring', 'Daily lead reports'],
  },
  {
    no: '03',
    name: 'CRM Sentinel',
    tone: 'emerald',
    icon: CalendarCheck2,
    metric: 'Always-on',
    subtitle: 'Booking + no-show protection',
    bullets: ['Calendar lock', 'Location reminder', 'Travel link', 'Sales handoff'],
  },
  {
    no: '04',
    name: 'Dead Lead Reviver',
    tone: 'amber',
    icon: Wand2,
    metric: 'Measured uplift',
    subtitle: 'Dormant database reactivation',
    bullets: ['Old lead revival', 'Smart follow-up', 'Conversation hooks', 'Reactivation campaigns'],
  },
  {
    no: '05',
    name: 'Reputation Sentinel',
    tone: 'rose',
    icon: Star,
    metric: 'Review care',
    subtitle: 'Reviews + local visibility support',
    bullets: ['Review requests', 'Negative escalation', 'Positive routing', 'Local visibility'],
  },
] as const;

const toneMap: Record<string, { line: string; glow: string; badge: string; icon: string }> = {
  violet: { line: 'from-violet-400/80 via-fuchsia-400/30 to-transparent', glow: 'bg-violet-500/15', badge: 'text-violet-200 bg-violet-400/10 border-violet-300/15', icon: 'text-violet-200' },
  cyan: { line: 'from-cyan-300/80 via-blue-400/30 to-transparent', glow: 'bg-cyan-500/12', badge: 'text-cyan-100 bg-cyan-400/10 border-cyan-300/15', icon: 'text-cyan-100' },
  emerald: { line: 'from-emerald-300/80 via-teal-400/30 to-transparent', glow: 'bg-emerald-500/12', badge: 'text-emerald-100 bg-emerald-400/10 border-emerald-300/15', icon: 'text-emerald-100' },
  amber: { line: 'from-amber-300/80 via-orange-400/30 to-transparent', glow: 'bg-amber-500/12', badge: 'text-amber-100 bg-amber-400/10 border-amber-300/15', icon: 'text-amber-100' },
  rose: { line: 'from-rose-300/80 via-pink-400/30 to-transparent', glow: 'bg-rose-500/12', badge: 'text-rose-100 bg-rose-400/10 border-rose-300/15', icon: 'text-rose-100' },
};

const workflow = [
  ['01', 'CAPTURE', 'Ads + enquiry', MessageCircle],
  ['02', 'QUALIFY', 'AI conversation', Gauge],
  ['03', 'ENGAGE', 'Follow-up', Zap],
  ['04', 'BOOK', 'Site visit / consult', CalendarCheck2],
  ['05', 'SYNC', 'CRM + human handoff', Database],
] as const;

export const PremiumLanding: React.FC<PremiumLandingProps> = ({ onBookDemo }) => {
  const [showAdDemo, setShowAdDemo] = useState(false);
  const [pricingTab, setPricingTab] = useState<'aeo' | 'workforce'>('aeo');

  const openWhatsApp = (customMsg?: string) => {
    const text = customMsg || 'Hi QuickKitAI × Raja AI Systems, I want to discuss your AI services.';
    const message = encodeURIComponent(text);
    window.open(`${WHATSAPP_DIRECT_URL}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="relative overflow-hidden bg-[#050608] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80">
        <div className="absolute left-[-20%] top-[-10%] h-[55rem] w-[55rem] rounded-full bg-violet-600/[0.09] blur-[9rem]" />
        <div className="absolute right-[-15%] top-[12%] h-[45rem] w-[45rem] rounded-full bg-cyan-500/[0.07] blur-[9rem]" />
        <div className="absolute bottom-[-20%] left-[25%] h-[40rem] w-[40rem] rounded-full bg-amber-400/[0.045] blur-[9rem]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />

      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050608]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="#hero" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-300/20 bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-[#0b0d11] shadow-[0_8px_30px_rgba(245,158,11,.16)]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[13px] font-black tracking-[0.10em] text-white">QUICKKITAI <span className="text-amber-300">×</span></div>
              <div className="text-[9px] font-bold tracking-[0.16em] text-amber-200/90">RAJA AI SYSTEMS</div>
              <div className="mt-0.5 text-[9px] tracking-[0.08em] text-slate-500">quickkitai.com</div>
            </div>
          </a>
          <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:flex">
            <a href="#agents" className="transition hover:text-white">AI Team</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#visual-offer-spotlight" className="transition hover:text-white">AEO &amp; GEO Engine</a>
            <a href="#offer" className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition hover:border-amber-300 hover:bg-amber-400/20 hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pilot Offer
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openWhatsApp()} className="hidden items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-400/[0.13] sm:inline-flex">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
            <button onClick={onBookDemo} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[0_10px_40px_rgba(255,255,255,.10)] transition hover:-translate-y-0.5 hover:bg-amber-200">
              Book Demo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative z-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-200/[0.08] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Globe2 className="h-3.5 w-3.5 text-amber-300" /> Primary: AEO, SEO &amp; GEO Engine
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/[0.08] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                <UsersRound className="h-3.5 w-3.5 text-cyan-300" /> 5-Agent Managed Workforce
              </span>
            </div>
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.20em] text-slate-400">QUICKKITAI.COM <span className="text-amber-300">×</span> RAJA AI SYSTEMS · INDIA</p>
            <h1 className="max-w-4xl text-[3.15rem] font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.15rem]">
              Get Suggested by ChatGPT, Perplexity &amp; Google.
              <span className="block bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">Backed by an Autonomous AI Workforce.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Engineered so all major LLMs and search engines accurately discover, cite, and recommend your business. Pair precision AEO &amp; GEO visibility with five specialized AI teammates handling speed-to-lead, qualification, and WhatsApp conversion 24/7.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={onBookDemo} className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#111] shadow-[0_18px_50px_rgba(245,158,11,.18)] transition hover:-translate-y-1">
                Book Strategy Call <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <a href="#visual-offer-spotlight" className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-400/40 bg-amber-400/[0.08] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-amber-200 backdrop-blur transition hover:border-amber-300 hover:bg-amber-400/15 hover:text-white shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <Sparkles className="h-4 w-4 text-amber-300" /> View Pilot Offer
              </a>
            </div>

            <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['≤12s', 'speed-to-lead', Clock3],
                ['5', 'AI teammates', UsersRound],
                ['30d', 'SLA window', ShieldCheck],
                ['24/7', 'managed ops', Gauge],
              ].map(([value,label,Icon]) => (
                <div key={String(label)} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                  {React.createElement(Icon as React.ElementType, { className: 'mb-3 h-4 w-4 text-amber-200' })}
                  <div className="text-xl font-black">{String(value)}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{String(label)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-violet-500/10 via-cyan-400/5 to-amber-300/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-[0_40px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-200">CONTROL ROOM</div>
                  <div className="mt-1 text-lg font-black">AI Workforce Online</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ['INBOUND', '32', 'new conversations'],
                  ['QUALIFIED', '18', 'high-intent leads'],
                  ['BOOKED', '7', 'next actions'],
                  ['FOLLOW-UP', '14', 'in active nurture'],
                ].map(([k,v,s],i) => (
                  <div key={k} className="rounded-2xl border border-white/[0.07] bg-[#080a0f]/80 p-4">
                    <div className="text-[9px] font-bold tracking-[0.18em] text-slate-600">{k}</div>
                    <div className="mt-2 text-3xl font-black">{v}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{s}</div>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]"><div className={`h-full rounded-full ${i===0?'w-[76%]':i===1?'w-[58%]':i===2?'w-[42%]':'w-[67%]'} bg-gradient-to-r from-amber-200 to-cyan-300`} /></div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Live activity</span>
                  <span className="text-[9px] font-mono text-slate-600">auto-verified</span>
                </div>
                {[
                  ['12:04', 'Lead Closer', 'qualified buyer', 'emerald'],
                  ['12:07', 'CRM Sentinel', 'site visit locked', 'cyan'],
                  ['12:11', 'Dead Lead Reviver', 'old lead replied', 'amber'],
                ].map(([time,agent,event,tone]) => (
                  <div key={time} className="flex items-center gap-3 border-t border-white/[0.05] py-3 first:border-0">
                    <div className="text-[9px] font-mono text-slate-600">{time}</div>
                    <div className={`h-2 w-2 rounded-full ${tone==='emerald'?'bg-emerald-300':tone==='cyan'?'bg-cyan-300':'bg-amber-300'}`} />
                    <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-bold text-slate-200">{agent}</div><div className="truncate text-[10px] text-slate-500">{event}</div></div>
                    <CircleCheck className="h-4 w-4 text-emerald-300" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">AEO Engine</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300">ChatGPT · Perplexity · Gemini · Claude Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Visual Offer Showcase for Desktop & Large Screens */}
      <section id="visual-offer-spotlight" className="relative z-20 mx-auto max-w-7xl px-5 -mt-6 mb-16 md:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-amber-400/30 bg-gradient-to-br from-[#0c0f17] via-[#08090d] to-[#040507] p-6 shadow-[0_30px_90px_rgba(245,158,11,0.15)] backdrop-blur-2xl md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sparkles className="h-3 w-3 text-amber-300" /> Visual Offer Spotlight · Desktop &amp; Large Screen
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Complete Project Architecture: AI Visibility + Autonomous Workforce
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.08] px-4 py-2.5 text-xs font-bold text-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Zero Upfront Risk: Pay After Live Result (Valid through Nov 30)</span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Left Card: AEO Engine (Main Priority) */}
            <div className="relative rounded-[2rem] border-2 border-amber-400/40 bg-gradient-to-b from-amber-400/[0.08] via-[#0a0d14] to-[#07090e] p-6 md:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(245,158,11,0.1)]">
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  Main Priority
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Globe2 className="h-4 w-4" /> Pillar 01 · AEO, SEO &amp; GEO Engine
                </div>
                <h3 className="mt-3 text-xl md:text-2xl font-black text-white">Get Recommended by All LLMs &amp; Google</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Engineered so ChatGPT, Perplexity, Claude &amp; Google AI Overviews cite and recommend your business with 100% precision. Enterprise JSON-LD Schema (<code className="text-amber-200">@graph</code>), <code className="text-amber-200">llms.txt</code> ingestion protocols, and verified Google Rich Results pass.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-black/50 p-4">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Tier 01 · One-Time Fix</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-600 line-through">₹30,000</span>
                      <span className="text-2xl font-black text-white">₹15,000</span>
                    </div>
                    <div className="text-[10px] text-emerald-300 font-bold">Zero monthly commitment</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-amber-300">Tier 02 · AI Sentinel</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-600 line-through">₹50,000</span>
                      <span className="text-2xl font-black text-amber-300">₹25,000</span>
                      <span className="text-[10px] text-slate-500">/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400">₹20,000 setup · Daily logs</div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    '100% Google Rich Results Green Pass Guaranteed',
                    'Autonomous LLM Ingestion (llms.txt, llms-full.txt)',
                    'Core Web Vitals & Latency Compression (<1.5s load speed)',
                    'Multi-Engine Citation Tracking (ChatGPT, Perplexity, Gemini, Claude)',
                  ].map(feat => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openWhatsApp('Hi QuickKitAI, I want to claim the AEO & GEO Engine offer (₹15,000 one-time fix / ₹25,000 retainer).')}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-center text-xs font-black uppercase tracking-wider text-black shadow-[0_8px_25px_rgba(245,158,11,0.25)] hover:opacity-95"
                >
                  Claim AEO Engine →
                </button>
                <a
                  href="#offer"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white"
                >
                  Full Specs
                </a>
              </div>
            </div>

            {/* Right Card: Autonomous AI Workforce */}
            <div className="relative rounded-[2rem] border border-cyan-400/30 bg-gradient-to-b from-cyan-400/[0.06] via-[#0a0d14] to-[#07090e] p-6 md:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(6,182,212,0.1)]">
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-200">
                  Pilot Slots: {RAJA_COMMERCIAL_OFFER.pilotClientSlots} Left
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
                  <UsersRound className="h-4 w-4" /> Pillar 02 · Autonomous AI Workforce
                </div>
                <h3 className="mt-3 text-xl md:text-2xl font-black text-white">Five Specialists. Zero Agency Chaos.</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Full 24/7 AI workforce handling inbound enquiry speed-to-lead, WhatsApp voice note + text qualification, site-visit calendar locking, dead lead reactivation, and reputation guard with complete CRM sync.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-black/50 p-4">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Regular Agency Rate</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-600 line-through">₹2,40,000</span>
                      <span className="text-[10px] text-slate-600">/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-600">₹70,000 setup</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-300">50% Pilot Offer</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">₹1,20,000</span>
                      <span className="text-[10px] text-slate-400">/mo</span>
                    </div>
                    <div className="text-[10px] text-cyan-300 font-bold">₹35,000 setup · 30-day SLA</div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    '5 Coordinated AI Specialists on Autopilot',
                    'WhatsApp Voice Note + Text Conversation Handling',
                    'Instant Speed-to-Lead Response Target',
                    'Full CRM State Sync & Calendar Appointment Locking',
                  ].map(feat => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBookDemo}
                  className="flex-1 rounded-xl bg-white py-3 text-center text-xs font-black uppercase tracking-wider text-black shadow-[0_8px_25px_rgba(255,255,255,0.15)] hover:bg-slate-200"
                >
                  Book Demo Call →
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp('Hi QuickKitAI, I want to discuss deploying the 5-Agent Workforce for my business.')}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08] px-4 py-3 text-xs font-bold text-emerald-200 hover:bg-emerald-400/[0.15]"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agents" className="relative z-10 border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">The workforce</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] md:text-6xl">Five specialists. One system.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500">Each agent owns a distinct job, but the handoffs are designed as one connected customer journey.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            {agents.map((agent) => {
              const styles = toneMap[agent.tone];
              const Icon = agent.icon;
              return (
                <article key={agent.no} className="group relative overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#0a0c12]/90 p-5 transition duration-500 hover:-translate-y-1.5 hover:border-white/[0.16] hover:bg-[#0d1017]">
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${styles.line}`} />
                  <div className={`absolute -right-14 -top-14 h-32 w-32 rounded-full blur-3xl ${styles.glow}`} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-black tracking-[0.2em] text-slate-600">{agent.no}</span>
                      <div className={`grid h-9 w-9 place-items-center rounded-xl border ${styles.badge}`}><Icon className={`h-4 w-4 ${styles.icon}`} /></div>
                    </div>
                    <div className="mt-7">
                      <div className="text-xl font-black leading-tight">{agent.name}</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{agent.subtitle}</p>
                    </div>
                    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">Primary metric</div>
                      <div className="mt-1 text-lg font-black text-white">{agent.metric}</div>
                    </div>
                    <div className="mt-5 space-y-2">
                      {agent.bullets.map((b) => <div key={b} className="flex items-center gap-2 text-[11px] text-slate-400"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> {b}</div>)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">How it works</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-6xl">Lead in. Revenue workflow out.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-500 md:text-base">The experience is designed around the actual workflow — not around a generic chatbot screen.</p>
          </div>

          <div className="mt-12 grid gap-3 lg:grid-cols-5">
            {workflow.map(([n,title,subtitle,Icon], i) => (
              <div key={n} className="relative">
                {i < workflow.length - 1 && <div className="absolute right-[-8px] top-11 z-20 hidden h-px w-4 bg-gradient-to-r from-cyan-300/50 to-transparent lg:block" />}
                <div className="h-full rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black tracking-widest text-slate-600">{n}</span>
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/[0.08] text-cyan-200"><Icon className="h-4 w-4" /></div>
                  </div>
                  <div className="mt-5 text-lg font-black">{title}</div>
                  <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [ShieldCheck, 'Guardrails first', 'Approved actions, escalation paths and provider dependencies stay explicit.'],
              [LayoutDashboard, 'One control layer', 'See the workflow as a managed system, not a pile of disconnected tools.'],
              [CircleCheck, 'Verify before live', 'A workflow is only called live after the configured path actually passes its checks.'],
            ].map(([Icon,title,body]) => (
              <div key={String(title)} className="rounded-[1.5rem] border border-white/[0.07] bg-black/20 p-6">
                {React.createElement(Icon as React.ElementType, { className: 'h-5 w-5 text-amber-200' })}
                <div className="mt-4 font-black">{String(title)}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{String(body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ad-demo" className="relative z-10 border-y border-white/[0.06] bg-gradient-to-b from-white/[0.015] to-transparent">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">60-second sales ad</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-6xl">The ad should feel like the product.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">Pain → 5-agent proof → performance story → pilot offer → WhatsApp action. Same promise, same design language, same CTA.</p>
              <button onClick={() => setShowAdDemo(true)} className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-200/[0.06] px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-200/[0.10]">
                <Play className="h-4 w-4" /> Preview Ad Story
              </button>
            </div>
            <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a0c12] p-5 shadow-[0_30px_90px_rgba(0,0,0,.35)]">
              {[
                ['00–05s','HOOK','Stop burning ad spend.'],
                ['05–18s','AGITATE','Leads arrive while the sales desk sleeps.'],
                ['18–38s','PROOF','Show the five-agent workforce in action.'],
                ['38–48s','SLA','Show the written performance conditions.'],
                ['48–60s','CTA','Current pilot offer → direct WhatsApp.'],
              ].map(([time,kicker,text],i) => (
                <div key={time} className="flex gap-4 border-b border-white/[0.06] py-4 last:border-0 last:pb-1">
                  <div className="w-14 shrink-0 font-mono text-[9px] font-black text-slate-600">{time}</div>
                  <div><div className={`text-[9px] font-black tracking-[0.18em] ${i===4?'text-amber-200':'text-cyan-200'}`}>{kicker}</div><div className="mt-1 text-sm font-bold text-slate-200">{text}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="offer" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-black/40 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> Commercial Service Plans
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl text-white">
              Transparent Engineering. Zero Glitches.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Select between our dedicated AEO, SEO & GEO Search Visibility Engine or our full Autonomous AI Workforce.
            </p>

            {/* Trust Guarantee Banner: Pay After Live Verification */}
            <div className="mt-6 mx-auto max-w-2xl rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-3.5 backdrop-blur-md flex items-center justify-center gap-3 text-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-black text-emerald-300 uppercase tracking-wider">Zero Upfront Risk: Pay After Live Result</span>
                <span className="mx-2 text-slate-600">·</span>
                <span>We verify 100% Google Rich Results & AI crawler pass before payment release. Valid through November 30.</span>
              </div>
            </div>

            {/* Plan Category Switcher */}
            <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setPricingTab('aeo')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  pricingTab === 'aeo'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_4px_25px_rgba(245,158,11,.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe2 className="h-4 w-4" /> AEO, SEO & GEO Engine
              </button>
              <button
                type="button"
                onClick={() => setPricingTab('workforce')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  pricingTab === 'workforce'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_25px_rgba(59,130,246,.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UsersRound className="h-4 w-4" /> Autonomous AI Workforce
              </button>
            </div>
          </div>

          {pricingTab === 'aeo' ? (
            /* TAB 1: AEO, SEO & GEO Engine (2 Variants) */
            <div className="grid gap-8 lg:grid-cols-2 items-stretch max-w-6xl mx-auto">
              {/* Variant 1: AI Technical Foundation Fix */}
              <div className="rounded-[2.25rem] border border-white/[0.09] bg-[#090b10]/95 p-7 md:p-10 flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,.4)] hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-500">Tier 01</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">One-Time Setup</span>
                  </div>
                  <h3 className="mt-5 text-2xl md:text-3xl font-black text-white">AI Technical Foundation & Schema Fix</h3>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    Complete code architecture overhaul to make your website readable, verified, and eligible for Google Rich Snippets and AI Search discovery without recurring fees.
                  </p>

                  <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/40 p-5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">One-Time Investment</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm text-slate-600 line-through">₹30,000</span>
                      <span className="text-4xl font-black text-white">₹15,000</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-300 font-bold">₹0 advance · Pay After Live Verified Result · Zero monthly maintenance</div>
                  </div>

                  <div className="mt-7 space-y-3">
                    {[
                      'Enterprise JSON-LD Schema Architecture (Organization, LocalBusiness, FAQ)',
                      'Autonomous AI Crawler Ingestion Protocols (llms.txt, llms-full.txt, robots.txt)',
                      'Core Web Vitals & Asset Latency Compression (Target <1.5s load speed)',
                      'Google Rich Results Official Validation Certificate (100% Green Pass)',
                      'Google Search Console & Canonical Sitemap Indexing Submission',
                      'Clean Handover & Deployment Verification',
                    ].map(f => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed text-slate-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => openWhatsApp('Hi QuickKitAI, I want to book the AI Technical Foundation & Schema Fix (₹15,000 one-time).')}
                    className="w-full rounded-xl bg-white py-3.5 text-xs font-black uppercase tracking-widest text-black transition hover:bg-amber-100 flex items-center justify-center gap-2"
                  >
                    Claim Technical Fix <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-center text-[10px] text-slate-600">7 Business Days Delivery · ₹0 Advance · Live Verified</p>
                </div>
              </div>

              {/* Variant 2: AI Search Growth & Autonomous Sentinel */}
              <div className="rounded-[2.25rem] border border-amber-300/40 bg-gradient-to-b from-amber-400/[0.07] via-[#090b10] to-[#090b10] p-7 md:p-10 flex flex-col justify-between shadow-[0_25px_80px_rgba(245,158,11,.1)] relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_20px_rgba(245,158,11,.2)]">
                    Most Popular
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-amber-300">Tier 02 · Retainer</span>
                  </div>
                  <h3 className="mt-5 text-2xl md:text-3xl font-black text-white">AI Search Growth & Autonomous Sentinel</h3>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    Continuous AI citation visibility and health defense across ChatGPT, Perplexity, Gemini, and Claude with automated daily audit logs and bi-weekly reports.
                  </p>

                  <div className="mt-6 rounded-2xl border border-amber-300/20 bg-black/50 p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Implementation Setup</div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-600 line-through">₹40,000</span>
                          <span className="text-2xl font-black text-white">₹20,000</span>
                        </div>
                        <div className="text-[10px] text-slate-500">paid upfront</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Monthly Management</div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-600 line-through">₹50,000</span>
                          <span className="text-2xl font-black text-emerald-300">₹25,000</span>
                        </div>
                        <div className="text-[10px] text-slate-500">per month (Day 30+)</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3">
                    {[
                      'Everything included in AI Technical Foundation Fix',
                      'Automated Daily Health & AI Indexing Sentinel (30-day rolling log)',
                      'Multi-Engine Citation Tracking (ChatGPT, Perplexity, Gemini, Claude)',
                      'Continuous Entity Schema Expansions (New inventory, services & FAQs)',
                      'Bi-Weekly Executive Proof & Verification Audit Reports',
                      'Ongoing Core Web Vitals, Bot Access & Security Guard',
                    ].map(f => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed text-slate-200">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => openWhatsApp('Hi QuickKitAI, I want to start the AI Search Growth & Autonomous Sentinel Retainer (₹20K setup + ₹25K/mo).')}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition hover:opacity-95 shadow-[0_10px_30px_rgba(245,158,11,.2)] flex items-center justify-center gap-2"
                  >
                    Start AI Growth Plan <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-center text-[10px] text-slate-600">30-Day Rolling AI Search Growth &amp; Sentinel · Daily Logs</p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Autonomous AI Workforce (WhatsApp + CRM) */
            <div className="overflow-hidden rounded-[2.25rem] border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.09] via-white/[0.03] to-rose-400/[0.06] p-6 md:p-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-black/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200">
                    <Sparkles className="h-3.5 w-3.5" /> Pilot offer · up to {RAJA_COMMERCIAL_OFFER.pilotClientSlots} clients
                  </div>
                  <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] md:text-6xl text-white">
                    Premium execution without the messy agency layer.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                    One managed workforce covering five core jobs. Scope, traffic conditions, integrations and any measurable performance targets are agreed in writing before production; example metrics are not a promise of outcomes.
                  </p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {['5 specialized AI agents','WhatsApp-first customer journey','Managed deployment + operations','Verification before live'].map(item => (
                      <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs font-bold text-slate-300">
                        <Check className="h-4 w-4 text-emerald-300" />{item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/[0.09] bg-[#090b10]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Pilot pricing</span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-200">50% PILOT DISCOUNT</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Regular</div>
                      <div className="mt-3 text-2xl font-black line-through decoration-white/25">₹70,000</div>
                      <div className="mt-1 text-[10px] text-slate-500">setup</div>
                      <div className="mt-4 text-lg font-black">₹2,40,000</div>
                      <div className="text-[10px] text-slate-500">per month</div>
                    </div>
                    <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-200/10 to-rose-300/10 p-4">
                      <div className="text-[9px] font-black uppercase tracking-widest text-amber-200">Pilot</div>
                      <div className="mt-3 text-2xl font-black text-white">₹35,000</div>
                      <div className="mt-1 text-[10px] text-slate-400">setup</div>
                      <div className="mt-4 text-lg font-black text-amber-100">₹1,20,000</div>
                      <div className="text-[10px] text-slate-400">per month</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.05] p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-100">
                      <ShieldCheck className="h-4 w-4" /> Performance SLA
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Real estate: {RAJA_COMMERCIAL_OFFER.realEstateSlaVisits} qualified physical site visits in {RAJA_COMMERCIAL_OFFER.slaDays} days. Healthcare: {RAJA_COMMERCIAL_OFFER.healthcareSlaConsultations} qualified consultations in {RAJA_COMMERCIAL_OFFER.slaDays} days. The targets are binding only when explicitly included in the signed SLA; availability and eligibility are confirmed in writing.
                    </div>
                  </div>
                  <button onClick={onBookDemo} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest text-black transition hover:bg-amber-100">
                    Claim the Pilot <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => openWhatsApp()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/[0.06]">
                    <MessageCircle className="h-4 w-4 text-emerald-300" /> Chat on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['REAL ESTATE','Lead capture → site visit','10 qualified visits*'],
              ['HEALTHCARE','Lead capture → consultation','15 qualified consults*'],
              ['TRUST LAYER','Verification first','No fake “live” claims'],
              ['NEXT STEP','Founder-led demo','Scope before production'],
            ].map(([a,b,c]) => <div key={a} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"><div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">{a}</div><div className="mt-2 font-black">{b}</div><div className="mt-1 text-xs text-slate-500">{c}</div></div>)}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07] bg-black/20">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-200 text-black"><Crown className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-black tracking-[0.10em]">QUICKKITAI <span className="text-amber-300">|</span> RAJA AI SYSTEMS</div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">quickkitai.com · Last updated: 27 November 2026 · By Prince (Raja)</div>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500">Managed AEO, GEO &amp; AI systems for high-response businesses in India. Public claims, integrations, SLAs and dependencies remain subject to the signed scope and live verification.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={onBookDemo} className="rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-amber-100">Book Demo</button>
              <button onClick={() => openWhatsApp()} className="rounded-xl border border-emerald-300/15 bg-emerald-400/[0.05] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-100">WhatsApp</button>
              <Link to="/terms" className="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Terms</Link>
              <Link to="/privacy" className="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Privacy</Link>
            </div>
          </div>

          <nav aria-label="Site directory" className="mt-10 grid gap-6 border-t border-white/[0.06] pt-8 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Core &amp; AEO Plans</p>
              <ul className="mt-3 space-y-2">
                <li><Link to="/" className="hover:text-white">Home Overview</Link></li>
                <li><Link to="/ai-visibility" className="hover:text-white">AI Visibility &amp; AEO Plans</Link></li>
                <li><Link to="/proof-of-value" className="hover:text-white">Proof of Value &amp; Audit Data</Link></li>
                <li><Link to="/seo-audit" className="hover:text-white">SEO &amp; AI Search Audit</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Industry Solutions</p>
              <ul className="mt-3 space-y-2">
                <li><Link to="/services/real-estate" className="hover:text-white">Real Estate AI Workforce</Link></li>
                <li><Link to="/services/healthcare" className="hover:text-white">Healthcare Clinic Workflows</Link></li>
                <li><Link to="/live-demo" className="hover:text-white">Live Controlled Workflow Demo</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Guides &amp; Knowledge</p>
              <ul className="mt-3 space-y-2">
                <li><Link to="/guides/real-estate-ai-lead-qualification" className="hover:text-white">Real Estate Qualification Guide</Link></li>
                <li><Link to="/real-estate-ai-questions" className="hover:text-white">Real Estate AI Q&amp;A</Link></li>
                <li><Link to="/blog" className="hover:text-white">Knowledge Hub &amp; Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Company &amp; Legal</p>
              <ul className="mt-3 space-y-2">
                <li><Link to="/about" className="hover:text-white">About Prince (Raja) &amp; Team</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact &amp; Pilot Consultation</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </nav>
        </div>
      </footer>

      {showAdDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="60 second ad demo">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#090b10] shadow-[0_40px_120px_rgba(0,0,0,.65)]">
            <button onClick={() => setShowAdDemo(false)} aria-label="Close ad demo" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            <div className="border-b border-white/[0.07] p-6 md:p-8"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200">60-SECOND AD BLUEPRINT</div><h3 className="mt-2 text-2xl font-black md:text-3xl">Show the system. Then sell the demo.</h3></div>
            <div className="grid gap-3 p-6 md:p-8">
              {[
                ['00–05','HOOK','STOP BURNING ADS!'],
                ['05–18','AGITATION','The lead is shopping while your team sleeps.'],
                ['18–38','PROOF','Show the 5 agents moving the lead forward.'],
                ['38–48','SLA','Show the written performance story and conditions.'],
                ['48–60','CTA','Pilot scope → WhatsApp → free demo.'],
              ].map(([time,kicker,line],i) => <div key={time} className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"><div className="w-14 shrink-0 font-mono text-[10px] font-black text-slate-600">{time}</div><div><div className={`text-[9px] font-black tracking-[0.18em] ${i===4?'text-amber-200':'text-cyan-200'}`}>{kicker}</div><div className="mt-1 text-sm font-bold text-slate-200">{line}</div></div></div>)}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/[0.07] p-6 sm:flex-row">
              <button onClick={() => { setShowAdDemo(false); onBookDemo(); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest text-black">Book Free Demo <ChevronRight className="h-4 w-4" /></button>
              <button onClick={openWhatsApp} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.05] px-5 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-100"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
