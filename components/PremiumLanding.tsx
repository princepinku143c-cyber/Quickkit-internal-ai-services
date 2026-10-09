import React, { useState } from 'react';
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
    metric: '≤ 12 sec',
    subtitle: 'WhatsApp qualification + booking',
    bullets: ['Instant reply', 'Voice + text', 'Buyer qualification', 'Appointment booking'],
  },
  {
    no: '02',
    name: 'Lead Prospector',
    tone: 'cyan',
    icon: Target,
    metric: '50 / day',
    subtitle: 'Prospecting + competitor intelligence',
    bullets: ['Targeted research', 'Public business data', 'Competitor monitoring', 'Daily lead reports'],
  },
  {
    no: '03',
    name: 'CRM Sentinel',
    tone: 'emerald',
    icon: CalendarCheck2,
    metric: '24 / 7',
    subtitle: 'Booking + no-show protection',
    bullets: ['Calendar lock', 'Location reminder', 'Travel link', 'Sales handoff'],
  },
  {
    no: '04',
    name: 'Dead Lead Reviver',
    tone: 'amber',
    icon: Wand2,
    metric: '8–15%',
    subtitle: 'Dormant database reactivation',
    bullets: ['Old lead revival', 'Smart follow-up', 'Conversation hooks', 'Reactivation campaigns'],
  },
  {
    no: '05',
    name: 'Reputation Sentinel',
    tone: 'rose',
    icon: Star,
    metric: '5★',
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

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hi QuickKitAI × Raja AI Systems, I want to see the 5-Agent AI Workforce demo and the pilot offer.');
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
            <a href="#ad-demo" className="transition hover:text-white">Ad Demo</a>
            <a href="#offer" className="transition hover:text-white">Offer</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openWhatsApp} className="hidden items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-400/[0.13] sm:inline-flex">
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> 5-agent managed AI workforce
            </div>
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.20em] text-slate-400">QUICKKITAI.COM <span className="text-amber-300">×</span> RAJA AI SYSTEMS · INDIA</p>
            <h1 className="max-w-4xl text-[3.35rem] font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.35rem]">
              Your business,
              <span className="block bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">with an AI team behind it.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Five specialized AI teammates working around the clock across speed-to-lead, qualification, follow-up, appointments, dormant leads and reputation workflows.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={onBookDemo} className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#111] shadow-[0_18px_50px_rgba(245,158,11,.18)] transition hover:-translate-y-1">
                Book Free Demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button onClick={() => setShowAdDemo(true)} className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08]">
                <Play className="h-4 w-4 text-amber-300" /> Watch 60-sec Demo
              </button>
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
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-300/10 bg-amber-300/[0.045] px-4 py-3">
                <span className="text-[10px] font-bold text-amber-100">5 agents → 1 revenue workflow</span>
                <BarChart3 className="h-4 w-4 text-amber-200" />
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
                ['48–60s','CTA','Dussehra offer → direct WhatsApp.'],
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
          <div className="overflow-hidden rounded-[2.25rem] border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.09] via-white/[0.03] to-rose-400/[0.06] p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-black/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200"><Sparkles className="h-3.5 w-3.5" /> Dussehra pilot · up to {RAJA_COMMERCIAL_OFFER.pilotClientSlots} clients</div>
                <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] md:text-6xl">Premium execution without the messy agency layer.</h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">One managed workforce covering the five core jobs, with the deployment scope, traffic conditions, integrations and written SLA defined before production.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {['5 specialized AI agents','WhatsApp-first customer journey','Managed deployment + operations','Verification before live'].map(item => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs font-bold text-slate-300"><Check className="h-4 w-4 text-emerald-300" />{item}</div>)}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/[0.09] bg-[#090b10]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
                <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Pilot pricing</span><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-200">50% OFF</span></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"><div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Regular</div><div className="mt-3 text-2xl font-black line-through decoration-white/25">₹70,000</div><div className="mt-1 text-[10px] text-slate-500">setup</div><div className="mt-4 text-lg font-black">₹2,40,000</div><div className="text-[10px] text-slate-500">per month</div></div>
                  <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-200/10 to-rose-300/10 p-4"><div className="text-[9px] font-black uppercase tracking-widest text-amber-200">Pilot</div><div className="mt-3 text-2xl font-black text-white">₹35,000</div><div className="mt-1 text-[10px] text-slate-400">setup</div><div className="mt-4 text-lg font-black text-amber-100">₹1,20,000</div><div className="text-[10px] text-slate-400">per month</div></div>
                </div>
                <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.05] p-4"><div className="flex items-center gap-2 text-xs font-black text-emerald-100"><ShieldCheck className="h-4 w-4" /> Performance SLA</div><div className="mt-2 text-sm text-slate-400">Real estate: {RAJA_COMMERCIAL_OFFER.realEstateSlaVisits} qualified physical site visits in {RAJA_COMMERCIAL_OFFER.slaDays} days. Healthcare: {RAJA_COMMERCIAL_OFFER.healthcareSlaConsultations} qualified consultations in {RAJA_COMMERCIAL_OFFER.slaDays} days. Written conditions apply.</div></div>
                <button onClick={onBookDemo} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest text-black transition hover:bg-amber-100">Claim the Pilot <ArrowRight className="h-4 w-4" /></button>
                <button onClick={openWhatsApp} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/[0.06]"><MessageCircle className="h-4 w-4 text-emerald-300" /> Chat on WhatsApp</button>
              </div>
            </div>
          </div>
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
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-12 md:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-200 text-black"><Crown className="h-4 w-4" /></div><div><div className="text-sm font-black tracking-[0.10em]">QUICKKITAI <span className="text-amber-300">×</span> RAJA AI SYSTEMS</div><div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">quickkitai.com · Managed AI workforce</div></div></div>
            <p className="mt-4 max-w-xl text-xs leading-6 text-slate-600">Managed AI systems for high-response businesses. Public claims, integrations, SLAs and dependencies remain subject to the signed scope and actual verification.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onBookDemo} className="rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-amber-100">Book Demo</button>
            <button onClick={openWhatsApp} className="rounded-xl border border-emerald-300/15 bg-emerald-400/[0.05] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-100">WhatsApp</button>
            <a href="/terms" className="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Terms</a>
            <a href="/privacy" className="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Privacy</a>
          </div>
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
                ['48–60','CTA','Dussehra pilot → WhatsApp → free demo.'],
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
