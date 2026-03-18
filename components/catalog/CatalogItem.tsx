import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { Currency, ServiceItem } from '../../types';

interface CatalogItemProps {
  item: ServiceItem;
  currency: Currency;
  onSelect: (item: ServiceItem) => void;
}

export const CatalogItem: React.FC<CatalogItemProps> = ({ item, currency, onSelect }) => {
  
  return (
    <div 
      onClick={() => onSelect(item)}
      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-5 transition-all cursor-pointer relative overflow-hidden h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
         <Globe className="w-5 h-5 text-cyan-400" />
      </div>

      <h4 className="font-semibold text-white mb-1 pr-6 group-hover:text-cyan-300 transition-colors line-clamp-2">
        {item.name}
      </h4>
      <p className="text-[10px] text-slate-500 mb-4 line-clamp-2">{item.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs text-slate-400">
          <p>Setup Fee</p>
          <p className="text-lg font-bold text-white">
            ${item.setupUSD.toLocaleString()}
          </p>
        </div>
        <div className="h-8 w-[1px] bg-slate-700 mx-4"></div>
        <div className="text-xs text-right">
          <p className="text-slate-400">Monthly</p>
          <p className="text-lg font-bold text-emerald-400">
            ${item.monthlyUSD.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};