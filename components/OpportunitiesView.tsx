import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { useIndustry } from '../lib/IndustryContext';
import { 
  Plus, Search, Filter, Mail, Phone, Building2, Calendar, 
  ChevronRight, ChevronLeft, Trash2, X, AlertCircle, CheckCircle2,
  Sparkles, Layers, Briefcase, User, DollarSign, MapPin, 
  ShoppingBag, ClipboardList, Info, FileText, Send, Bot, Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

// ==========================================
// 🏠 REAL ESTATE MAP WIDGET
// ==========================================
const PropertyMapWidget: React.FC<{ lead: any }> = ({ lead }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl relative overflow-hidden h-40 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-73.9852,40.7484,13.5,0/400x300?access_token=mock')` }}></div>
        <div className="relative text-center z-10 space-y-2">
          <MapPin className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
          <p className="text-xs font-bold text-white uppercase tracking-wider">Geolocation Coordinates</p>
          <p className="text-[10px] text-slate-500 font-mono">Lat: 40.7484 / Long: -73.9852 (Empire State)</p>
        </div>
      </div>
      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Booked Viewings</h4>
        <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs">
          <div>
            <p className="font-bold text-white uppercase">Broad Street Apt 25B</p>
            <p className="text-[10px] text-slate-500">June 24, 2026 at 02:00 PM</p>
          </div>
          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-black tracking-widest">Scheduled</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🛒 E-COMMERCE ORDER HISTORY WIDGET
// ==========================================
const OrderHistoryWidget: React.FC<{ lead: any }> = ({ lead }) => {
  const mockOrders = [
    { id: 'ORD-9821', date: 'June 20, 2026', total: 499, status: 'Shipped' },
    { id: 'ORD-4103', date: 'June 22, 2026', total: 299, status: 'Processing' }
  ];
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Customer Purchases Log</h4>
      <div className="space-y-3">
        {mockOrders.map(order => (
          <div key={order.id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex justify-between items-center hover:border-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400"><ShoppingBag className="w-4 h-4" /></div>
              <div>
                <p className="text-xs font-bold text-white font-mono">{order.id}</p>
                <p className="text-[9px] text-slate-500">{order.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-white">${order.total}</p>
              <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>{order.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 💼 DIGITAL AGENCY INVOICE GENERATOR
// ==========================================
const InvoiceGeneratorWidget: React.FC<{ lead: any }> = ({ lead }) => {
  const [hours, setHours] = useState('10');
  const [rate, setRate] = useState('75');
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const handleGenerate = () => {
    const total = Number(hours) * Number(rate);
    const mockUrl = `https://quickkitai.com/invoices/mock_${Math.floor(Math.random()*100000)}.pdf`;
    setInvoiceUrl(mockUrl);
  };

  return (
    <div className="space-y-4 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Invoice Generator Tunnel</h4>
      
      {invoiceUrl ? (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold text-white">Invoice Generated Successfully!</p>
          <a href={invoiceUrl} target="_blank" rel="noreferrer" className="inline-block text-[10px] font-black text-blue-400 uppercase tracking-widest underline">Download Invoice (PDF)</a>
          <button onClick={() => setInvoiceUrl(null)} className="block w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-400 tracking-wider">Create Another</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Hours Logged</label>
              <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-full bg-[#050810] border border-slate-800 rounded-lg py-2 px-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Rate ($ / hr)</label>
              <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-[#050810] border border-slate-800 rounded-lg py-2 px-3 text-xs text-white" />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-2">
            <span>Aggregated Total:</span>
            <span className="text-white text-sm">${(Number(hours) * Number(rate)).toLocaleString()}</span>
          </div>
          <button type="button" onClick={handleGenerate} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all mt-2">
            <Send className="w-3.5 h-3.5" /> Dispatch Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export const OpportunitiesView: React.FC<OpportunitiesProps> = ({ user }) => {
  const { industryType } = useIndustry();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals visibility State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [activeLeadTab, setActiveLeadTab] = useState<'info' | 'niche' | 'ai'>('info');
  const [proposalConfirmLead, setProposalConfirmLead] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Keep selectedLead updated with latest data from leads real-time listener
  useEffect(() => {
    if (selectedLead) {
      const latest = leads.find(l => l.id === selectedLead.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(selectedLead)) {
        setSelectedLead(latest);
      }
    }
  }, [leads, selectedLead]);

  // Lead Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  
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
    const lead = leads.find(l => l.id === leadId);

    try {
      const leadRef = doc(db as any, 'leads', leadId);
      await updateDoc(leadRef, { status: nextStage });
      
      // Update selected lead details status if currently open
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev: any) => prev ? { ...prev, status: nextStage } : null);
      }

      // Check if transitioned to Contract or Won to trigger invoice proposal
      if ((nextStage === 'CONTRACT' || nextStage === 'WON') && lead) {
        setProposalConfirmLead(lead);
      }
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
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(null);
      }
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

    // Bundle dynamic custom fields
    const custom_metadata = { ...customValues };

    // Format custom metadata string for standard Odoo description notes field
    const formattedMetadataStr = Object.entries(custom_metadata)
      .map(([key, val]) => {
        const schemaField = user.customFormSchema?.find(f => f.id === key);
        return `${schemaField?.label || key}: ${val}`;
      })
      .join('\n');

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
      custom_metadata,
      notes: `--- MULTI-TENANT CRM TAGS ---\nClient_ID: ${user.uid}\nNiche: ${industryType || 'Custom'}\n\nRequirements:\n${formRequirements}\n\n--- CUSTOM METADATA ---\n${formattedMetadataStr || 'None'}`
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
        custom_metadata: payload.custom_metadata,
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
      setCustomValues({});
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
                      <div 
                        key={lead.id} 
                        onClick={() => { setSelectedLead(lead); setActiveLeadTab('info'); }}
                        className="p-4 bg-slate-950/80 border border-[#1e293b]/50 rounded-2xl space-y-3 hover:border-blue-500/30 cursor-pointer transition-all group relative"
                      >
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-wide truncate group-hover:text-blue-400 transition-colors">{lead.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{lead.businessName || 'No Company'}</p>
                        </div>

                        {lead.requirement && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed bg-[#0f172a]/30 p-2 rounded-lg border border-[#1e293b]/30">
                            {lead.requirement}
                          </p>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-900/80 pt-3" onClick={e => e.stopPropagation()}>
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

      {/* Leads Scoping Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
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

              {/* DYNAMIC RENDER OF DOCK SCHEMAS */}
              {user?.customFormSchema && user.customFormSchema.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Custom Schema Attributes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.customFormSchema.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={customValues[field.id] || ''}
                            onChange={e => setCustomValues({ ...customValues, [field.id]: e.target.value })}
                            className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value="">Select Option</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={customValues[field.id] || ''}
                            onChange={e => setCustomValues({ ...customValues, [field.id]: e.target.value })}
                            placeholder={`Enter ${field.label}`}
                            className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lead Requirements / Notes</label>
                <textarea
                  value={formRequirements}
                  onChange={e => setFormRequirements(e.target.value)}
                  placeholder="Provide details about requirements..."
                  rows={3}
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                <ClipboardList className="w-3.5 h-3.5" /> Opportunity Scoping
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedLead.name}</h3>
              <p className="text-xs text-slate-500">{selectedLead.businessName || 'No Company Linked'}</p>
            </div>

            {/* Tab navigation */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 mb-6 gap-1">
              <button
                type="button"
                onClick={() => setActiveLeadTab('info')}
                className={`flex-1 px-3 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeLeadTab === 'info'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Base Info
              </button>
              <button
                type="button"
                onClick={() => setActiveLeadTab('niche')}
                className={`flex-1 px-3 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeLeadTab === 'niche'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> {industryType || 'Niche'} Actions
              </button>
              <button
                type="button"
                onClick={() => setActiveLeadTab('ai')}
                className={`flex-1 px-3 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeLeadTab === 'ai'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" /> AI Assistant
              </button>
            </div>

            {/* Content rendering */}
            {activeLeadTab === 'info' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-xs font-bold text-white truncate">{selectedLead.email || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-xs font-bold text-white truncate">{selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Budget Allocation</p>
                    <p className="text-sm font-black text-emerald-400 font-mono">${(selectedLead.budget || selectedLead.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Stage Status</p>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mt-0.5">{selectedLead.status}</p>
                  </div>
                </div>

                {/* Custom Form Metadata */}
                {selectedLead.custom_metadata && Object.keys(selectedLead.custom_metadata).length > 0 && (
                  <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-3">
                    <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Schema Metadata</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {Object.entries(selectedLead.custom_metadata).map(([key, val]) => {
                        const schemaField = user.customFormSchema?.find(f => f.id === key);
                        return (
                          <div key={key}>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">{schemaField?.label || key}</p>
                            <p className="text-xs font-bold text-white mt-0.5">{String(val)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedLead.requirement && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Scoping Notes</p>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{selectedLead.requirement}</p>
                  </div>
                )}
              </div>
            ) : activeLeadTab === 'niche' ? (
              /* Niche Specific lazy load modules */
              <div className="space-y-4">
                {industryType === 'Real Estate' && <PropertyMapWidget lead={selectedLead} />}
                {industryType === 'E-commerce' && <OrderHistoryWidget lead={selectedLead} />}
                {industryType === 'Agency' && <InvoiceGeneratorWidget lead={selectedLead} />}
                {!['Real Estate', 'E-commerce', 'Agency'].includes(industryType || '') && (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-900 rounded-2xl">
                    No custom niche actions configured for {industryType || 'Custom'} workspace.
                  </div>
                )}
              </div>
            ) : (
              /* AI Assistant tab content */
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-purple-500/20 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">AI Welcome Draft</h4>
                      <p className="text-[10px] text-slate-500">Automatically drafted welcome message for this lead.</p>
                    </div>
                  </div>

                  {selectedLead.aiDraftReply ? (
                    <div className="space-y-4">
                      <textarea
                        value={selectedLead.aiDraftReply}
                        readOnly
                        className="w-full h-32 bg-[#050810] border border-purple-500/30 focus:border-purple-500 outline-none rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-mono shadow-[0_0_15px_rgba(168,85,247,0.05)] resize-none"
                      />
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedLead.aiDraftReply);
                            alert("📋 Draft copied to clipboard!");
                          }}
                          className="flex-1 py-3 bg-[#0B1120] hover:bg-slate-900 border border-[#1e293b] hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                        >
                          Copy Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            alert("🚀 Email dispatched successfully via mock sender!");
                          }}
                          className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/15 flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Send via Email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                      <span>Drafting welcome email proposal...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom stage actions and deletion */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-900/80 mt-8">
              <button
                type="button"
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="py-2.5 px-4 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Opportunity
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {proposalConfirmLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-center">
            <div className="mb-4 text-center flex justify-center">
              <div className="p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Deal Closed! Send Payment Proposal / Invoice?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Would you like to automatically dispatch a payment proposal and invoice to <strong>{proposalConfirmLead.name}</strong> for <strong>${(proposalConfirmLead.budget || proposalConfirmLead.price || 0).toLocaleString()}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProposalConfirmLead(null)}
                className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
              >
                No, Skip
              </button>
              <button
                type="button"
                onClick={async () => {
                  const lead = proposalConfirmLead;
                  setProposalConfirmLead(null);
                  try {
                    const res = await fetch('/api/send-proposal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: lead.email,
                        name: lead.name,
                        price: lead.budget || lead.price || 0,
                        features: [lead.projectName || 'CRM System Implementation', 'AI Auto-Responder Integration', 'Odoo Sync Connection']
                      })
                    });
                    if (res.ok) {
                      setToast("Invoice Sent Successfully!");
                      setTimeout(() => setToast(null), 3000);
                    } else {
                      console.error("Failed to send proposal");
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
              >
                Yes, Send
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
