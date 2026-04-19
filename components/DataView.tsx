
import React, { useState, useMemo } from 'react';
import { MOCK_RESULTS } from '../lib/mockData';
import { Download, Search, Filter } from 'lucide-react';
import { UserProfile } from '../types';

interface DataViewProps {
  user: UserProfile;
}

export const DataView: React.FC<DataViewProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  
  const myResults = useMemo(() => {
    return MOCK_RESULTS;
  }, []);

  const filtered = myResults.filter(r => 
    r.workflowName.toLowerCase().includes(search.toLowerCase()) || 
    r.inputSummary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white">Data & Results</h1>
           <p className="text-slate-400">View and download outputs from your automation runs.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search results..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-nexus-card border border-nexus-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none w-64"
                />
            </div>
            <button className="p-2 bg-nexus-card border border-nexus-border rounded-lg text-slate-400 hover:text-white">
                <Filter className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-nexus-border overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-nexus-card border-b border-nexus-border text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Workflow</th>
                        <th className="px-6 py-4 font-semibold">Input Summary</th>
                        <th className="px-6 py-4 font-semibold">Output Preview</th>
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                    {filtered.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No data found.</td></tr>
                    ) : (
                        filtered.map((row) => (
                            <tr key={row.id} className="hover:bg-nexus-card/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium">{row.workflowName}</p>
                                    <p className="text-xs text-slate-500">{row.date}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-300 font-mono text-xs">{row.inputSummary}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate" title={row.outputResult}>
                                    {row.outputResult}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{row.duration}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
