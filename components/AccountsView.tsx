import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { Building2, Globe, Search, Filter } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useIndustry } from '../lib/IndustryContext';

interface AccountsProps {
  user: UserProfile;
}

export const AccountsView: React.FC<AccountsProps> = ({ user }) => {
  const { industryType } = useIndustry();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setLoading(false);
      return;
    }
    const q = query(collection(db as any, 'leads'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Derive unique accounts from leads
  const accounts = useMemo(() => {
    const map: Record<string, { name: string; industry: string; leadsCount: number; website: string; location: string }> = {};

    leads.forEach(lead => {
      const companyName = lead.businessName?.trim() || 'Unknown Company';
      if (!map[companyName]) {
        const cleanWeb = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        map[companyName] = {
          name: companyName,
          industry: lead.businessType || industryType || 'General',
          leadsCount: 0,
          website: cleanWeb,
          location: 'Remote Office'
        };
      }
      map[companyName].leadsCount++;
    });

    return Object.values(map);
  }, [leads, industryType]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Accounts Directory</h1>
          <p className="text-slate-400 text-sm font-medium">Manage and organize primary business profiles and client organizations.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-500 animate-pulse text-sm font-mono">Syncing accounts pipeline...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="border border-dashed border-[#1e293b] rounded-3xl p-16 text-center">
          <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-white uppercase mb-1">No Data Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">Add a Lead to Begin populating the accounts list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc, index) => (
            <div key={index} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base tracking-wide uppercase truncate">{acc.name}</h3>
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
      )}
    </div>
  );
};
