import React from 'react';
import { UserProfile } from '../types';
import { Briefcase, Building2, Search, Plus, ExternalLink, ShieldCheck, Mail, Globe } from 'lucide-react';
import { useIndustry } from '../lib/IndustryContext';

interface AccountsProps {
  user: UserProfile;
}

export const AccountsView: React.FC<AccountsProps> = ({ user }) => {
  const { industryType } = useIndustry();

  // Mock accounts based on client role and industry
  const mockAccounts = [
    { id: 1, name: 'Acme Development', industry: industryType || 'Real Estate', leadsCount: 4, status: 'Active', website: 'acme.com', location: 'New York, US' },
    { id: 2, name: 'Vanguard Realty Group', industry: industryType || 'Real Estate', leadsCount: 8, status: 'Active', website: 'vanguardrealty.co', location: 'London, UK' },
    { id: 3, name: 'Nexus Holdings LLC', industry: industryType || 'Custom', leadsCount: 3, status: 'Pending', website: 'nexusholdings.io', location: 'Silicon Valley, US' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Accounts Directory</h1>
          <p className="text-slate-400 text-sm font-medium">Manage and organize primary business profiles and client organizations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAccounts.map((acc) => (
          <div key={acc.id} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {acc.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base tracking-wide uppercase">{acc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-400 font-mono">{acc.website}</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-800/50 my-4"></div>

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Industry: <strong className="text-slate-300">{acc.industry}</strong></span>
                <span>Leads Mapped: <strong className="text-slate-300">{acc.leadsCount}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
