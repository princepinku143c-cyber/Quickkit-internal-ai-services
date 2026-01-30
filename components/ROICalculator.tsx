
import React, { useState, useEffect } from 'react';
import { PlanTier, CalculationResult } from '../types';
import { PLANS } from '../constants';
import { TRANSLATIONS } from '../data/translations';
import { LeadForm } from './LeadForm';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Language } from '../types';

interface ROIProps {
  lang: Language;
}

export const ROICalculator: React.FC<ROIProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].roi;
  
  // Form State
  const [bizType, setBizType] = useState('Salon');
  const [teamSize, setTeamSize] = useState(5);
  const [dailyMsgs, setDailyMsgs] = useState(50);
  const [manualHours, setManualHours] = useState(3);
  const [staffCost, setStaffCost] = useState(100);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Result State
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    calculate();
  }, [bizType, teamSize, dailyMsgs, manualHours, staffCost]);

  const calculate = () => {
    // Logic: 70% of manual hours saved
    const dailySavedHours = manualHours * 0.7;
    const monthlySavedHours = dailySavedHours * 26; // 26 working days
    const monthlySavedMoney = monthlySavedHours * staffCost;

    // Recommend Plan based on Savings/Scale
    let recPlan = PlanTier.STARTER;
    if (monthlySavedMoney > 15000) recPlan = PlanTier.PRO;
    if (monthlySavedMoney > 50000) recPlan = PlanTier.BUSINESS;

    const planDetails = PLANS[recPlan];
    
    // Payback calculation (Setup Fee / Monthly Savings)
    const paybackMonths = monthlySavedMoney > 0 ? (planDetails.priceSetup / monthlySavedMoney) : 0;

    setResult({
      dailySavedHours,
      monthlySavedHours,
      monthlySavedMoney,
      recommendedPlan: recPlan,
      setupCost: planDetails.priceSetup,
      monthlyFee: planDetails.priceMonth,
      paybackMonths
    });
  };

  return (
    <section id="roi" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-cyan-400" />
            {t.title}
          </h2>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Inputs */}
          <div className="glass-card p-8 rounded-3xl border-t-4 border-t-cyan-500">
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 mb-2 font-medium">{t.form.bizType}</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                >
                  {['Salon', 'Clinic', 'Real Estate', 'Coaching', 'Ecommerce', 'Agency', 'Other'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">{t.form.teamSize}</label>
                  <input 
                    type="number" 
                    min="1" max="100"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">{t.form.msgs}</label>
                  <select 
                    value={dailyMsgs}
                    onChange={(e) => setDailyMsgs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value={20}>0-50</option>
                    <option value={100}>50-200</option>
                    <option value={300}>200+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-2 font-medium flex justify-between">
                  {t.form.hours} 
                  <span className="text-cyan-400">{manualHours} hrs</span>
                </label>
                <input 
                  type="range" min="0" max="10" step="0.5"
                  value={manualHours}
                  onChange={(e) => setManualHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                 <label className="block text-slate-400 mb-2 font-medium">{t.form.cost}</label>
                 <input 
                    type="number" 
                    value={staffCost}
                    onChange={(e) => setStaffCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                  />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="relative">
            <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-between border-t-4 border-t-emerald-500">
              <div className="space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                  <span className="text-slate-400">{t.result.savedTime}</span>
                  <span className="text-3xl font-bold text-white">{result?.monthlySavedHours.toFixed(0)} Hours</span>
                </div>
                
                <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                  <span className="text-slate-400">{t.result.savedMoney}</span>
                  <span className="text-4xl font-extrabold text-green-400">₹{result?.monthlySavedMoney.toLocaleString()}</span>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <div className="flex gap-4 items-center">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase tracking-wider font-bold">Recommended: {result?.recommendedPlan}</span>
                      <p className="text-sm text-slate-300 mt-1">
                        Break even in <span className="text-white font-bold">{result?.paybackMonths.toFixed(1)} Months</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowLeadForm(true)}
                className="w-full mt-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {t.result.unlock} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLeadForm && result && (
        <LeadForm 
          lang={lang} 
          close={() => setShowLeadForm(false)} 
          initialData={{ bizType, plan: result.recommendedPlan }}
        />
      )}
    </section>
  );
};
