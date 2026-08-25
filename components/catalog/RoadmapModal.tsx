import React, { useState } from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { ServiceItem, Currency, AIQuote } from '../../types';

interface RoadmapModalProps {
  item?: ServiceItem;
  customPrompt?: string;
  currency: Currency;
  existingData?: any;
  existingHistory?: any[];
  onSaveState?: (data: any, history: any[]) => void;
  onClose: () => void;
  onBook?: (quote: AIQuote, history: any[]) => void;
  sessionRef?: string;
}

/** Compatibility shell retained for the legacy import path. Public payment remains Razorpay-only. */
export const RoadmapModal: React.FC<RoadmapModalProps> = ({ item, customPrompt, onClose, onBook }) => {
  const [requirement, setRequirement] = useState(customPrompt || '');

  const handleContinue = () => {
    const history = requirement ? [{ role: 'user', content: requirement }] : [];
    onBook?.({
      setupCost: item?.setupUSD || 0,
      monthlyCost: item?.monthlyUSD || 0,
      roiEstimate: 0,
      buildTime: 'Scoping required',
      generatedAt: new Date().toISOString(),
      isCustomEstimate: true,
    }, history);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#080c14] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-400 font-black">AI System Blueprint</p>
            <h3 className="text-2xl font-black text-white mt-1">{item?.name || 'Custom AI System'}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center gap-3 text-blue-400 mb-2"><Sparkles className="w-5 h-5" /><span className="font-black text-sm uppercase tracking-widest">Managed AI • Razorpay</span></div>
            <p className="text-sm text-slate-400">Tell us what you want to automate. Pricing and payment are handled through the current INR/Razorpay flow after scoping.</p>
          </div>
          <textarea value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="What should your AI system do?" className="w-full min-h-36 rounded-2xl bg-slate-950 border border-slate-800 text-white p-4 outline-none focus:border-blue-500/50 resize-y" />
          <button onClick={handleContinue} className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">Continue <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
