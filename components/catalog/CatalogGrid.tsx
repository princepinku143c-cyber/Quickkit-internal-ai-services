import React from 'react';
import { CatalogItem } from './CatalogItem';
import { Currency, ServiceItem } from '../../types';

interface CatalogGridProps {
  items: ServiceItem[];
  currency: Currency;
  title: string;
  onSelect: (item: ServiceItem) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ items, currency, title, onSelect }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-white">
          {title}
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>No services found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <CatalogItem key={item.id} item={item} currency={currency} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};