import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useIndustry } from '../lib/IndustryContext';
import { 
  Plus, Search, Filter, Mail, Phone, Building2, Calendar, 
  ChevronRight, ChevronLeft, Trash2, X, AlertCircle, CheckCircle2,
  Sparkles, Layers, Briefcase, User, DollarSign
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/api';

interface OpportunitiesProps {
  user: UserProfile;
}

// Stage configuration mapping keys to default labels
const STAGES = [
  { key: 'NEW', defaultLabel: 'New Lead', color: 'border-blue-500 text-blue-400 bg-blue-500/5' },
  { key: 'CONTACTED', defaultLabel: 'Contacted', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/5' },
  { key: 'MEETING', defaultLabel: 'Viewing/Meeting', color: 'border-purple-500 text-purple-400 bg-purple-500/5' },
  { key: 'NEGOTIATION', defaultLabel: 'Negotiation', color: 'border-pink-500 text-pink-400 bg-pink-500/5' },
  { key: 'CONTRACT', defaultLabel: 'Contract', color: 'border-amber-500 text-amber-400 bg-amber-500/5' },
  { key: 'WON', defaultLabel: 'Won', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/5' },
  { key: 'LOST', defaultLabel: 'Lost', color: 'border-red-500 text-red-400 bg-red-500/5' }
];

// Vocabulary mapper for industry specific column headers
const VOCABULARY: Record<string, Record<string, string>> = {
  'Real Estate': {
    NEW: 'New Property Inquiry',
    CONTACTED: 'Agent Assigned',
    MEETING: 'Viewing Scheduled',
    NEGOTIATION: 'Offer Received',
    CONTRACT: 'Under Contract',
    WON: 'Sold / Closed',
    LOST: 'Archived Inquiry'
  },
  'E-commerce': {
    NEW: 'Cart Abandoned',
    CONTACTED: 'Follow-up Sent',
    MEETING: 'Browsing Products',
    NEGOTIATION: 'Discount Offered',
    CONTRACT: 'Checkout Initiated',
    WON: 'Order Placed',
    LOST: 'Dropped / Inactive'
  },
  'Agency': {
    NEW: 'Inbound Pitch',
    CONTACTED: 'Intro Call Done',
    MEETING: 'Proposal Sent',
    NEGOTIATION: 'Contract Negotiation',
    CONTRACT: 'Retainer Deposit Paid',
    WON: 'Client Onboarded',
    LOST: 'Closed Lost'
  },
  'Travel': {
    NEW: 'Tour Inquiry',
    CONTACTED: 'Itinerary Drafted',
    MEETING: 'Consultation Call',
    NEGOTIATION: 'Price Adjustment',
    CONTRACT: 'Deposit Form Submitted',
    WON: 'Trip Booked',
    LOST: 'Inquiry Cancelled'
  },
  'Healthcare': {
    NEW: 'Patient Inquiry',
    CONTACTED: 'Triage / Screened',
    MEETING: 'Doctor Consult',
    NEGOTIATION: 'Treatment Quoted',
    CONTRACT: 'Insurance Pre-auth',
    WON: 'Check-in Mapped',
    LOST: 'Dismissed'
  }
};

export const OpportunitiesView: React.FC<OpportunitiesProps> = ({ user }) => {
  const { industryType } = useIndustry();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Lead Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Sync leads from Firestore in real-time
  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setLoading(false);
      return;
    }

    const q = query(collection(db as any, 'leads'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore leads sync error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Translate Stage Name based on selected industry
  const getStageLabel = (stageKey: string, defaultLabel: string) => {
    if (industryType && VOCABULARY[industryType] && VOCABULARY[industryType][stageKey]) {
      return VOCABULARY[industryType][stageKey];
    }
    return defaultLabel;
  };

  // Move lead card to another stage
  const moveLead = async (leadId: string, currentStage: string, direction: 'left' | 'right') => {
    const stageIdx = STAGES.findIndex(s => s.key === currentStage);
    if (stageIdx === -1) return;
    
    let nextIdx = stageIdx + (direction === 'right' ? 1 : -1);
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;

    const nextStage = STAGES[nextIdx].key;
    try {
      const leadRef = doc(db as any, 'leads', leadId);
      await updateDoc(leadRef, { status: nextStage });
    } catch (e) {
      console.error("Failed to transition lead status:", e);
    }
  };

  // Delete lead card
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      const leadRef = doc(db as any, 'leads', leadId);
      await deleteDoc(leadRef);
    } catch (e) {
      console.error(e);
    }
  };

  // Form submission handler to sync lead with Odoo JSON-RPC bridge
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'Name and Email are required fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    // Multi-tenant safe tag injection
    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      businessName: formCompany.trim() || 'Unknown Company',
      projectName: `${industryType || 'General'} Opportunity`,
      price: Number(formBudget) || 0,
      budget: Number(formBudget) || 0,
      requirement: formRequirements.trim(),
      userId: user.uid, // client_id
      niche_type: industryType || 'Custom',
      notes: `--- MULTI-TENANT CRM TAGS ---\nClient_ID: ${user.uid}\nNiche: ${industryType || 'Custom'}\n\nRequirements:\n${formRequirements}`
    };

    try {
      // 1. Post to Odoo bridge system.js backend
      const response = await apiCall('/api/system?action=lead', payload);

      // 2. Optimistic local state update
      const newLeadObj = {
        id: response.projectId || Math.random().toString(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        businessName: payload.businessName,
        budget: payload.budget,
        price: payload.price,
        requirement: payload.requirement,
        userId: user.uid,
        status: 'NEW',
        createdAt: new Date().toISOString()
      };
      setLeads(prev => [newLeadObj, ...prev]);

      // 3. Clear state and close modal
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormCompany('');
      setFormBudget('');
      setFormRequirements('');
      setShowAddModal(false);
      alert("✅ Opportunity successfully synced to Odoo CRM!");
    } catch (err: any) {
      console.error("Sync error:", err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit lead to CRM node.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Upper info section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-purple-400" /> Active Industry: {industryType || 'Custom'}
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Opportunities Pipeline</h1>
          <p className="text-slate-400 text-sm font-medium">Track your deals from inbound inquiries to contract closure.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Lead
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500 text-sm font-mono animate-pulse">Loading Opportunities CRM Node...</div>
        </div>
      ) : (
        /* Horizontal Kanban Columns Container */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent min-h-[600px]">
          {STAGES.map((stage) => {
            // Filter leads for this stage
            const stageLeads = leads.filter(l => {
              const leadStatus = (l.status || 'NEW').toUpperCase();
              const currentKey = stage.key.toUpperCase();
              
              // Handle mapping differences
              if (currentKey === 'NEW' && leadStatus === 'NEW') return true;
              if (currentKey === 'CONTACTED' && leadStatus === 'CONTACTED') return true;
              if (currentKey === 'MEETING' && (leadStatus === 'MEETING' || leadStatus === 'MEETING_SCHEDULED' || leadStatus === 'VIEWING')) return true;
              if (currentKey === 'NEGOTIATION' && (leadStatus === 'NEGOTIATING' || leadStatus === 'NEGOTIATION')) return true;
              if (currentKey === 'CONTRACT' && leadStatus === 'CONTRACT') return true;
              if (currentKey === 'WON' && leadStatus === 'WON') return true;
              if (currentKey === 'LOST' && leadStatus === 'LOST') return true;
              
              return false;
            });

            const columnLabel = getStageLabel(stage.key, stage.defaultLabel);

            return (
              <div key={stage.key} className="w-80 shrink-0 flex flex-col bg-[#0b0f19] border border-[#1e293b]/70 rounded-3xl p-4">
                {/* Column Header */}
                <div className={`p-3 rounded-2xl border ${stage.color} mb-4 flex justify-between items-center`}>
                  <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[80%]">{columnLabel}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">{stageLeads.length}</span>
                </div>

                {/* Column Content */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] no-scrollbar">
                  {stageLeads.length === 0 ? (
                    <div className="h-24 border border-dashed border-[#1e293b]/50 rounded-2xl flex items-center justify-center text-slate-700 text-[10px] uppercase font-bold tracking-widest">
                      Empty Stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div key={lead.id} className="p-4 bg-slate-950/80 border border-[#1e293b]/50 rounded-2xl space-y-3 hover:border-blue-500/30 transition-all group relative">
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-wide truncate">{lead.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{lead.businessName || 'No Company'}</p>
                        </div>

                        {lead.requirement && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed bg-[#0f172a]/30 p-2 rounded-lg border border-[#1e293b]/30">
                            {lead.requirement}
                          </p>
                        )}

                        <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                          {lead.email && <span className="truncate">✉ {lead.email}</span>}
                          {lead.phone && <span className="truncate">☎ {lead.phone}</span>}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-900/80 pt-3">
                          <div>
                            <p className="text-xs font-black text-emerald-400 font-mono">${(lead.budget || lead.price || 0).toLocaleString()}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-500/60 hover:text-red-500 transition-colors p-1 mr-2"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {stage.key !== 'NEW' && (
                              <button
                                onClick={() => moveLead(lead.id, stage.key, 'left')}
                                className="p-1 rounded bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white transition-colors"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                            {stage.key !== 'LOST' && (
                              <button
                                onClick={() => moveLead(lead.id, stage.key, 'right')}
                                className="p-1 rounded bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white transition-colors"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                <Layers className="w-3 h-3" /> Odoo Multi-Tenant Tunnel
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Sync New Lead</h3>
              <p className="text-xs text-slate-500">Inject opportunity records directly into the master CRM database.</p>
            </div>

            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Contact Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                  />
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Contact Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                    />
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Contact Phone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                    />
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formCompany}
                      onChange={e => setFormCompany(e.target.value)}
                      placeholder="e.g. Acme Realty"
                      className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                    />
                    <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Deal Budget ($)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formBudget}
                      onChange={e => setFormBudget(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                    />
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lead Requirements / Notes</label>
                <textarea
                  value={formRequirements}
                  onChange={e => setFormRequirements(e.target.value)}
                  placeholder="Provide details about requirements, property details, budget constraints, or timeline..."
                  rows={4}
                  className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {statusMsg && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                  statusMsg.type === 'success' 
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-600/10 border-red-500/20 text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                >
                  {isSubmitting ? 'Syncing to Odoo...' : 'Sync Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
