import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Users, Search, Filter, Plus, Mail, Phone, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useIndustry } from '../lib/IndustryContext';

interface LeadsProps {
  user: UserProfile;
}

export const LeadsView: React.FC<LeadsProps> = ({ user }) => {
  const { industryType } = useIndustry();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredLeads = leads.filter(lead => 
    (lead.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (lead.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (lead.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-blue-400" /> Niche Type: {industryType || 'General'}
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Leads Database</h1>
          <p className="text-slate-400 text-sm">Monitor all inbound and qualified leads associated with your workspace.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0f172a]/60 border border-[#1e293b] p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-slate-400 hover:text-white">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-500 animate-pulse text-sm font-mono">Querying leads table...</div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="border border-dashed border-[#1e293b] rounded-3xl p-16 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-white uppercase mb-1">No Leads Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">Create new leads from the Kanban board to sync them with your system database.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a]/40 border border-[#1e293b] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-slate-950/40">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Details</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Requirements</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Niche Mapped</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-sm">{lead.name}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> {lead.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> {lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300 text-xs line-clamp-1 max-w-xs">{lead.requirement || lead.notes || 'No notes specified'}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                        {lead.businessType || industryType || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-500 text-xs font-mono">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
