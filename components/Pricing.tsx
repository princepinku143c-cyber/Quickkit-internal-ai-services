import React from 'react';
import { ArrowRight, Check, Cpu, Server, ShieldCheck, Sparkles, Star, Workflow, Wrench, Zap } from 'lucide-react';
import { MANAGED_SYSTEMS } from '../constants';

interface PricingProps { lang?: string; onSelectPlan: (plan: string) => void; }

const PLANS = [
  {
    id:'KVM_4', badge:'Recommended starting point', color:'blue', popular:true, title:'KVM 4 AI System',
    setup:MANAGED_SYSTEMS.KVM4.setupINR, maintenance:MANAGED_SYSTEMS.KVM4.maintenanceINRPerMonthFromMonth2,
    tagline:'A managed AI foundation for lighter production workloads.',
    features:['Managed infrastructure setup','AI agent configuration & deployment','Memory + workflow configuration','Initial testing and optimization','First month managed operation included','From month 2: ₹15,000/month maintenance','AI/API usage billed separately'],
  },
  {
    id:'KVM_8', badge:'Higher capacity', color:'purple', popular:false, title:'KVM 8 AI System',
    setup:MANAGED_SYSTEMS.KVM8.setupINR, maintenance:MANAGED_SYSTEMS.KVM8.maintenanceINRPerMonthFromMonth2,
    tagline:'More headroom for heavier workloads and larger AI workforce systems.',
    features:['Managed infrastructure setup','AI agent configuration & deployment','Memory + workflow configuration','Initial testing and optimization','First month managed operation included','From month 2: ₹30,000/month maintenance','AI/API usage billed separately'],
  },
];

const styles: Record<string,{pill:string,check:string,button:string,glow:string}> = {
  blue:{pill:'text-blue-300 bg-blue-500/10 border-blue-500/25',check:'text-blue-400',button:'bg-blue-600 hover:bg-blue-500',glow:'shadow-[0_25px_90px_rgba(37,99,235,.14)]'},
  purple:{pill:'text-purple-300 bg-purple-500/10 border-purple-500/25',check:'text-purple-400',button:'bg-purple-600 hover:bg-purple-500',glow:'shadow-[0_25px_90px_rgba(168,85,247,.10)]'},
};

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => (
  <section id="pricing" className="py-28 md:py-32 bg-[#030712] border-t border-white/6 relative overflow-hidden">
    <div className="absolute left-1/2 -translate-x-1/2 -top-52 w-[900px] h-[520px] rounded-full bg-blue-600/8 blur-[150px] pointer-events-none" />
    <div className="container mx-auto px-5 md:px-8 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-blue-300"><Sparkles className="w-3 h-3" /> Managed system pricing</div>
        <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Simple infrastructure. Serious automation.</h2>
        <p className="mt-5 text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">The published setup prices stay fixed while the system is configured around your workflow. The first month of managed operation is included; maintenance starts in month 2.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => {
          const s=styles[plan.color];
          return (
            <div key={plan.id} className={`relative rounded-[2rem] border p-7 md:p-9 bg-gradient-to-b from-slate-900/85 to-slate-950/95 ${plan.popular?'border-blue-400/40 md:-translate-y-3':'border-purple-400/20'} ${s.glow}`}>
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-1.5 text-[9px] font-black uppercase tracking-[.18em] text-white"><Star className="w-3 h-3 fill-white" /> Recommended</div>}
              <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[.18em] ${s.pill}`}>{plan.badge}</span>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div><h3 className="text-2xl font-black text-white">{plan.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-sm">{plan.tagline}</p></div>
                <Server className="w-7 h-7 text-slate-600 shrink-0" />
              </div>

              <div className="mt-8 rounded-2xl border border-white/7 bg-black/20 p-5">
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">One-time setup</div>
                <div className="mt-1 text-5xl font-black tracking-tight text-white">₹{plan.setup.toLocaleString('en-IN')}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs font-bold text-emerald-300"><Wrench className="w-4 h-4" /> Month 1 managed operation included</div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/7 bg-white/[.02] p-5">
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-slate-600"><Wrench className="w-4 h-4 text-slate-500" /> From month 2</div>
                <div className="mt-1 text-2xl font-black text-white">₹{plan.maintenance.toLocaleString('en-IN')}<span className="text-xs font-bold text-slate-500"> / month maintenance</span></div>
              </div>

              <div className="mt-7 space-y-3">
                {plan.features.map(f=><div key={f} className="flex items-start gap-3"><Check className={`w-4 h-4 shrink-0 mt-0.5 ${s.check}`} /><span className="text-sm leading-relaxed text-slate-300">{f}</span></div>)}
              </div>

              <div className="mt-7 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-amber-300"><Cpu className="w-4 h-4" /> Usage is separate</div>
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate-400">AI model and third-party provider/API charges are usage-based and depend on what you connect and how much you use.</p>
              </div>

              <button onClick={() => onSelectPlan(plan.id)} className={`mt-7 w-full rounded-2xl py-4 text-xs font-black uppercase tracking-[.14em] text-white transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 ${s.button}`}>Start with {plan.title.replace(' AI System','')} <ArrowRight className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto mt-14 rounded-[2rem] border border-white/8 bg-slate-950/65 p-7 md:p-9">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            [Zap,'01 · Setup','Infrastructure, agents, memory and workflows are configured around the approved scope.'],
            [ShieldCheck,'02 · Verify','The configured path is tested before it is treated as a production-ready workflow.'],
            [Workflow,'03 · Maintain','Monitoring, fixes and ongoing system maintenance continue from month 2 at the published rate.'],
          ].map(([Icon,title,body])=><div key={String(title)} className="rounded-2xl border border-slate-800 bg-black/15 p-5">{React.createElement(Icon as React.ElementType,{className:'w-6 h-6 text-blue-300 mb-4'})}<h4 className="text-sm font-black text-white">{String(title)}</h4><p className="mt-2 text-xs leading-relaxed text-slate-500">{String(body)}</p></div>)}
        </div>
        <p className="mt-7 text-center text-[10px] font-mono uppercase tracking-widest text-slate-700">Commercial note: setup/maintenance do not represent third-party AI, WhatsApp, telephony, advertising, hosting add-ons or other provider usage unless explicitly included in the scope.</p>
      </div>
    </div>
  </section>
);