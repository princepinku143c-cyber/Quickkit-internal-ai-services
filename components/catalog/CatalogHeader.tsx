import React from 'react';
import { Search } from 'lucide-react';
import { Currency } from '../../types';

interface CatalogHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({ searchQuery, setSearchQuery, currency, setCurrency }) => {
  return (
    <div className="text-center mb-12">
      <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold tracking-widest uppercase mb-4">
        A La Carte Menu
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Single Service Catalog</h2>
      <p className="text-slate-400 max-w-2xl mx-auto mb-4">
        Already have a system? Pick and choose <strong>individual automation modules</strong> to add to your business without buying a full monthly package.
      </p>
      <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-8">
        * API & Tool Costs (Zapier, OpenAI, etc.) Managed Separately by Client
      </p>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Find specific tools (e.g. 'Chatbot', 'Billing')..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 pl-12 pr-6 text-white focus:border-cyan-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};