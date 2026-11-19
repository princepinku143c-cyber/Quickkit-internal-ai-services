import React, { useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Clock3, Database, Globe2, MessageCircle, ShieldCheck, Sparkles, Star, UsersRound, Workflow, Zap } from 'lucide-react';
import { RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL } from '../constants';

interface PricingProps { lang?: string; onSelectPlan: (plan: string) => void; }

const WORKFORCE_FEATURES = [
  '5-member autonomous AI workforce',
  'WhatsApp voice-note + text speed-to-lead workflow',
  'Prospecting + competitor intelligence workflow',
  'CRM sentinel + no-show guard',
  'Dormant lead reactivation workflow',
  'Reputation + local/AI-search support workflow',
  'Managed VPS deployment, monitoring and maintenance',
  'Performance SLA: 10 qualified site visits / 15 qualified consultations in 30 days*',
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [pricingTab, setPricingTab] = useState<'aeo' | 'workforce'>('aeo');

  const openWhatsApp = (customMsg?: string) => {
    const text = customMsg || 'Hi QuickKitAI × Raja AI Systems, I want to discuss your AI services.';
    const message = encodeURIComponent(text);
    window.open(`${WHATSAPP_DIRECT_URL}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="offer" className="py-28 md:py-32 bg-[#030712] border-t border-white/6 relative overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 -top-60 w-[1000px] h-[560px] rounded-full bg-amber-500/6 blur-[160px] pointer-events-none"/>
      <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-amber-300">
            <Sparkles className="w-3 h-3"/> Commercial Service Plans
          </div>
          <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.05em]">Transparent Plans. Guaranteed Engineering.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">Select between our dedicated AEO, SEO & GEO Search Visibility Engine or our full Autonomous AI Workforce.</p>

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
                  <div className="mt-1 text-[11px] text-emerald-300 font-bold">50% introductory rate · Zero monthly commitment</div>
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
                <p className="mt-2 text-center text-[10px] text-slate-600">7-Day Deployment Target · Staged & Verified</p>
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
                <p className="mt-2 text-center text-[10px] text-slate-600">Daily Automated Monitoring · Fortnightly Reports</p>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: Autonomous AI Workforce (WhatsApp + CRM) */
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-stretch">
            <div className="rounded-[2.2rem] border border-amber-400/25 bg-gradient-to-b from-amber-500/[.07] via-slate-950/95 to-slate-950 p-7 md:p-10 shadow-[0_30px_120px_rgba(245,158,11,.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-amber-300">
                  <Star className="w-3 h-3 fill-amber-300"/> 3 pilot-client slots
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">50% pilot discount*</span>
              </div>

              <h3 className="mt-7 text-3xl md:text-4xl font-black text-white">5-Member Autonomous AI Workforce</h3>
              <p className="mt-3 text-slate-400 leading-relaxed">Built for high-ticket real estate developers/brokers and high-ticket aesthetic healthcare/dental clinics.</p>

              <div className="mt-8 rounded-[1.7rem] border border-white/8 bg-black/25 p-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Implementation</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularSetupINR.toLocaleString('en-IN')}</span>
                      <span className="text-5xl font-black text-white">₹{RAJA_COMMERCIAL_OFFER.festiveSetupINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">48-hour deployment target · paid upfront</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Monthly management</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularMonthlyINR.toLocaleString('en-IN')}</span>
                      <span className="text-4xl font-black text-emerald-300">₹{RAJA_COMMERCIAL_OFFER.festiveMonthlyINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Starts on Day 30 · subject to signed agreement*</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-emerald-300">Save ₹35,000 setup</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-emerald-300">Save ₹1,20,000/mo</span>
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-blue-300">50% off</span>
                </div>
              </div>

              <div className="mt-7 grid md:grid-cols-2 gap-x-5 gap-y-3">
                {WORKFORCE_FEATURES.map(f=><div key={f} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0"/><span className="text-sm leading-relaxed text-slate-300">{f}</span></div>)}
              </div>

              <button onClick={()=>onSelectPlan('RAJA_DUSSEHRA')} className="mt-8 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[.16em] text-slate-950 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">Claim Pilot Slot <ArrowRight className="w-4 h-4"/></button>
              <p className="mt-4 text-[10px] leading-relaxed text-slate-600">*The performance SLA and ongoing pricing terms are subject to the signed agreement, qualifying traffic/access conditions, proof rules and other commercial terms.</p>
            </div>

            <div className="rounded-[2.2rem] border border-slate-800 bg-slate-950/75 p-7 md:p-10 flex flex-col">
              <div className="text-[10px] font-mono font-black uppercase tracking-[.24em] text-blue-300">Why the offer is structured this way</div>
              <div className="mt-7 space-y-5">
                {[
                  [UsersRound,'01','One team, not one bot','Five specialists cover acquisition, first response, no-show protection, reactivation and reputation.'],
                  [ShieldCheck,'02','Risk reversal','The public offer includes a 30-day performance SLA with a setup-fee refund trigger when its written conditions are met.'],
                  [Clock3,'03','Speed matters','The first teammate is designed around rapid WhatsApp response for the critical first-contact window.'],
                  [Workflow,'04','Client-owned traffic','The master plan says clients run their own Meta/Google campaigns while Raja AI Systems monetizes the resulting inbound traffic.'],
                  [MessageCircle,'05','WhatsApp-native','The core customer interaction is built around WhatsApp voice notes + text rather than paid Vapi/Bland/Twilio calling APIs.'],
                  [Database,'06','Managed operations','Raja AI Systems handles the configured VPS/agent environment, maintenance and ongoing workflow operations.'],
                ].map(([Icon,n,title,body])=><div key={String(n)} className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center justify-center shrink-0">{React.createElement(Icon as React.ElementType,{className:'w-5 h-5 text-blue-300'})}</div><div><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{String(n)}</div><h4 className="mt-1 text-sm font-black text-white">{String(title)}</h4><p className="mt-1 text-xs leading-relaxed text-slate-500">{String(body)}</p></div></div>)}
              </div>
              <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-center"><CalendarCheck className="w-5 h-5 text-emerald-300 mx-auto mb-2"/><div className="text-lg font-black text-white">10 / 15</div><div className="text-[9px] uppercase tracking-widest text-slate-600">Visits / consultations*</div></div>
                <div className="rounded-2xl border border-blue-400/15 bg-blue-400/5 p-4 text-center"><Zap className="w-5 h-5 text-blue-300 mx-auto mb-2"/><div className="text-lg font-black text-white">48h</div><div className="text-[9px] uppercase tracking-widest text-slate-600">Deployment target*</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
