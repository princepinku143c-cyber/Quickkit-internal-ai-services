
import React, { useState } from 'react';
import { MASTER_CATALOG } from '../data/catalog';
import { Currency, ServiceItem } from '../types';
import { CatalogHeader } from './catalog/CatalogHeader';
import { CatalogSidebar } from './catalog/CatalogSidebar';
import { CatalogGrid } from './catalog/CatalogGrid';

interface ServiceCatalogProps {
  onSelectItem: (item: ServiceItem) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectItem }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeCategory, setActiveCategory] = useState<string>(MASTER_CATALOG[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search or category
  const filteredData = searchQuery
    ? MASTER_CATALOG.flatMap(cat => cat.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )).map(item => ({ ...item, categoryId: 'SEARCH' }))
    : MASTER_CATALOG.find(cat => cat.id === activeCategory)?.items || [];

  const displayTitle = searchQuery ? `Search Results (${filteredData.length})` : MASTER_CATALOG.find(c => c.id === activeCategory)?.title || '';

  return (
    <section id="catalog" className="py-24 bg-slate-950 border-t border-nexus-border">
      <div className="container mx-auto px-6">
        
        <CatalogHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currency={currency} 
          setCurrency={setCurrency} 
        />

        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
          
          {/* Sidebar */}
          {!searchQuery && (
            <div className="lg:w-1/4">
              <CatalogSidebar 
                categories={MASTER_CATALOG} 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
              />
            </div>
          )}

          {/* Grid Content */}
          <div className={`${searchQuery ? 'w-full' : 'lg:w-3/4'}`}>
            <CatalogGrid 
              items={filteredData} 
              currency={currency} 
              title={displayTitle} 
              onSelect={onSelectItem}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
