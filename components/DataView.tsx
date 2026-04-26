
import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { apiCall } from '../lib/api';

interface DataViewProps {
  user: UserProfile;
}

export const DataView: React.FC<DataViewProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
        try {
            setError(null);
            const data = await apiCall('/api/system?action=logs');
            setLogs(data || []);
        } catch (e: any) {
            console.error('Failed to fetch logs:', e);
            let msg = e.message || 'Failed to sync logs from cloud.';
            if (msg.toLowerCase().includes('index')) {
                msg = "Firestore Index Required: Please visit the Firebase Console and create a composite index for 'execution_logs' (user, timestamp).";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };
    
    fetchData();
    
    // Auto-refresh logs every 5 seconds for LIVE system monitoring
    const poller = setInterval(fetchData, 5000);
    
    return () => clearInterval(poller);
  }, []);

  const filtered = (Array.isArray(logs) ? logs : []).filter(r => 
    (r.command || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.outputPreview || '').toLowerCase().includes(search.toLowerCase())
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
                    {loading ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                            Loading execution log records...
                        </td></tr>
                    ) : error ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center">
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg inline-block text-sm">
                                ⚠️ {error} <br/>
                                <span className="text-xs opacity-70 mt-1 block">Check Firebase Console Indexes if this persists.</span>
                            </div>
                        </td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No data found.</td></tr>
                    ) : (
                        filtered.map((row) => (
                            <tr key={row.id} className="hover:bg-nexus-card/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        row.status === 'success' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        {row.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-mono text-sm leading-none mb-1">{row.command}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {row.timestamp ? (typeof row.timestamp === 'string' ? row.timestamp : new Date(row.timestamp.seconds * 1000).toLocaleString()) : 'N/A'}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-slate-300 font-mono text-xs">{row.role || 'CLIENT'}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate" title={row.outputPreview}>
                                    {row.outputPreview}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{row.durationMs ? `${row.durationMs}ms` : '-'}</td>
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
