import React, { useEffect, useState } from 'react';
import { OutreachLead } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, PlusCircle, Globe, Mail, Phone, Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, Send, Trash2, Eye, X } from 'lucide-react';

export const AdminOutreach: React.FC = () => {
  const [leads, setLeads] = useState<OutreachLead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<OutreachLead | null>(null);

  // New Lead Form State
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Abroad'); // India or Abroad
  const [nicheNotes, setNicheNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync outreach leads in real-time
  useEffect(() => {
    if (Object.keys(db).length > 0) {
      const unsubscribe = onSnapshot(collection(db as any, 'leads_outreach'), (snapshot) => {
        const firebaseLeads = (snapshot.docs || []).map(d => ({
          ...d.data(),
          id: d.id,
          _docId: d.id
        } as any));
        setLeads(firebaseLeads);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !email) {
      alert("Business Name and Email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create a lead in Firestore under ANALYZING status
      const tempLead = {
        businessName,
        websiteUrl,
        email,
        phone,
        location,
        isIndia: location.toLowerCase() === 'india',
        niche: 'Pending AI Scan...',
        introSentence: '',
        painPoints: [],
        pricing: {
          currency: location.toLowerCase() === 'india' ? '₹' : '$',
          currencyCode: location.toLowerCase() === 'india' ? 'INR' : 'USD',
          starter: { price: '...', setup: '...' },
          growth: { price: '...', setup: '...' },
          business: { price: '...', setup: '...' },
          enterprise: { price: '...', setup: '...' }
        },
        status: 'ANALYZING',
        createdAt: new Date().toISOString()
      };

      // 2. Call the serverless function to perform analysis
      const response = await fetch('/api/outreach?action=analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          websiteUrl,
          email,
          phone,
          location,
          nicheNotes
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to analyze lead");
      }

      const result = await response.json();
      
      // Reset form
      setBusinessName('');
      setWebsiteUrl('');
      setEmail('');
      setPhone('');
      setLocation('Abroad');
      setNicheNotes('');
      setShowAddModal(false);
      
      alert("✅ AI Analysis Initiated! Draft sent to Telegram Bot.");
    } catch (e: any) {
      console.error(e);
      alert(`Error starting campaign: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAndSend = async (lead: OutreachLead) => {
    if (!confirm(`Confirm dispatch of cold email proposal to ${lead.businessName}?`)) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/outreach?action=approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to dispatch email");
      }

      alert("🚀 Cold email successfully sent!");
      setSelectedLead(null);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDraft = async (lead: OutreachLead) => {
    if (!confirm(`Are you sure you want to reject/skip the outreach draft for ${lead.businessName}?`)) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/outreach?action=reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to reject lead");
      }

      alert("❌ Outreach draft rejected & archived.");
      setSelectedLead(null);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReanalyze = async (lead: OutreachLead) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/outreach?action=analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: lead.businessName,
          websiteUrl: lead.websiteUrl,
          email: lead.email,
          phone: lead.phone,
          location: lead.location,
          nicheNotes: "Force AI re-analysis"
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to re-analyze");
      }

      alert("🔄 AI Re-Analysis triggered successfully!");
      setSelectedLead(null);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.businessName.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.niche.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  const getStatusBadge = (status: OutreachLead['status'] | 'ANALYZING') => {
    switch (status) {
      case 'SENT':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> SENT</span>;
      case 'REJECTED':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> REJECTED</span>;
      case 'PENDING_APPROVAL':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse"><AlertCircle className="w-3.5 h-3.5" /> APPROVAL NEEDED</span>;
      case 'ANALYZING':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> SCANNING...</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 relative h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚡ AI Cold Outreach Engine
          </h1>
          <p className="text-slate-400">Launch hyper-personalized AI sales campaigns verified by your Telegram Bot.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
          >
            <PlusCircle className="w-4 h-4" /> Add Prospect
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Prospect</th>
                <th className="px-6 py-4 font-semibold">Campaign Status</th>
                <th className="px-6 py-4 font-semibold">Target Niche</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No outreach campaigns launched yet. Click "Add Prospect" to start!
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className={`transition-colors cursor-pointer group ${selectedLead?.id === lead.id ? 'bg-blue-900/10' : 'hover:bg-slate-800/30'}`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{lead.businessName}</p>
                      {lead.websiteUrl && (
                        <a 
                          href={lead.websiteUrl.startsWith('http') ? lead.websiteUrl : `https://${lead.websiteUrl}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()} 
                          className="text-xs text-blue-400 flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Globe className="w-3 h-3" /> {lead.websiteUrl}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {lead.niche}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-semibold">
                      {lead.location}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedLead(lead)} 
                          className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROSPECT DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          
          <div className="relative w-full max-w-3xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedLead.businessName}
                  {getStatusBadge(selectedLead.status)}
                </h2>
                <div className="flex gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedLead.email}</span>
                  {selectedLead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedLead.phone}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedLead.location}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Dynamic Analysis Card */}
              {selectedLead.painPoints.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                    🎯 Dynamic AI Analysis & Pain Points
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedLead.painPoints.map((pt, i) => (
                      <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </div>
                          <h4 className="text-sm font-bold text-white">{pt.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          <strong className="text-red-400">Before AI:</strong> {pt.before}
                        </p>
                        <p className="text-xs text-slate-400">
                          <strong className="text-emerald-400">After AI:</strong> {pt.after}
                        </p>
                        <div className="inline-block px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded text-[10px] font-bold">
                          {pt.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  💰 Pitch Pricing Summary ({selectedLead.pricing.currencyCode})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold block">Starter</span>
                    <span className="text-sm font-bold text-white">{selectedLead.pricing.starter.price} /mo</span>
                    <span className="text-[9px] text-slate-400 block">+ {selectedLead.pricing.starter.setup} Setup</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold block">Growth</span>
                    <span className="text-sm font-bold text-white">{selectedLead.pricing.growth.price} /mo</span>
                    <span className="text-[9px] text-slate-400 block">+ {selectedLead.pricing.growth.setup} Setup</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold block">Business</span>
                    <span className="text-sm font-bold text-white">{selectedLead.pricing.business.price} /mo</span>
                    <span className="text-[9px] text-slate-400 block">+ {selectedLead.pricing.business.setup} Setup</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold block">Enterprise</span>
                    <span className="text-sm font-bold text-white">{selectedLead.pricing.enterprise.price}</span>
                  </div>
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  📧 Cold Email Draft Preview
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                  <p className="text-blue-400 font-bold">Subject: Exclusive Growth Offer: QuickKit AI Partnership for {selectedLead.businessName}</p>
                  <hr className="border-slate-800 my-2" />
                  <p><strong>Intro Hook:</strong> {selectedLead.introSentence}</p>
                  <p className="mt-2 text-slate-400">
                    {selectedLead.isIndia 
                      ? "Yeh AI ka Zamana Hai. Jo aaj AI pe switch karta hai — woh kal market leader hota hai... (Indian Hinglish Template)" 
                      : "The future of business is no longer manual. Modern companies are switching to AI-powered automation... (Abroad English Template)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
              <button 
                onClick={() => handleReanalyze(selectedLead)}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} /> Recalculate AI
              </button>

              <div className="flex gap-3">
                {selectedLead.status === 'PENDING_APPROVAL' && (
                  <>
                    <button 
                      onClick={() => handleRejectDraft(selectedLead)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-950 hover:bg-red-900/60 text-red-400 text-sm font-bold rounded-lg border border-red-900/50 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Reject Draft
                    </button>
                    <button 
                      onClick={() => handleApproveAndSend(selectedLead)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/20"
                    >
                      <Send className="w-4 h-4" /> Approve & Dispatch
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROSPECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" /> Add Prospect Lead
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProspect} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Business Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                    placeholder="e.g. Travel Express"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Website URL</label>
                  <input 
                    type="text" 
                    value={websiteUrl} 
                    onChange={e => setWebsiteUrl(e.target.value)} 
                    placeholder="e.g. travelexpress.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Target Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="e.g. contact@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Target Phone</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="e.g. +91 99999 88888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Target Location</label>
                <select 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Abroad">Abroad / International (USD - 10% Discount)</option>
                  <option value="India">India (INR - Standard Pricing)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Niche Description & Notes</label>
                <textarea 
                  value={nicheNotes} 
                  onChange={e => setNicheNotes(e.target.value)} 
                  placeholder="Describe details like specific services, cities targeted, or notes for the AI..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Launch Campaign & Scan Niche'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
