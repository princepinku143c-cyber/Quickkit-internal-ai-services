
import React, { useState, useEffect } from 'react';
import { UserProfile, LeadSubmission } from '../types';
import { AdminLayout } from './AdminLayout';
import { AdminLeads } from './AdminLeads';
import { Activity, DollarSign, Users, TrendingUp } from 'lucide-react';

interface AdminPortalProps {
  user: UserProfile;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('admin-dashboard');

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={onLogout}
    >
      {activeTab === 'admin-dashboard' && <AdminDashboardOverview />}
      {activeTab === 'admin-leads' && <AdminLeads />}
      {activeTab === 'admin-reports' && (
          <div className="text-center py-20 text-slate-500">
              <p className="text-xl">Reports Module Coming Soon</p>
          </div>
      )}
      {activeTab === 'admin-settings' && (
          <div className="text-center py-20 text-slate-500">
              <p className="text-xl">Settings Module Coming Soon</p>
          </div>
      )}
    </AdminLayout>
  );
};

// --- Internal Sub-component for Dashboard Stats ---
const AdminDashboardOverview: React.FC = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        potentialMRR: 0,
        potentialSetup: 0,
        activeWorkflows: 854 // Mock for now
    });

    useEffect(() => {
        const data = localStorage.getItem('leads');
        if (data) {
            const leads: LeadSubmission[] = JSON.parse(data);
            const totalLeads = leads.length;
            
            // Calculate Pipeline Value
            let mrr = 0;
            let setup = 0;

            leads.forEach(l => {
                if (l.aiQuote) {
                    mrr += l.aiQuote.monthlyCost;
                    setup += l.aiQuote.setupCost;
                } else {
                    // Estimate for standard plans
                    if (l.plan.includes('Starter')) { mrr += 100; setup += 500; }
                    if (l.plan.includes('Pro')) { mrr += 150; setup += 1500; }
                    if (l.plan.includes('Business')) { mrr += 2000; }
                }
            });

            setStats({
                totalLeads,
                potentialMRR: mrr,
                potentialSetup: setup,
                activeWorkflows: 854
            });
        }
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Global Overview</h1>
                <p className="text-slate-400">Real-time pipeline analytics based on incoming leads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <Users className="w-4 h-4" /> Total Leads
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalLeads}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <DollarSign className="w-4 h-4" /> Potential MRR
                    </div>
                    <div className="text-3xl font-bold text-emerald-400">${stats.potentialMRR.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Recurring Monthly Revenue in Pipeline</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <DollarSign className="w-4 h-4" /> Pipeline Setup Value
                    </div>
                    <div className="text-3xl font-bold text-blue-400">${stats.potentialSetup.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">One-time Implementation Fees</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> Avg Deal Size
                    </div>
                    <div className="text-3xl font-bold text-purple-400">
                        ${stats.totalLeads > 0 ? Math.round((stats.potentialMRR + stats.potentialSetup) / stats.totalLeads).toLocaleString() : 0}
                    </div>
                </div>
            </div>

            {/* Placeholder Chart Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Activity className="w-10 h-10 text-slate-600" />
                    <p className="text-slate-500 font-medium">Live Activity Feed</p>
                    <p className="text-xs text-slate-600">Waiting for more data to visualize trends...</p>
                </div>
            </div>
        </div>
    );
};
