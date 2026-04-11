import React, { useState } from 'react';
import { Language } from '../types';

export const ROICalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  // Slider states
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [efficiency, setEfficiency] = useState(75);

  // Calculations
  const weeksPerMonth = 4;
  const currentMonthlyHours = teamSize * hoursPerWeek * weeksPerMonth;
  const currentMonthlyCost = currentMonthlyHours * hourlyCost;
  
  const savedMonthlyHours = Math.round(currentMonthlyHours * (efficiency / 100));
  const savedMonthlyCost = Math.round(currentMonthlyCost * (efficiency / 100));
  const savedAnnualCost = savedMonthlyCost * 12;

  // Assuming a generic $5,000 yearly investment for AI solutions for dramatic ROI %
  const estimatedInvestment = 5000;
  const roiPercentage = Math.round((savedAnnualCost / estimatedInvestment) * 100);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  return (
    <section id="roi" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium mb-4">
            <span className="uppercase tracking-widest text-xs">ROI Calculator</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">
            See How Much You'll Save
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Enter your current business metrics and instantly see the impact AI automation can have on your bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Panel: Sliders */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Your Current Numbers</h3>
            </div>

            <div className="space-y-8">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Team Members on Repetitive Tasks</span>
                  <span className="text-white font-mono">{teamSize}</span>
                </div>
                <input 
                  type="range" min="1" max="50" value={teamSize} 
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Avg Hours/Week on Manual Work (per person)</span>
                  <span className="text-white font-mono">{hoursPerWeek} hrs</span>
                </div>
                <input 
                  type="range" min="1" max="40" value={hoursPerWeek} 
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Avg Hourly Cost per Employee ($)</span>
                  <span className="text-white font-mono">${hourlyCost}</span>
                </div>
                <input 
                  type="range" min="5" max="150" value={hourlyCost} 
                  onChange={(e) => setHourlyCost(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 4 */}
              <div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Expected AI Automation Efficiency</span>
                  <span className="text-white font-mono">{efficiency}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="5" value={efficiency} 
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Panel: ROI Results */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 bg-[#0a0f1c]/80 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="text-emerald-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-emerald-400">Your Projected Savings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center">
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Monthly Cost (Current)</div>
                  <div className="text-2xl md:text-3xl font-mono text-slate-300">{formatCurrency(currentMonthlyCost)}</div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center">
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Monthly Savings with AI</div>
                  <div className="text-2xl md:text-3xl font-mono text-emerald-400">{formatCurrency(savedMonthlyCost)}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-8 text-center mb-4 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mb-3 relative z-10">Annual Savings</div>
                <div className="text-5xl md:text-6xl font-black font-mono text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] relative z-10">
                  {formatCurrency(savedAnnualCost)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center">
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Hours Saved / Month</div>
                  <div className="text-2xl md:text-3xl font-mono text-cyan-400">{formatNumber(savedMonthlyHours)} <span className="text-sm">hrs</span></div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center">
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">ROI in First Year</div>
                  <div className="text-2xl md:text-3xl font-mono text-indigo-400">{formatNumber(roiPercentage)}%</div>
                </div>
              </div>

              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                Start Saving Now — Request Custom Demo
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
