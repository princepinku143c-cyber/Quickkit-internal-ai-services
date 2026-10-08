import React, { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { Language } from '../types';

export const ROICalculator: React.FC<{ lang: Language }> = () => {
  const [leads, setLeads] = useState(500);
  const [minutesPerLead, setMinutesPerLead] = useState(10);
  const [salesTeam, setSalesTeam] = useState(5);
  const [monthlySalary, setMonthlySalary] = useState(35000);
  const [automation, setAutomation] = useState(60);

  const currentMonthlyHours = Math.round((leads * minutesPerLead / 60) * 10) / 10;
  const teamCapacityHours = Math.max(1, salesTeam * 160);
  const currentFollowUpCost = Math.round(salesTeam * monthlySalary * Math.min(1, currentMonthlyHours / teamCapacityHours));
  const savedHours = Math.round(currentMonthlyHours * automation / 100 * 10) / 10;
  const potentialMonthlyWorkValue = Math.round(currentFollowUpCost * automation / 100);
  const potentialAnnualWorkValue = potentialMonthlyWorkValue * 12;

  const inr = (v:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
  const num = (v:number) => new Intl.NumberFormat('en-IN').format(v);

  return (
    <section id="roi" className="py-28 bg-[#030712] border-t border-white/6 relative overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-300px] w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.24em] text-slate-400"><Calculator className="w-3 h-3" /> Planning calculator</div>
          <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Estimate the value of removing repetitive follow-up work.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">Adjust the assumptions to model your current operational workload. This is a planning model — not a promise of sales, savings, rankings or ROI.</p>
        </div>

        <div className="grid lg:grid-cols-[.95fr_1.05fr] gap-6 max-w-6xl mx-auto">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-7 md:p-9">
            <h3 className="text-xl font-black text-white">Your operating assumptions</h3>
            <div className="mt-8 space-y-7">
              {[
                ['Leads / month',leads,50,10000,50,(v:number)=>setLeads(v),num],
                ['Minutes of follow-up / lead',minutesPerLead,2,30,1,(v:number)=>setMinutesPerLead(v),num],
                ['Sales team size',salesTeam,1,100,1,(v:number)=>setSalesTeam(v),num],
                ['Monthly cost / sales person',monthlySalary,15000,150000,5000,(v:number)=>setMonthlySalary(v),inr],
                ['Potential automation level',automation,10,90,5,(v:number)=>setAutomation(v),(v:number)=>`${v}%`],
              ].map(([label,value,min,max,step,setter,format])=>{
                const valueN=Number(value);
                return <div key={String(label)}>
                  <div className="flex justify-between text-sm mb-3"><span className="text-slate-400">{String(label)}</span><span className="font-mono font-bold text-white">{(format as any)(valueN)}</span></div>
                  <input type="range" aria-label={String(label)} min={Number(min)} max={Number(max)} step={Number(step)} value={valueN} onChange={e=>(setter as any)(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                </div>;
              })}
            </div>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-800 bg-black/15 p-4"><Info className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" /><p className="text-xs leading-relaxed text-slate-500">The model assumes 160 working hours per person per month only to estimate the portion of team cost associated with the follow-up workload. Replace these assumptions with your actual numbers before using the result commercially.</p></div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-7 md:p-9">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-black/15 p-5"><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Current hours / month</div><div className="mt-2 text-3xl font-black text-white">{num(currentMonthlyHours)}</div></div>
              <div className="rounded-2xl border border-slate-800 bg-black/15 p-5"><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Potential hours reclaimed</div><div className="mt-2 text-3xl font-black text-emerald-300">{num(savedHours)}</div></div>
            </div>
            <div className="mt-3 rounded-[1.6rem] border border-emerald-400/20 bg-emerald-400/5 p-7 text-center"><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Illustrative monthly work value</div><div className="mt-2 text-5xl md:text-6xl font-black text-white">{inr(potentialMonthlyWorkValue)}</div><p className="mt-3 text-xs leading-relaxed text-slate-500">Derived from the proportion of estimated follow-up workload selected for automation.</p></div>
            <div className="mt-3 rounded-2xl border border-blue-400/15 bg-blue-400/5 p-5"><div className="text-[9px] font-mono uppercase tracking-widest text-blue-300">Illustrative annual work value</div><div className="mt-2 text-3xl font-black text-white">{inr(potentialAnnualWorkValue)}</div></div>
            <p className="mt-5 text-xs leading-relaxed text-slate-600">This calculator does not predict property sales, conversion rates, revenue, rankings, guaranteed savings or payback. Real economics depend on workflow design, team mix, lead quality, provider costs and actual adoption.</p>
          </div>
        </div>
      </div>
    </section>
  );
};