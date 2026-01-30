
import React, { useMemo, useState, useEffect } from 'react';
import { MOCK_LOGS } from '../lib/mockData';
import { Activity, CheckCircle2, DollarSign, Server, Zap } from 'lucide-react';
import { UserProfile, ExecutionLog } from '../types';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  // Effect to load logs from both MOCK and LocalStorage (Worker output)
  useEffect(() => {
    const interval = setInterval(() => {
        const localLogsRaw = localStorage.getItem('execution_logs');
        const localLogs = localLogsRaw ? JSON.parse(localLogsRaw) : [];
        // Merge Mock and Local logs
        const allLogs = [...localLogs, ...MOCK_LOGS];
        // Filter by User
        setLogs(allLogs.filter(log => log.userId === user.uid));
    }, 1000); // Poll every second for live updates

    return () => clearInterval(interval);
  }, [user.uid]);

  // Calculate Stats based on MY logs only
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'SUCCESS').length;
    const rate = total > 0 ? Math.round((success / total) * 100) : 100;
    
    // NEW: Calculate Total Credits Consumed
    const creditsUsed = logs.reduce((acc, curr) => acc + (curr.usage.creditsCost || 0), 0);
    
    // Health logic: Check last 5 logs
    const recentLogs = logs.slice(0, 5);
    const hasError = recentLogs.some(l => l.status === 'ERROR');

    return { rate, total, creditsUsed, healthy: !hasError };
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Pulse</h1>
        <p className="text-slate-400">Real-time overview of your personal automation infrastructure.</p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Success Rate */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Activity className="w-4 h-4" /> Success Rate
          </div>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-white">{stats.rate}%</span>
             {stats.rate < 90 && <span className="text-red-400 text-xs mb-1">Attention needed</span>}
          </div>
          <div className="w-full h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </div>

        {/* Total Processed */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Server className="w-4 h-4" /> Total Executions
          </div>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-white">{stats.total}</span>
             <span className="text-slate-500 text-sm mb-1">runs</span>
          </div>
        </div>

        {/* Credits Used (New Widget) */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-amber-500" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Zap className="w-4 h-4" /> Credits Consumed
          </div>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-white">{stats.creditsUsed}</span>
             <span className="text-amber-400 text-sm mb-1">used</span>
          </div>
        </div>

        {/* Health Status */}
        <div className={`glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden border-l-4 ${stats.healthy ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Activity className="w-4 h-4" /> System Status
          </div>
          <div>
             <h3 className={`text-xl font-bold ${stats.healthy ? 'text-emerald-400' : 'text-red-400'}`}>
               {stats.healthy ? '🟢 Operational' : '🔴 Maintenance'}
             </h3>
             <p className="text-xs text-slate-500 mt-1">
               {stats.healthy ? 'All systems functional' : 'Error detected in last run'}
             </p>
          </div>
        </div>
      </div>

      {/* Credit Usage History (Detailed Table) */}
      <div className="glass-panel rounded-xl border border-nexus-border overflow-hidden">
        <div className="p-4 border-b border-nexus-border flex justify-between items-center bg-nexus-card/30">
          <div className="flex items-center gap-2">
             <DollarSign className="w-4 h-4 text-emerald-400" />
             <h3 className="font-semibold text-white">Credit Usage History</h3>
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-nexus-dark/50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Workflow</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Cost</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                {logs.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No activity logged yet.</td>
                    </tr>
                ) : (
                    logs.slice(0, 20).map((log) => (
                        <tr key={log.id} className="hover:bg-nexus-card/50 transition-colors animate-fade-in">
                            <td className="px-6 py-4 text-sm text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-white font-medium text-sm">{log.workflowName}</span>
                                <p className="text-[10px] text-slate-500 font-mono">{log.id}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${
                                    log.status === 'SUCCESS' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                    {log.status === 'SUCCESS' ? 'Success' : 'Failed'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {log.status === 'SUCCESS' ? (
                                    <span className="text-white font-bold text-sm">
                                        -{log.usage.creditsCost} <span className="text-xs text-slate-500 font-normal">Credits</span>
                                    </span>
                                ) : (
                                    <span className="text-slate-500 text-sm line-through decoration-slate-600">
                                        0 Credits
                                    </span>
                                )}
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
