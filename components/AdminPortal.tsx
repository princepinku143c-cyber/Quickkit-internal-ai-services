
import React, { useState, useEffect } from 'react';
import { UserProfile, LeadSubmission } from '../types';
import { AdminLayout } from './AdminLayout';
import { AdminLeads } from './AdminLeads';
import { Activity, DollarSign, Users, TrendingUp, Briefcase, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
      {activeTab === 'admin-projects' && <AdminProjectsView />}
      {activeTab === 'admin-payments' && <AdminPaymentsView />}
    </AdminLayout>
  );
};

// --- Dashboard Component ---
const AdminDashboardOverview: React.FC = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        totalRevenue: 0,
        activeProjects: 0,
        pendingPayments: 0
    });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);

    useEffect(() => {
        // Stats Logic
        const unsubLeads = onSnapshot(collection(db as any, 'leads'), (s) => setStats(p => ({...p, totalLeads: s.size})));
        const unsubProjects = onSnapshot(collection(db as any, 'projects'), (s) => setStats(p => ({...p, activeProjects: s.size})));
        
        // Revenue Statistics from Payments Collection
        const unsubPayments = onSnapshot(collection(db as any, 'payments'), (s) => {
            let total = 0;
            const payments: any[] = [];
            s.forEach(doc => {
                const data = doc.data();
                if (data.status === 'COMPLETED') total += Number(data.amount);
                payments.push({ id: doc.id, ...data });
            });
            setStats(p => ({...p, totalRevenue: total}));
            setRecentPayments(payments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5));
        });

        return () => { unsubLeads(); unsubProjects(); unsubPayments(); };
    }, []);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Command Center</h1>
                <p className="text-slate-400 font-medium">Monitoring global AI deployment velocity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users />} label="Lead Engine" value={stats.totalLeads} color="blue" />
                <StatCard icon={<DollarSign />} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="emerald" />
                <StatCard icon={<Briefcase />} label="Active Builds" value={stats.activeProjects} color="purple" />
                <StatCard icon={<Activity />} label="Health Score" value="98%" color="blue" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-400" /> Recent Transactions
                    </h3>
                    <div className="space-y-4">
                        {(Array.isArray(recentPayments) ? recentPayments : []).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                <div>
                                    <p className="font-bold text-white uppercase text-xs tracking-tighter">{p.projectName}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{p.userId?.slice(0, 8)}... | {new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="text-emerald-400 font-black tracking-tighter">+${p.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-slate-700 mb-4" />
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">System Load</h4>
                    <p className="text-xs text-slate-600 mt-2">AI Architect Cluster: OPTIMAL</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
        <div className={`p-2 bg-${color}-500/10 rounded-xl w-fit text-${color}-400 mb-4`}>{icon}</div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter mt-1">{value}</p>
    </div>
);

// --- Projects View ---
const AdminProjectsView: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db as any, 'projects'), (s) => {
            setProjects(s.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Builds</h2>
            <div className="grid grid-cols-1 gap-4">
                {(Array.isArray(projects) ? projects : []).map((p, i) => (
                    <div key={p.id || i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400"><Briefcase className="w-6 h-6" /></div>
                            <div>
                                <h4 className="font-black text-white uppercase tracking-tight text-lg">{p.projectName}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Client: {p.userId?.slice(0, 8)}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">{p.status}</span>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"><Activity className="w-4 h-4" /></button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Payments View ---
const AdminPaymentsView: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db as any, 'payments'), (s) => {
            setPayments(s.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Financial Ledger</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Project</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(payments) ? payments : []).map((p, i) => (
                            <tr key={i} className="border-b border-slate-800/50 text-xs">
                                <td className="px-6 py-4 font-mono text-slate-500">{p.id.slice(0, 8)}</td>
                                <td className="px-6 py-4 font-bold text-white uppercase">{p.projectName}</td>
                                <td className="px-6 py-4 font-black text-emerald-400 tracking-tighter">${p.amount}</td>
                                <td className="px-6 py-4 text-emerald-400 font-bold uppercase">{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
