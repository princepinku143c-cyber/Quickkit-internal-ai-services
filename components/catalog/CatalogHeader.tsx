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
      <p className="text-slate-400 max-w-2xl mx-auto mb-8">
        Already have a system? Pick and choose <strong>individual automation modules</strong> to add to your business without buying a full monthly package.
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

        {/* Currency Toggle */}
        <div className="flex items-center bg-slate-900 rounded-full p-1 border border-slate-700 shrink-0">
          <button 
            onClick={() => setCurrency('INR')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currency === 'INR' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            ₹ INR
          </button>
          <button 
            onClick={() => setCurrency('USD')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currency === 'USD' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            $ USD
          </button>
        </div>
      </div>
    </div>
  );
};