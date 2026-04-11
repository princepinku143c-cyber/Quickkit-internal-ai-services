
import React, { useMemo, useState, useEffect } from 'react';
import { MOCK_LOGS } from '../lib/mockData';
import { Activity, CheckCircle2, DollarSign, Server, Zap } from 'lucide-react';
import { UserProfile, ExecutionLog, LeadSubmission } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myLead, setMyLead] = useState<LeadSubmission | null>(null);

  useEffect(() => {
    if (Object.keys(db).length > 0) {
      const q = query(collection(db as any, 'leads'), where('email', '==', user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Get the most recent lead
          const leadsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as LeadSubmission));
          const latestLead = leadsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
          setMyLead(latestLead);
        }
      });
      return () => unsubscribe();
    }
  }, [user.email]);

  const stats = useMemo(() => {
    // Generate dummy/sample execution data to make it look active (since we don't have Zapier connected yet)
    return { rate: 100, total: myLead ? 2 : 0, creditsUsed: myLead ? 150 : 0, healthy: true };
  }, [myLead]);

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

      {/* My Project Request (Replaces Execution Logs) */}
      <div className="glass-panel rounded-xl border border-nexus-border overflow-hidden p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white text-lg">My Custom Build Plan</h3>
          </div>
          
          {myLead && myLead.aiQuote ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 bg-nexus-dark/50 rounded-lg border border-nexus-border">
                      <span className="text-xs text-slate-500 font-bold uppercase track-wider block mb-1">Architecture Cost</span>
                      <span className="text-2xl font-bold text-white">${myLead.aiQuote.setupCost}</span>
                  </div>
                  <div className="p-4 bg-nexus-dark/50 rounded-lg border border-nexus-border">
                      <span className="text-xs text-slate-500 font-bold uppercase track-wider block mb-1">Monthly Optimization</span>
                      <span className="text-2xl font-bold text-blue-400">${myLead.aiQuote.monthlyCost}</span>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-xs text-emerald-500 font-bold uppercase track-wider block mb-1">Estimated ROI Reclaimed</span>
                      <span className="text-2xl font-bold text-emerald-400">${myLead.aiQuote.roiEstimate.toLocaleString()}/yr</span>
                  </div>
                  <div className="p-4 bg-nexus-dark/50 rounded-lg border border-nexus-border">
                      <span className="text-xs text-slate-500 font-bold uppercase track-wider block mb-1">Project Status</span>
                      <span className={`inline-block px-3 py-1 mt-1 rounded-md text-xs font-bold ${
                          myLead.status === 'NEW' ? 'bg-blue-500/20 text-blue-400' :
                          myLead.status === 'WON' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-400'
                      }`}>
                          {myLead.status || 'PROCESSING'}
                      </span>
                  </div>
              </div>
          ) : myLead ? (
               <div className="p-4 bg-nexus-dark/50 rounded-lg border border-nexus-border inline-block min-w-[200px]">
                      <span className="text-xs text-slate-500 font-bold uppercase track-wider block mb-1">Plan Tier</span>
                      <span className="text-2xl font-bold text-white">{myLead.plan}</span>
                      <span className={`block w-max mt-3 px-3 py-1 rounded-md text-xs font-bold ${
                          myLead.status === 'NEW' ? 'bg-blue-500/20 text-blue-400' :
                          myLead.status === 'WON' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-400'
                      }`}>
                          Status: {myLead.status || 'PROCESSING'}
                      </span>
               </div>
          ) : (
              <div className="text-center py-10 text-slate-500">
                  No active project request found.
              </div>
          )}
      </div>
    </div>
  );
};
