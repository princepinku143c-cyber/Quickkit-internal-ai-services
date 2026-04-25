
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Loader2, DollarSign, Wallet, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BillingProps {
    user: UserProfile;
}

export const Billing: React.FC<BillingProps> = ({ user }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setLoading(false);
      return;
    }

    const q = query(collection(db as any, 'payments'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPayments(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const usagePercent = Math.min(100, (user.credits / 1000) * 100);

  return (
    <div className="space-y-10 py-6">
      <div className="flex justify-between items-end">
           <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Financial Ledger</h1>
              <p className="text-slate-400 font-medium">Monitoring your engineering credits and transaction history.</p>
           </div>
           <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Status</span>
              <span className="text-white font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Good Standing</span>
           </div>
      </div>

      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0B1120] border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 group-hover:scale-175 transition-transform"><Wallet className="w-24 h-24" /></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Neural Credits Remaining</p>
              <div className="flex items-end gap-3 mb-6">
                  <h2 className="text-6xl font-black text-white tracking-tighter">{user.credits.toLocaleString()}</h2>
                  <span className="text-sm text-slate-500 font-bold uppercase mb-2">Available Tokens</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: `${usagePercent}%` }}></div>
              </div>
          </div>
          
          <div className="bg-emerald-600 p-8 rounded-[2rem] flex flex-col justify-between text-white shadow-xl shadow-emerald-950/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Tier Status</p>
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Industrial Partner</h3>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Reload Credits</button>
          </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" /> Transaction Logs
        </h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hash ID</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Project Mapping</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount (USD)</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center">
                                 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                                 <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Synchronizing Financial Records...</p>
                            </td></tr>
                        ) : (Array.isArray(payments) ? payments : []).length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">No transaction history detected.</td></tr>
                        ) : (
                            (Array.isArray(payments) ? payments : []).map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-8 py-6 font-mono text-xs text-slate-500 group-hover:text-slate-300">0x{p.id.slice(0, 12).toUpperCase()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-white font-black uppercase tracking-tight text-xs">{p.projectName || 'AI DEPLOYMENT'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">TX: {new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-xl font-black text-white tracking-tighter">${Number(p.amount).toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
