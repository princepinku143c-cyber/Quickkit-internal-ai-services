
import React, { useEffect, useState } from 'react';
import { LeadSubmission, LeadStatus } from '../types';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Download, Trash2, Phone, Mail, Eye, X, DollarSign, MessageSquare, ShieldCheck, Clock, Sparkles } from 'lucide-react';

export const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadSubmission | null>(null);
  const [showReplyTemplate, setShowReplyTemplate] = useState(false);

  // Real-time Firebase sync
  useEffect(() => {
    // Try Firebase first
    if (Object.keys(db).length > 0) {
      const unsubscribe = onSnapshot(collection(db as any, 'leads'), (snapshot) => {
        const firebaseLeads = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id } as any));
        const merged = firebaseLeads.map((l: any) => ({ ...l, status: l.status || 'NEW' }));
        setLeads(merged);
      });
      return () => unsubscribe();
    }
  }, []);

  const updateStatus = async (id: string, newStatus: LeadStatus) => {
      const updated = leads.map(l => l.id === id ? { ...l, status: newStatus } : l);
      setLeads(updated);
      // Firebase sync
      const lead = leads.find(l => l.id === id) as any;
      if (lead?._docId && Object.keys(db).length > 0) {
        await updateDoc(doc(db as any, 'leads', lead._docId), { status: newStatus });
      }
  };

  const exportCSV = () => {
      const headers = ['Name','Phone','Email','Business Type','Plan','Setup Cost','Monthly','ROI','Status','Date'];
      const rows = leads.map(l => [
        l.name, l.phone, l.email, l.businessType, l.plan,
        l.aiQuote?.setupCost || '', l.aiQuote?.monthlyCost || '', l.aiQuote?.roiEstimate || '',
        l.status || 'NEW',
        new Date(l.submittedAt).toLocaleDateString()
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
  };

  const deleteLead = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Are you sure you want to delete this lead?')) {
        const lead = leads.find(l => l.id === id) as any;
        const updated = leads.filter(l => l.id !== id);
        setLeads(updated);
        if (selectedLead?.id === id) setSelectedLead(null);
        // Firebase sync
        if (lead?._docId && Object.keys(db).length > 0) {
          await deleteDoc(doc(db as any, 'leads', lead._docId));
        }
      }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  ).reverse();

  const getStatusColor = (status?: LeadStatus) => {
      switch(status) {
          case 'NEW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'CONTACTED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
          case 'NEGOTIATING': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          case 'WON': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
          case 'LOST': return 'bg-slate-700 text-slate-400 border-slate-600';
          default: return 'bg-slate-800 text-slate-400';
      }
  };

  return (
    <div className="space-y-6 relative h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-white">Lead Management</h1>
           <p className="text-slate-400">Track pipeline status and review AI Architect proposals.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search leads..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-orange-500 outline-none w-64"
                />
            </div>
            <button onClick={exportCSV} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
            </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
         <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold">Plan / Quote</th>
                        <th className="px-6 py-4 font-semibold">Business Info</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredLeads.map((lead) => (
                        <tr 
                            key={lead.id} 
                            onClick={() => setSelectedLead(lead)}
                            className={`transition-colors cursor-pointer group ${selectedLead?.id === lead.id ? 'bg-blue-900/10' : 'hover:bg-slate-800/30'}`}
                        >
                            <td className="px-6 py-4">
                                <select 
                                    value={lead.status || 'NEW'}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded border outline-none appearance-none cursor-pointer ${getStatusColor(lead.status)}`}
                                >
                                    <option value="NEW">NEW</option>
                                    <option value="CONTACTED">CONTACTED</option>
                                    <option value="NEGOTIATING">NEGOTIATING</option>
                                    <option value="WON">WON</option>
                                    <option value="LOST">LOST</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-white font-bold text-sm">{lead.name}</p>
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                        <Phone className="w-3 h-3" /> {lead.phone}
                                    </span>
                                    {lead.email && lead.email !== 'N/A' && (
                                        <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3" /> {lead.email}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {lead.aiQuote ? (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> ${lead.aiQuote.setupCost + lead.aiQuote.monthlyCost} Deal
                                        </span>
                                        <span className="text-[10px] text-slate-500">Setup: ${lead.aiQuote.setupCost} | Mo: ${lead.aiQuote.monthlyCost}</span>
                                    </div>
                                ) : (
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold border bg-slate-800 text-slate-300 border-slate-700`}>
                                        {lead.plan}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-300 block">{lead.businessType}</span>
                                {lead.notes && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                        <MessageSquare className="w-3 h-3" /> 
                                        {lead.notes.includes('ARCHITECT') ? 'Has Chat Log' : 'Has Notes'}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(lead.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedLead(lead)} className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => deleteLead(lead.id, e)} className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      {/* LEAD INSPECTOR MODAL */}
      {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
              
              {/* Drawer */}
              <div className="relative w-full max-w-2xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl animate-fade-in-right flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900">
                      <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              {selectedLead.name}
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(selectedLead.status)}`}>
                                  {selectedLead.status || 'NEW'}
                              </span>
                          </h2>
                          <p className="text-slate-400 text-sm mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Building2Icon className="w-3 h-3" /> {selectedLead.businessType}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(selectedLead.submittedAt).toLocaleString()}</span>
                          </p>
                      </div>
                      <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                      
                      {/* Financial Card */}
                      {selectedLead.aiQuote && (
                          <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 bg-blue-500/10 rounded-bl-xl border-l border-b border-blue-500/20">
                                  <DollarSign className="w-4 h-4 text-blue-400" />
                              </div>
                              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Architect Quote</h3>
                              <div className="flex gap-6">
                                  <div>
                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">One-time Setup</span>
                                      <span className="text-2xl font-bold text-white">${selectedLead.aiQuote.setupCost}</span>
                                  </div>
                                  <div className="w-px bg-slate-800"></div>
                                  <div>
                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Monthly Fee</span>
                                      <span className="text-2xl font-bold text-white">${selectedLead.aiQuote.monthlyCost}</span>
                                  </div>
                                  <div className="w-px bg-slate-800"></div>
                                  <div>
                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. ROI</span>
                                      <span className="text-2xl font-bold text-emerald-400">${selectedLead.aiQuote.roiEstimate.toLocaleString()}/yr</span>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Phone</span>
                              <div className="text-white flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-slate-400" /> {selectedLead.phone}
                              </div>
                          </div>
                          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Email</span>
                              <div className="text-white flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-slate-400" /> {selectedLead.email || 'N/A'}
                              </div>
                          </div>
                      </div>

                      {/* Chat History / Notes */}
                      <div>
                          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              {selectedLead.aiQuote ? 'Architect Chat History' : 'Client Requirements'}
                          </h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                              {selectedLead.notes ? (
                                  selectedLead.notes.split('\n').map((line, i) => {
                                      if (line.includes('CLIENT:')) {
                                          return <div key={i} className="mb-2 text-slate-300"><span className="text-cyan-400 font-bold">CLIENT:</span> {line.replace('CLIENT:', '')}</div>
                                      }
                                      if (line.includes('ARCHITECT:')) {
                                          return <div key={i} className="mb-4 pl-4 border-l-2 border-blue-500/30 text-blue-200"><span className="text-blue-400 font-bold">AI:</span> {line.replace('ARCHITECT:', '')}</div>
                                      }
                                      return <div key={i}>{line}</div>
                                  })
                              ) : "No notes provided."}
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                        <button 
                          onClick={() => { updateStatus(selectedLead.id, 'LOST'); setSelectedLead({...selectedLead, status: 'LOST'}); }}
                          className="px-4 py-2 bg-slate-800 hover:bg-red-900/20 text-red-400 text-sm font-bold rounded-lg border border-slate-700 hover:border-red-500/30 transition-colors">
                            Mark as Lost
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowReplyTemplate(true)}
                                className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-bold rounded-lg border border-blue-500/30 transition-colors flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> Generate Reply
                            </button>
                            <a href={`mailto:${selectedLead.email}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-700 transition-colors">
                                Send Email
                            </a>
                        </div>
                  </div>
              </div>

              {/* REPLY TEMPLATE MODAL */}
              {showReplyTemplate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowReplyTemplate(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-3xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-400" /> Sales Follow-up Template
                            </h3>
                            <button onClick={() => setShowReplyTemplate(false)} className="text-slate-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Professional Proposal Response:</p>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-sm text-slate-300 font-sans leading-relaxed select-all cursor-pointer group relative">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-[10px] px-2 py-1 rounded">Click to Copy</div>
                                <p>Subject: Architecture Proposal for {selectedLead.businessType} — QuickKit AI</p>
                                <br/>
                                <p>Hi {selectedLead.name},</p>
                                <br/>
                                <p>I've reviewed the AI Architect roadmap for your business. Based on your requirements, we can deploy the <strong> {selectedLead.aiQuote ? 'Custom Automation Stack' : selectedLead.plan}</strong> within 3-5 business days.</p>
                                <br/>
                                {selectedLead.aiQuote ? (
                                    <>
                                        <p>Your custom quote includes:</p>
                                        <p>• One-time implementation: ${selectedLead.aiQuote.setupCost}</p>
                                        <p>• Monthly maintenance: ${selectedLead.aiQuote.monthlyCost}</p>
                                        <p>• Estimated annual ROI: ${selectedLead.aiQuote.roiEstimate.toLocaleString()}</p>
                                        <br/>
                                    </>
                                ) : (
                                    <p>Your {selectedLead.plan} is ready for implementation at our standard rates.</p>
                                )}
                                <p>Would you like to hop on a quick 10-minute demo call tomorrow to finalize the deployment steps?</p>
                                <br/>
                                <p>Best regards,</p>
                                <p>QuickKit Sales Team</p>
                            </div>
                            <button 
                                onClick={() => {
                                    const text = `Subject: Architecture Proposal for ${selectedLead.businessType} — QuickKit AI\n\nHi ${selectedLead.name},\n\nI've reviewed the AI Architect roadmap for your business. Based on your requirements, we can deploy the ${selectedLead.aiQuote ? 'Custom Automation Stack' : selectedLead.plan} within 3-5 business days.\n\n${selectedLead.aiQuote ? `Your custom quote includes:\n• One-time implementation: $${selectedLead.aiQuote.setupCost}\n• Monthly maintenance: $${selectedLead.aiQuote.monthlyCost}\n• Estimated annual ROI: $${selectedLead.aiQuote.roiEstimate.toLocaleString()}\n\n` : ''}Would you like to hop on a quick 10-minute demo call tomorrow to finalize the deployment steps?\n\nBest regards,\nQuickKit Sales Team`;
                                    navigator.clipboard.writeText(text);
                                    alert('Template copied to clipboard!');
                                }}
                                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20"
                            >
                                Copy Template
                            </button>
                        </div>
                    </div>
                </div>
              )}
          </div>
      )}
      <style>{`
        @keyframes fadeInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in-right { animation: fadeInRight 0.3s ease-out; }
      `}</style>
    </div>
  );
};

const Building2Icon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);
