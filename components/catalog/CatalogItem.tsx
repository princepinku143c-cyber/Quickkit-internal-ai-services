import React from 'react';
import { Settings, ArrowRight, GitMerge, CheckCircle2 } from 'lucide-react';
import { Currency, ServiceItem } from '../../types';

interface CatalogItemProps {
  item: ServiceItem;
  currency: Currency;
  onSelect: (item: ServiceItem) => void;
}

export const CatalogItem: React.FC<CatalogItemProps> = ({ item, currency, onSelect }) => {
  return (
    <div 
      className="group bg-[#080c14] border border-slate-800 hover:border-cyan-500/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
    >
      {item.badge && (
        <div className="absolute top-6 right-6 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full">
          {item.badge}
        </div>
      )}
      
      <div className="mb-6">
         <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-cyan-500/50 group-hover:bg-cyan-600/10 transition-all">
            <Settings className="w-7 h-7 text-slate-400 group-hover:text-cyan-400 transition-colors" />
         </div>
         <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
            {item.name}
         </h3>
         <p className="text-emerald-400 text-xs font-bold font-mono uppercase tracking-tight">
            {item.outcome}
         </p>
      </div>

      <div className="space-y-4 mb-8 flex-1">
         {item.actions?.map((action, i) => (
            <div key={i} className="flex items-start gap-3">
               <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/20">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
               </div>
               <p className="text-sm text-slate-300 leading-tight">{action}</p>
            </div>
         ))}
      </div>

      {item.handles && (
         <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 mb-6 flex items-start gap-3">
            <GitMerge className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Workflow Logic</p>
               <p className="text-xs text-slate-300 leading-relaxed font-mono">{item.handles}</p>
            </div>
         </div>
      )}

      <div className="space-y-3 pt-6 border-t border-slate-800/50 mb-8">
         {item.integrations && (
           <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Integrations:</span>
              <span className="text-cyan-400 normal-case">{item.integrations}</span>
           </div>
         )}
         {item.bestFor && (
           <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Best For:</span>
              <span className="text-slate-300 normal-case">{item.bestFor}</span>
           </div>
         )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 group-hover:border-slate-700 transition-colors">
            <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Expert Setup</p>
            <p className="text-xl font-black text-white">${item.setupUSD.toLocaleString()}</p>
         </div>
         <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            <p className="text-[9px] text-emerald-500/70 font-black uppercase mb-1">Monthly Cost</p>
            <p className="text-xl font-black text-emerald-400">${item.monthlyUSD.toLocaleString()}</p>
         </div>
      </div>

      <button 
        onClick={() => onSelect(item)}
        className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
      >
        VIEW WORKFLOW
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};