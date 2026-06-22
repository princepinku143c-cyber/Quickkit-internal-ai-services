import React from 'react';
import { UserProfile } from '../types';
import { BarChart3, TrendingUp, DollarSign, Target, Award, Sparkles } from 'lucide-react';
import { useIndustry } from '../lib/IndustryContext';

interface ReportsProps {
  user: UserProfile;
}

export const ReportsView: React.FC<ReportsProps> = ({ user }) => {
  const { industryType } = useIndustry();

  const getMetricLabel = () => {
    if (industryType === 'Real Estate') return { rev: 'Total Realized Commission', target: 'Property Closings Goal', size: 'Average Deal Size' };
    if (industryType === 'E-commerce') return { rev: 'Total E-commerce Sales', target: 'Order Conversions Goal', size: 'Average Order Value' };
    if (industryType === 'Healthcare') return { rev: 'Total Consultation Value', target: 'Patient Admissions Goal', size: 'Average Plan Cost' };
    if (industryType === 'Travel') return { rev: 'Total Tour Bookings Rev', target: 'Booked Tours Goal', size: 'Average Booking Size' };
    return { rev: 'Total Contract Value', target: 'Deal Conversions Goal', size: 'Average Contract Value' };
  };

  const labels = getMetricLabel();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Performance Analytics</h1>
          <p className="text-slate-400 text-sm font-medium">Analyze sales performance, closed-won metrics, and pipeline velocity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{labels.rev}</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase leading-none">$148,250</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% Month-over-Month
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{labels.target}</span>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase leading-none">82% Achieved</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Target: 50 deals (41 Won)</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{labels.size}</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase leading-none">$3,615</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Aggregated across all niches</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Box */}
      <div className="p-8 bg-slate-950 border border-slate-900 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Pipeline Distribution</h3>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Deal flow volume</h4>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-blue-500"><BarChart3 className="w-5 h-5" /></div>
        </div>

        <div className="space-y-6">
          {[
            { stage: 'Inbound Inquiries', count: 32, percentage: 100, color: 'bg-blue-500' },
            { stage: 'Contacted & Filtered', count: 24, percentage: 75, color: 'bg-indigo-500' },
            { stage: 'Meetings Scheduled', count: 18, percentage: 56, color: 'bg-purple-500' },
            { stage: 'Contracts / Offers Sent', count: 9, percentage: 28, color: 'bg-pink-500' },
            { stage: 'Won / Signed Contracts', count: 5, percentage: 15, color: 'bg-emerald-500' }
          ].map(row => (
            <div key={row.stage} className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span className="uppercase tracking-wide">{row.stage}</span>
                <span className="text-white">{row.count} Leads ({row.percentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
