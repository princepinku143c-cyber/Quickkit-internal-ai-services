import React, { useEffect, useState } from 'react';
import { LeadSubmission } from '../types';

export const AdminPanel: React.FC = () => {
  const [leads, setLeads] = useState<LeadSubmission[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('leads');
    if (data) setLeads(JSON.parse(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pt-24 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard - Leads</h1>
        
        <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-700 text-slate-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No leads found yet.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                    <td className="px-6 py-4">{lead.phone}</td>
                    <td className="px-6 py-4">{lead.businessType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        lead.plan === 'Diamond' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {lead.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{new Date(lead.submittedAt).toLocaleString()}</td>
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