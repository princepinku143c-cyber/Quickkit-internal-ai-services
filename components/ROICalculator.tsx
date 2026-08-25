import React, { useState } from 'react';
import { Language } from '../types';

export const ROICalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [monthlyCostPerEmployee, setMonthlyCostPerEmployee] = useState(25000);
  const [efficiency, setEfficiency] = useState(50);

  const currentMonthlyHours = teamSize * hoursPerWeek * 4;
  const currentMonthlyCost = teamSize * monthlyCostPerEmployee;
  const savedMonthlyHours = Math.round(currentMonthlyHours * efficiency / 100);
  const savedMonthlyValue = Math.round(currentMonthlyCost * efficiency / 100);
  const savedAnnualValue = savedMonthlyValue * 12;
  const formatCurrency = (v:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
  const formatNumber = (v:number) => new Intl.NumberFormat('en-IN').format(v);

  return <section id="roi" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-900/50">
    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium mb-4"><span className="uppercase tracking-widest text-xs">Business Value Calculator</span></div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">Estimate the Value of Automating Manual Work</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Enter your current team and workload. This calculator estimates the time and operational value that automation could potentially reclaim. Actual results depend on your workflow.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]">
          <h3 className="text-xl font-bold text-white mb-8">Your Current Numbers</h3>
          <div className="space-y-8">
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Team Members on Repetitive Work</span><span className="text-white font-mono">{teamSize}</span></div><input type="range" min="1" max="50" value={teamSize} onChange={e=>setTeamSize(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Manual Work Hours / Week / Person</span><span className="text-white font-mono">{hoursPerWeek} hrs</span></div><input type="range" min="1" max="40" value={hoursPerWeek} onChange={e=>setHoursPerWeek(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Monthly Cost per Employee</span><span className="text-white font-mono">{formatCurrency(monthlyCostPerEmployee)}</span></div><input type="range" min="10000" max="150000" step="5000" value={monthlyCostPerEmployee} onChange={e=>setMonthlyCostPerEmployee(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Potential Workload Automation</span><span className="text-white font-mono">{efficiency}%</span></div><input type="range" min="10" max="90" step="5" value={efficiency} onChange={e=>setEfficiency(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"/></div>
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]/80 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"/>
          <h3 className="text-xl font-bold text-emerald-400 mb-8 relative">Estimated Business Value</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Current Monthly Team Cost</div><div className="text-2xl font-mono text-slate-300">{formatCurrency(currentMonthlyCost)}</div></div>
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Potential Monthly Value</div><div className="text-2xl font-mono text-emerald-400">{formatCurrency(savedMonthlyValue)}</div></div>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-8 text-center mb-4"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Potential Annual Value</div><div className="text-5xl md:text-6xl font-black font-mono text-emerald-500">{formatCurrency(savedAnnualValue)}</div></div>
          <div className="grid grid-cols-2 gap-4 mb-8"><div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Hours / Month</div><div className="text-2xl font-mono text-cyan-400">{formatNumber(currentMonthlyHours)}</div></div><div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Potential Hours Reclaimed</div><div className="text-2xl font-mono text-indigo-400">{formatNumber(savedMonthlyHours)}</div></div></div>
          <p className="text-xs text-slate-500 leading-relaxed">This is an estimate, not a guaranteed ROI or savings promise. AI/API usage, setup, maintenance and workflow-specific costs should be considered separately.</p>
        </div>
      </div>
    </div>
  </section>;
};
