
import React, { useMemo } from 'react';
import { MOCK_TRANSACTIONS } from '../lib/mockData';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';

interface BillingProps {
    user: UserProfile;
}

export const Billing: React.FC<BillingProps> = ({ user }) => {

  const myTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => t.userId === user.uid);
  }, [user.uid]);

  return (
    <div className="space-y-8">
      <div>
           <h1 className="text-2xl font-bold text-white">Billing & Usage</h1>
           <p className="text-slate-400">Manage your subscription and view payment history.</p>
      </div>

      {/* Plan Card */}
      <div className="glass-panel p-8 rounded-2xl border border-nexus-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
                <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Current Plan</p>
                <h2 className="text-3xl font-bold text-white mb-2">Pro Business</h2>
                <p className="text-slate-400 max-w-md">Includes 10,000 execution tokens, priority support, and 30-day log retention.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
                <span className="text-3xl font-bold text-white">$49<span className="text-lg text-slate-500 font-normal">/mo</span></span>
                <button className="px-6 py-2 bg-white text-nexus-dark font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                    Manage Subscription <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Usage Bar */}
        <div className="mt-8 pt-6 border-t border-nexus-border">
             <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Token Usage</span>
                <span className="text-white font-bold">2,450 / 10,000</span>
             </div>
             <div className="w-full h-2 bg-nexus-dark rounded-full overflow-hidden border border-nexus-border">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[24.5%]"></div>
             </div>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Invoice History</h3>
        <div className="glass-panel rounded-xl border border-nexus-border overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-nexus-card border-b border-nexus-border text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Invoice ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Download</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                    {myTransactions.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found.</td></tr>
                    ) : (
                        myTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-nexus-card/30">
                                <td className="px-6 py-4 font-mono text-sm text-slate-300">{tx.id}</td>
                                <td className="px-6 py-4 text-slate-300">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-white font-bold">${tx.amount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-white transition-colors">
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
