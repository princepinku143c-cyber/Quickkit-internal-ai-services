
import React, { useState, useEffect } from 'react';
import { UserProfile, LeadSubmission } from '../types';
import { AdminLayout } from './AdminLayout';
import { AdminLeads } from './AdminLeads';
import { AdminOutreach } from './AdminOutreach';
import { Activity, DollarSign, Users, TrendingUp, Briefcase, CreditCard, Clock, CheckCircle, Fingerprint, Loader2, Copy, Send, ChevronRight, Plus, Zap } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/api';
import { useLocation } from 'react-router-dom';

interface AdminPortalProps {
  user: UserProfile;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'admin-dashboard';

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
      {activeTab === 'admin-users' && <AdminUsersView />}
      {activeTab === 'admin-promos' && <AdminPromosView />}
      {activeTab === 'admin-requests' && <AdminRequestsView />}
      {activeTab === 'admin-outreach' && <AdminOutreach />}
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
        const unsubLeads = onSnapshot(collection(db as any, 'leads'), (s) => setStats(p => ({...p, totalLeads: s.size})));
        const unsubProjects = onSnapshot(collection(db as any, 'projects'), (s) => {
            let active = 0;
            let pending = 0;
            s.forEach(doc => {
                const data = doc.data();
                if (['accepted', 'in_progress', 'demo'].includes(data.status)) active++;
                if (data.status === 'quoted') pending++;
            });
            setStats(p => ({...p, activeProjects: active, pendingPayments: pending}));
        });
        
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
                <StatCard icon={<CreditCard />} label="Pending Quotes" value={stats.pendingPayments} color="orange" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-400" /> Recent Transactions
                    </h3>
                    <div className="space-y-4">
                        {recentPayments.map((p, i) => (
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

                <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-slate-700 mb-4" />
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">System Load</h4>
                    <p className="text-xs text-slate-600 mt-2">AI Architect Cluster: OPTIMAL</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="glass-card p-8 rounded-[2rem]">
        <div className={`p-2 bg-${color}-500/10 rounded-xl w-fit text-${color}-400 mb-4`}>{icon}</div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter mt-1">{value}</p>
    </div>
);

// --- Projects View ---
const AdminProjectsView: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db as any, 'projects'), (s) => {
            setProjects(s.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    const sendQuote = async (p: any, quoteData: any) => {
        setUpdatingId(p.id);
        try {
            await apiCall('/api/system?action=project-quote', {
                projectId: p.id,
                clientEmail: p.userEmail,
                projectName: p.projectName,
                quote: quoteData
            });
            alert("🚀 Quote Dispatched to Client.");
        } catch (e: any) { alert(e.message); }
        finally { setUpdatingId(null); }
    };

    const updateProgress = async (p: any, progress: number, message: string) => {
        setUpdatingId(p.id);
        try {
            await apiCall('/api/system?action=project-update', {
                projectId: p.id,
                clientEmail: p.userEmail,
                projectName: p.projectName,
                progress,
                message
            });
            alert("✅ Progress Synchronized.");
        } catch (e: any) { alert(e.message); }
        finally { setUpdatingId(null); }
    };

    const setStatus = async (p: any, status: string) => {
        setUpdatingId(p.id);
        try {
            await apiCall('/api/system?action=project-status', {
                projectId: p.id,
                status
            });
        } catch (e: any) { alert(e.message); }
        finally { setUpdatingId(null); }
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Build Queue</h2>
            <div className="grid grid-cols-1 gap-8">
                {projects.map((p) => (
                    <div key={p.id} className="p-8 glass-card rounded-[2.5rem] relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20"><Briefcase className="w-8 h-8" /></div>
                                <div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">{p.projectName}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Client: {p.userEmail} | Status: <span className="text-blue-400">{p.status}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-800/50 pt-8">
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Financial Prototyping</h5>
                                {p.status === 'inquiry' ? (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const fd = new FormData(e.currentTarget);
                                        sendQuote(p, { price: fd.get('price'), timeline: fd.get('timeline'), notes: fd.get('notes') });
                                    }} className="space-y-4 bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input name="price" required type="number" placeholder="Price ($)" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                                            <input name="timeline" required placeholder="Timeline (e.g. 7 Days)" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                                        </div>
                                        <textarea name="notes" placeholder="Service notes..." className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white min-h-[80px] outline-none" />
                                        <button disabled={updatingId === p.id} className="w-full py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                                            {updatingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Dispatch Proposal</>}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                                        <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Active Proposal</p>
                                        <p className="text-xl font-black text-white">${p.quote?.price || '0'} <span className="text-xs text-slate-500 font-normal">| {p.quote?.timeline || 'TBD'}</span></p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Build Progress</h5>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-blue-500">{p.progress || 0}%</p>
                                    </div>
                                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${p.progress || 0}%` }} />
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const fd = new FormData(e.currentTarget);
                                        updateProgress(p, Number(fd.get('progress')), fd.get('message') as string);
                                    }} className="flex gap-2">
                                        <input name="progress" type="number" defaultValue={p.progress || 0} className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none" />
                                        <input name="message" required placeholder="Update message..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none" />
                                        <button disabled={updatingId === p.id} className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                                            {updatingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-wrap gap-3">
                            {['accepted', 'in_progress', 'demo', 'active'].map((s) => (
                                <button 
                                    key={s}
                                    onClick={() => setStatus(p, s)}
                                    disabled={updatingId === p.id || p.status === s}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.status === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
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
        return onSnapshot(collection(db as any, 'payments'), (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Financial Ledger</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-500 uppercase font-black">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Project</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p, i) => (
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

// --- Users View ---
const AdminUsersView: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    useEffect(() => {
        return onSnapshot(collection(db as any, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    const addCredits = async (userId: string) => {
        const amount = prompt("Enter credit amount to add:");
        if (!amount || isNaN(Number(amount))) return;
        try {
            await apiCall('/api/system?action=add-credits', { targetUserId: userId, amount: Number(amount) });
            alert("✅ Credits added.");
        } catch (err: any) { alert(err.message); }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Client Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                    <div key={u.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-black text-white text-xl">{u.displayName?.[0]}</div>
                            <div>
                                <p className="font-black text-white uppercase tracking-tight">{u.displayName}</p>
                                <p className="text-[10px] text-slate-500 font-bold">{u.email}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Credits</p>
                                <p className="text-xl font-black text-white">{(u.credits || 0).toLocaleString()}</p>
                            </div>
                            <button onClick={() => addCredits(u.id)} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Promo Manager View ---
const AdminPromosView: React.FC = () => {
    const [promos, setPromos] = useState<any[]>([]);
    const [newCode, setNewCode] = useState({ code: '', amount: 100, maxUses: 10 });

    useEffect(() => {
        return onSnapshot(collection(db as any, 'promo_codes'), (s) => setPromos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    const createPromo = async () => {
        if (!newCode.code) return;
        await setDoc(doc(db as any, 'promo_codes', newCode.code.toUpperCase()), {
            code: newCode.code.toUpperCase(),
            amount: Number(newCode.amount),
            maxUses: Number(newCode.maxUses),
            usedBy: [],
            createdAt: new Date().toISOString()
        });
        setNewCode({ code: '', amount: 100, maxUses: 10 });
        alert("✅ Promo Code Generated.");
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Promo Manager</h2>
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">New Code</label>
                    <input value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" placeholder="E.G. LAUNCH50" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Credits</label>
                    <input type="number" value={newCode.amount} onChange={e => setNewCode({...newCode, amount: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Max Uses</label>
                    <input type="number" value={newCode.maxUses} onChange={e => setNewCode({...newCode, maxUses: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                </div>
                <button onClick={createPromo} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-xl transition-all uppercase text-[10px] tracking-widest">Create Code</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.map(p => (
                    <div key={p.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xl font-black text-white font-mono">{p.code}</p>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{p.amount} Credits</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-black uppercase">Uses</p>
                                <p className="text-sm font-black text-white">{p.usedBy?.length || 0} / {p.maxUses}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Credit Requests View ---
const AdminRequestsView: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    useEffect(() => {
        return onSnapshot(collection(db as any, 'payment_requests'), (s) => setRequests(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    const approveRequest = async (req: any) => {
        if (!confirm(`Approve $${req.price} request for ${req.displayName}?`)) return;
        try {
            await apiCall('/api/system?action=add-credits', { targetUserId: req.userId, amount: req.credits });
            await updateDoc(doc(db as any, 'payment_requests', req.id), { status: 'approved', approvedAt: new Date().toISOString() });
            alert("✅ Request Approved.");
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Credit Node Requests</h2>
            <div className="space-y-4">
                {requests.filter(r => r.status === 'pending').map(r => (
                    <div key={r.id} className="p-8 bg-slate-900/40 border border-blue-500/20 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400"><Zap className="w-8 h-8" /></div>
                            <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">{r.displayName}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{r.userEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Requested Load</p>
                                <p className="text-2xl font-black text-white">${r.price} <span className="text-sm text-blue-500">({r.credits} Credits)</span></p>
                            </div>
                            <button onClick={() => approveRequest(r)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">Approve Node</button>
                        </div>
                    </div>
                ))}
                {requests.filter(r => r.status === 'pending').length === 0 && (
                    <div className="py-20 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-[2rem]">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">No Pending Node Requests Detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};
