
import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, CheckCircle, Loader2, Building2, User, Phone, FileText, Mail, Lock, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { PlanTier, Language, LeadSubmission, AIQuote } from '../types';
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from '../constants';
import { TRANSLATIONS } from '../data/translations';

interface Props {
  lang: Language;
  close: () => void;
  onBack?: () => void; // Optional Back Navigation
  initialData: { bizType: string; plan: PlanTier };
  prefilledNotes?: string;
  aiFinancials?: AIQuote; // NEW: Read-only locked financial data
}

export const LeadForm: React.FC<Props> = ({ lang, close, onBack, initialData, prefilledNotes = '', aiFinancials }) => {
  const t = TRANSLATIONS[lang].lead;
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: initialData.bizType || '', 
    notes: ''
  });

  useEffect(() => {
    if (prefilledNotes) {
        setFormData(prev => ({ ...prev, notes: prefilledNotes }));
    }
  }, [prefilledNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    const newLead: LeadSubmission = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      businessType: formData.businessType,
      plan: initialData.plan,
      submittedAt: new Date().toISOString(),
      notes: formData.notes,
      aiQuote: aiFinancials // Attach the locked quote object securely
    };

    // Save locally
    const existing = JSON.parse(localStorage.getItem('leads') || '[]');
    localStorage.setItem('leads', JSON.stringify([...existing, newLead]));

    // Send to Firebase CRM
    try {
      if (Object.keys(db).length > 0) {
          await addDoc(collection(db as any, 'leads'), newLead);
          console.log("🔥 Blueprint safely stored in Firebase.");
      } else {
          console.warn("Firebase not configured. Storing locally for demo purposes.");
      }
    } catch (err) {
      console.error("Failed to save lead to Firebase", err);
    }

    setIsSending(false);
    setSubmitted(true);
  };

  const getEmailLink = () => {
    const subject = `AI Automation System Deployment - ${formData.businessType}`;
    let body = `Hello Architect,\n\nI want to initialize my automation deployment.\n\nPROJECT DETAILS:\n- Name: ${formData.name}\n- Industry: ${formData.businessType}\n- Phone: ${formData.phone}\n\n`;
    
    if (aiFinancials) {
        body += `LOCKED AI BLUEPRINT:\n- Setup Cost: $${aiFinancials.setupCost}\n- Monthly Maint: $${aiFinancials.monthlyCost}\n- Estimated ROI: $${aiFinancials.roiEstimate}/year\n\n`;
    }
    
    body += `ADDITIONAL NOTES:\n${formData.notes}\n\nSENT FROM AUTOFLOW GLOBAL AI ARCHITECT`;
    
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl relative shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Navigation Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
            {onBack ? (
                <button 
                  onClick={onBack} 
                  className="pointer-events-auto p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 shadow-lg"
                  title="Go Back to Architect"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
            ) : <div></div>}
            
            <button 
              onClick={close} 
              className="pointer-events-auto p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 mt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2">
                {aiFinancials ? "Deploy Architecture" : t.title}
              </h3>
              <p className="text-slate-400 text-sm">{aiFinancials ? "Confirm your details to initiate this build." : "Fill in your details to start the automation process."}</p>
              
              {!aiFinancials && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Selected Plan:</span>
                    <span className="text-cyan-400 text-sm font-bold">{initialData.plan}</span>
                </div>
              )}
            </div>

            {/* AI LOCKED QUOTE SECTION - READ ONLY */}
            {aiFinancials && (
                <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 bg-blue-500/10 rounded-bl-xl border-l border-b border-blue-500/20">
                        <Lock className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Official Quote
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">Setup Cost</span>
                            <span className="block text-xl font-bold text-white">${aiFinancials.setupCost.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">Monthly Maint.</span>
                            <span className="block text-xl font-bold text-white">${aiFinancials.monthlyCost.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                        <span>Est. Build: <span className="text-white font-mono">{aiFinancials.buildTime}</span></span>
                        <span className="text-emerald-400 font-bold">ROI: ${aiFinancials.roiEstimate.toLocaleString()}/yr</span>
                    </div>
                    {/* Visual indicator that this is locked */}
                    <div className="mt-3 text-[10px] text-center text-slate-600 font-mono border-t border-slate-800 pt-2">
                        QUOTATION ID: {Date.now().toString(36).toUpperCase()} • VERIFIED BY NEXUS AI
                    </div>
                </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="group">
                <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Direct Contact Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                    type="tel"
                    placeholder="e.g. +1 555-0123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
              </div>

              {/* Email (Optional but Professional) */}
              <div className="group">
                <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                    type="email"
                    placeholder="e.g. john@business.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
              </div>

              {/* Business Type (Editable) */}
              <div className="group">
                <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Industry / Business Type</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                    required
                    placeholder="e.g. Real Estate, Salon, Coaching..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                    value={formData.businessType}
                    onChange={e => setFormData({...formData, businessType: e.target.value})}
                    />
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="group">
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 uppercase font-bold tracking-wider">
                    <FileText className="w-3 h-3" /> {aiFinancials ? "Additional Instructions" : "Project Details / AI Plan"}
                </label>
                <textarea
                  placeholder={aiFinancials ? "Any specific requirements for this build?" : "Tell us what you want to automate..."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none h-40 resize-none font-sans text-sm placeholder:text-slate-600 custom-scrollbar"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            </div>
            
            <button 
                type="submit" 
                disabled={isSending}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 text-lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                aiFinancials ? "Confirm & Deploy" : t.cta
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-12 px-8">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">{t.success}</h3>
            <p className="text-slate-400 mb-8 text-lg">Your request has been sent to our team. We will analyze your needs and contact you shortly.</p>
            
            <a 
              href={getEmailLink()} 
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <Mail className="w-5 h-5" /> Direct Email to Architect
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
