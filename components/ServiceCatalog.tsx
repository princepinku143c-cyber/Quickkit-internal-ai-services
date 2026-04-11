
import React, { useState } from 'react';
import { MASTER_CATALOG, BUNDLE_CATALOG } from '../data/catalog';
import { Currency, ServiceItem } from '../types';
import { CatalogHeader } from './catalog/CatalogHeader';
import { CatalogGrid } from './catalog/CatalogGrid';
import { Workflow, ShieldCheck, Zap, Globe, GitPullRequest, Package, Box, Layers, Settings, Users, ArrowRight } from 'lucide-react';

interface ServiceCatalogProps {
  onSelectItem: (item: ServiceItem) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectItem }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState('');

  const renderSearchMode = () => {
    const searchData = MASTER_CATALOG.flatMap(cat => cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    return (
      <div className="max-w-7xl mx-auto pt-12 min-h-[500px]">
        <CatalogGrid 
          items={searchData} 
          currency={currency} 
          title={`Search Results (${searchData.length})`} 
          onSelect={onSelectItem}
        />
      </div>
    );
  };

  const renderNormalMode = () => (
    <div className="max-w-7xl mx-auto pt-16 space-y-32">
       {MASTER_CATALOG.map((category) => (
         <div key={category.id} className="relative">
            <div className="mb-12 border-b border-slate-800 pb-8">
               <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">{category.title}</h3>
               {category.description && (
                  <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">{category.description}</p>
               )}
            </div>
            <CatalogGrid 
              items={category.items} 
              currency={currency} 
              title="" 
              onSelect={onSelectItem}
            />
         </div>
       ))}

       {/* What QuickKit Can Automate Block */}
       <div className="max-w-6xl mx-auto p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-slate-900 to-nexus-dark border border-slate-800 relative overflow-hidden mt-32">
          <div className="absolute -top-32 -right-32 p-10 opacity-5"><GitPullRequest className="w-96 h-96 text-cyan-400" /></div>
          
          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
             <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">What QuickKit Can Automate</h3>
             <p className="text-slate-400 text-lg leading-relaxed">
               QuickKit is built to run structured workflows across your tools, teams, and day-to-day operations — so repetitive work gets handled faster, cleaner, and with fewer bottlenecks.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 text-left">
             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"><Users className="w-5 h-5 text-cyan-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Sales & Lead Flow</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Lead capture</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Lead routing</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> CRM updates</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Outreach triggers</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Meeting booking</li>
                </ul>
             </div>
             
             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Globe className="w-5 h-5 text-blue-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Marketing Execution</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Email sequences</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Campaign triggers</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Ad reporting</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Social scheduling</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Audience segmentation</li>
                </ul>
             </div>

             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Settings className="w-5 h-5 text-purple-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Customer Operations</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Support replies</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Ticket routing</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Refund workflows</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Order updates</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Cart recovery</li>
                </ul>
             </div>

             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Layers className="w-5 h-5 text-orange-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Internal Operations</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Task assignment</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Alerts and reminders</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Status syncing</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Internal reporting</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Admin automation</li>
                </ul>
             </div>

             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><Box className="w-5 h-5 text-emerald-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Finance & Admin</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Invoice generation</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Payment reminders</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Billing status tracking</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Expense visibility</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Reporting workflows</li>
                </ul>
             </div>

             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20"><Zap className="w-5 h-5 text-pink-400" /></div>
                   <h4 className="text-xl font-bold text-white leading-tight">Content & Media</h4>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Draft generation</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Publishing flow</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Video packaging</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Voiceover production</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Content scheduling</li>
                </ul>
             </div>
          </div>

          <div className="mt-16 text-center border-t border-slate-800/50 pt-8 relative z-10">
             <p className="text-slate-500 text-sm max-w-2xl mx-auto italic">
                *Every workflow can include approval steps, permissions, logs, escalation rules, and safe execution limits.
             </p>
          </div>
       </div>

       {/* Catalog Bundles Section */}
       <div className="border-t border-slate-900 pt-32 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Workflow Implementation Bundles</h3>
            <p className="text-slate-400 text-lg">Deploy end-to-end automation systems with expert setup integration.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUNDLE_CATALOG.map((bundle, index) => (
               <div key={bundle.id} className="relative bg-[#080c14] border border-slate-800 rounded-[2.5rem] p-10 hover:border-cyan-500/50 hover:bg-slate-900 transition-all shadow-xl group">
                 {bundle.badge && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-cyan-400 shadow-xl whitespace-nowrap">
                    {bundle.badge}
                  </div>
                 )}
                 <div className="flex items-center justify-center mb-6 mt-4">
                    <div className="p-6 bg-slate-800/50 rounded-[2rem] group-hover:scale-105 transition-transform text-white border border-slate-700">
                       <Package className="w-12 h-12 text-cyan-400" />
                    </div>
                 </div>
                 <h4 className="text-2xl text-center font-black text-white mb-4">{bundle.name}</h4>
                 <p className="text-slate-400 text-center text-sm mb-8 pb-8 border-b border-slate-800/50 leading-relaxed">{bundle.description}</p>
                 
                 <div className="flex justify-between items-center mb-10">
                   <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-mono font-black mb-1 uppercase tracking-widest">Build Fee</p>
                      <p className="text-3xl font-black text-white">${bundle.setupUSD.toLocaleString()}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-slate-800"></div>
                   <div className="text-center">
                      <p className="text-[10px] text-emerald-400 font-mono font-black mb-1 uppercase tracking-widest">Monthly Ops</p>
                      <p className="text-3xl font-black text-emerald-400">${bundle.monthlyUSD.toLocaleString()}</p>
                   </div>
                 </div>
                 
                 <button onClick={() => onSelectItem(bundle)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn" > SELECT {bundle.name.split(' ')[0].toUpperCase()} PACKAGE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /> </button>
               </div>
            ))}
          </div>
       </div>

    </div>
  );

  return (
    <section id="catalog" className="py-32 bg-slate-950 border-t border-nexus-border relative overflow-hidden">
      {/* Premium glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 mb-8 uppercase tracking-[0.2em] font-black animate-pulse">
            <Workflow className="w-3 h-3" /> Business Automation Systems
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter animate-slide-up">
            Workflow Catalog
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed animate-slide-up [animation-delay:100ms] mb-12">
            Explore our library of deep automation blueprints. We build custom triggers, actions, and decision trees tailored exactly to your operations.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Reliability</div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><GitPullRequest className="w-4 h-4 text-cyan-400" /> Deep API Access</div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Globe className="w-4 h-4 text-indigo-400" /> System Agnostic</div>
          </div>
        </div>

        <CatalogHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currency={currency} 
          setCurrency={setCurrency} 
        />

        {searchQuery ? renderSearchMode() : renderNormalMode()}
        
      </div>
    </section>
  );
};
