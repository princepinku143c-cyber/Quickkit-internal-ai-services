import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CatalogCategory } from '../../types';

interface CatalogSidebarProps {
  categories: CatalogCategory[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export const CatalogSidebar: React.FC<CatalogSidebarProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <h3 className="text-slate-400 font-bold mb-4 px-2 uppercase text-xs tracking-wider">Categories</h3>
      <div className="space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
              activeCategory === cat.id 
                ? 'bg-slate-800 text-white border border-slate-700 shadow-md' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {cat.title}
            {activeCategory === cat.id && <ChevronRight className="w-4 h-4 text-cyan-400" />}
          </button>
        ))}
      </div>
    </div>
  );
};