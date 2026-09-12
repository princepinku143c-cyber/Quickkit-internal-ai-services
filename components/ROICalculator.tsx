import React, { useState } from 'react';
import { Language } from '../types';

export const ROICalculator: React.FC<{ lang: Language }> = () => {
  const [leads, setLeads] = useState(500);
  const [followUpHours, setFollowUpHours] = useState(20);
  const [salesTeam, setSalesTeam] = useState(5);
  const [monthlySalary, setMonthlySalary] = useState(35000);
  const [automation, setAutomation] = useState(50);

  const currentMonthlyHours = followUpHours * 4;
  const savedHours = Math.round(currentMonthlyHours * automation / 100);
  const currentFollowUpCost = Math.round(salesTeam * monthlySalary * Math.min(1, followUpHours / 40));
  const potentialMonthlyValue = Math.round(currentFollowUpCost * automation / 100);
  const potentialAnnualValue = potentialMonthlyValue * 12;
  const formatCurrency = (v:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
  const formatNumber = (v:number) => new Intl.NumberFormat('en-IN').format(v);

  return <section id="roi" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-900/50">
    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium mb-4"><span className="uppercase tracking-widest text-xs">Real Estate Business Value Calculator</span></div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">Estimate the Value of Automating Property Lead Follow-Up</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Model your current lead volume, sales-team follow-up workload and a potential automation level. This is an illustrative planning estimate, not a guaranteed ROI or sales outcome.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]">
          <h3 className="text-xl font-bold text-white mb-8">Your Real Estate Funnel</h3>
          <div className="space-y-8">
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Property Leads / Month</span><span className="text-white font-mono">{formatNumber(leads)}</span></div><input aria-label="Property leads per month" type="range" min="50" max="10000" step="50" value={leads} onChange={e=>setLeads(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Follow-Up Hours / Week</span><span className="text-white font-mono">{followUpHours} hrs</span></div><input aria-label="Follow-up hours per week" type="range" min="1" max="80" value={followUpHours} onChange={e=>setFollowUpHours(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Sales Team Size</span><span className="text-white font-mono">{salesTeam}</span></div><input aria-label="Sales team size" type="range" min="1" max="100" value={salesTeam} onChange={e=>setSalesTeam(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Average Monthly Cost / Sales Person</span><span className="text-white font-mono">{formatCurrency(monthlySalary)}</span></div><input aria-label="Average monthly cost per sales person" type="range" min="15000" max="150000" step="5000" value={monthlySalary} onChange={e=>setMonthlySalary(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Potential Follow-Up Automation</span><span className="text-white font-mono">{automation}%</span></div><input aria-label="Potential follow-up automation" type="range" min="10" max="90" step="5" value={automation} onChange={e=>setAutomation(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]/80 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"/>
          <h3 className="text-xl font-bold text-emerald-400 mb-8 relative">Illustrative Operational Value</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Lead Volume</div><div className="text-2xl font-mono text-slate-300">{formatNumber(leads)}/mo</div></div>
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Current Follow-Up Cost</div><div className="text-2xl font-mono text-slate-300">{formatCurrency(currentFollowUpCost)}</div></div>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-8 text-center mb-4"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Potential Monthly Work Value</div><div className="text-5xl md:text-6xl font-black font-mono text-emerald-500">{formatCurrency(potentialMonthlyValue)}</div></div>
          <div className="grid grid-cols-2 gap-4 mb-8"><div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Hours / Month</div><div className="text-2xl font-mono text-cyan-400">{formatNumber(currentMonthlyHours)}</div></div><div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Potential Hours Reclaimed</div><div className="text-2xl font-mono text-indigo-400">{formatNumber(savedHours)}</div></div></div>
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 text-center mb-6"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Illustrative Annual Work Value</div><div className="text-3xl font-black font-mono text-white">{formatCurrency(potentialAnnualValue)}</div></div>
          <p className="text-xs text-slate-500 leading-relaxed">Estimate only. It does not predict property sales, conversion rates, revenue, rankings or guaranteed savings. AI/API usage, setup, maintenance, staffing mix and workflow-specific costs must be assessed separately.</p>
        </div>
      </div>
    </div>
  </section>;
};
