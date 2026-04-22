
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { apiCall } from '../lib/api';

interface BillingProps {
    user: UserProfile;
}

export const Billing: React.FC<BillingProps> = ({ user }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
        try {
            const data = await apiCall('/api/billing');
            setInvoices(data || []);
        } catch (e) {
            console.error('Failed to fetch invoices:', e);
        } finally {
            setLoading(false);
        }
    };
    fetchInvoices();
  }, []);

  const tokenLimit = 10000;
  const currentUsage = Math.min(tokenLimit, 10000 - user.credits);
  const usagePercent = (currentUsage / tokenLimit) * 100;

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
                <span className="text-white font-bold">{currentUsage.toLocaleString()} / {tokenLimit.toLocaleString()}</span>
             </div>
             <div className="w-full h-2 bg-nexus-dark rounded-full overflow-hidden border border-nexus-border">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" 
                    style={{ width: `${usagePercent}%` }}
                ></div>
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
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                             <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                             Fetching payment history...
                        </td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found.</td></tr>
                    ) : (
                        invoices.map((tx) => (
                            <tr key={tx.id} className="hover:bg-nexus-card/30">
                                <td className="px-6 py-4 font-mono text-sm text-slate-300">{tx.id}</td>
                                <td className="px-6 py-4 text-slate-300">
                                    {tx.date ? (typeof tx.date === 'string' ? tx.date : new Date(tx.date.seconds * 1000).toLocaleDateString()) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-white font-bold">${(tx.amount || 0).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">
                                        {tx.status || 'PAID'}
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
