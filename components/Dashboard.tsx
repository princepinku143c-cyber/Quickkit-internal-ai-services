import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, Target, DollarSign, TrendingUp, Sparkles, 
  Layers, ChevronRight, Activity, Calendar, Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useIndustry } from '../lib/IndustryContext';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { industryType } = useIndustry();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setLoading(false);
      return;
    }

    const qLeads = query(collection(db as any, 'leads'), where('userId', '==', user.uid));
    const unSubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      setLoading(false);
    }, (err) => {
      console.error("Dashboard leads sync error:", err);
      setLoading(false);
    });

    return () => unSubLeads();
  }, [user.uid]);

  // CRM Analytics Calculations
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const dealsWon = leads.filter(l => (l.status || '').toUpperCase() === 'WON').length;
    const pipelineValue = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
    const conversionRate = totalLeads ? Math.round((dealsWon / totalLeads) * 100) : 0;

    return {
      totalLeads,
      dealsWon,
      pipelineValue,
      conversionRate
    };
  }, [leads]);

  // Stage details for distribution charts
  const stagesDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      MEETING: 0,
      NEGOTIATION: 0,
      CONTRACT: 0,
      WON: 0,
      LOST: 0
    };

    leads.forEach(l => {
      let status = (l.status || 'NEW').toUpperCase();
      if (status === 'MEETING_SCHEDULED' || status === 'VIEWING') status = 'MEETING';
      if (status === 'NEGOTIATING') status = 'NEGOTIATION';
      if (distribution[status] !== undefined) {
        distribution[status]++;
      }
    });

    return distribution;
  }, [leads]);

  // Recent leads activity feed
  const recentActivity = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 text-sm font-mono animate-pulse">Initializing CRM Analytics Node...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden p-10 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-amber-400" /> Premium CRM Node
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Welcome Back,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
              {user.displayName?.split(' ')[0] || 'Operator'}
            </span>
          </h1>
          <p className="text-blue-100/60 text-sm md:text-base max-w-xl">
            Your workspace is active. Configured for the <strong className="text-white">{industryType || 'Custom'}</strong> industry, monitoring live pipeline analytics.
          </p>
        </div>
      </div>

      {/* 2. Top Row KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Leads */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Leads</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white leading-none">{stats.totalLeads}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Synced opportunities</p>
          </div>
        </div>

        {/* KPI: Deals Won */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deals Won</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white leading-none">{stats.dealsWon}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Closed-won contracts</p>
          </div>
        </div>

        {/* KPI: Pipeline Value */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline Value</span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white leading-none">${stats.pipelineValue.toLocaleString()}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Cumulative budget value</p>
          </div>
        </div>

        {/* KPI: Conversion Rate */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversion Rate</span>
            <TrendingUp className="w-5 h-5 text-pink-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white leading-none">{stats.conversionRate}%</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Win probability score</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Recent Activity & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Overview Chart Stage Distribution */}
        <div className="lg:col-span-2 bg-[#050810] border border-slate-900 p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Stage Distribution</h3>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Active Funnel Density</h4>
          </div>

          <div className="space-y-4">
            {[
              { stage: 'New Opportunities', count: stagesDistribution.NEW, color: 'bg-blue-500' },
              { stage: 'Contacted / Nurtured', count: stagesDistribution.CONTACTED, color: 'bg-cyan-500' },
              { stage: 'Meeting / Viewing Scheduled', count: stagesDistribution.MEETING, color: 'bg-purple-500' },
              { stage: 'In Proposal Negotiation', count: stagesDistribution.NEGOTIATION, color: 'bg-pink-500' },
              { stage: 'Under Contract', count: stagesDistribution.CONTRACT, color: 'bg-amber-500' },
              { stage: 'Won Closings', count: stagesDistribution.WON, color: 'bg-emerald-500' }
            ].map(row => {
              const percentage = stats.totalLeads ? Math.round((row.count / stats.totalLeads) * 100) : 0;
              return (
                <div key={row.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">{row.stage}</span>
                    <span className="text-white text-[11px]">{row.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Recent Activity Feed */}
        <div className="lg:col-span-1 bg-[#050810] border border-slate-900 p-8 rounded-[2rem] space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Audit Stream</h3>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Recent Opportunities</h4>
          </div>

          <div className="flex-1 space-y-4 my-6">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                <Activity className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No recent operations logs.</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-3 bg-slate-950/50 border border-slate-900 rounded-xl hover:border-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white uppercase truncate">{activity.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{activity.businessName || 'No Company'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400">${(activity.budget || 0).toLocaleString()}</p>
                    <p className="text-[8px] text-slate-600 font-mono mt-0.5">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] pt-4 border-t border-slate-900/50">
            Real-time pipeline monitoring
          </div>
        </div>
      </div>
    </div>
  );
};
