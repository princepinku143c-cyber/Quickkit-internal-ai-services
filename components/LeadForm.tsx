import React, { useState, useEffect } from 'react';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { X, CheckCircle, Loader2, Building2, User, FileText, Mail, Lock, ShieldCheck, ArrowLeft, Globe } from 'lucide-react';
import { PlanTier, Language, LeadSubmission, AIQuote } from '../types';
import { CONTACT_EMAIL } from '../constants';
import { TRANSLATIONS } from '../data/translations';
import { Logo } from './Logo';
import { apiCall } from '../lib/api';

// NEW: Advanced Phone Input
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Props {
  lang: Language;
  close: () => void;
  onBack?: () => void;
  onVerified?: (data: any) => void; // Callback for success redirection
  initialData: { bizType: string; plan: PlanTier };
  prefilledNotes?: string;
  aiFinancials?: AIQuote;
}

export const LeadForm: React.FC<Props> = ({ lang, close, onBack, onVerified, initialData, prefilledNotes = '', aiFinancials }) => {
  const t = TRANSLATIONS[lang].lead;
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: initialData.bizType || '', 
    notes: '',
    country: ''
  });

  useEffect(() => {
    if (prefilledNotes) {
        setFormData(prev => ({ ...prev, notes: prefilledNotes }));
    }
  }, [prefilledNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION
    if (formData.phone.length < 10) {
        alert("Please enter a valid phone number for operator verification.");
        return;
    }

    setIsSending(true);
    
    const newLead = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      businessName: formData.businessType,
      projectName: formData.businessType,
      requirement: formData.notes,
      price: aiFinancials ? (aiFinancials.setupCost + aiFinancials.monthlyCost) : 0,
      aiFinancials: aiFinancials,
      userId: auth.currentUser?.uid || null
    };

    try {
      // 1. Send to Backend API for Lead Processing & CRM Sync
      const result = await apiCall(`${window.location.origin}/api/system?action=lead`, newLead, { allowGuest: true });

      // 2. SUCCESS HANDLING
      setIsSending(false);
      setSubmitted(true);

      // 🚨 REDIRECT LOGIC
      if (aiFinancials && onVerified) {
          setTimeout(() => {
              onVerified(newLead); // Trigger the checkout step in parent
          }, 1500);
      } else {
          // Standard lead form: Redirect to dashboard after 2 seconds
          setTimeout(() => {
              close();
              if (auth.currentUser) {
                  window.location.href = '/dashboard';
              }
          }, 2000);
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      alert(err.message || "Something went wrong. Please try again.");
      setIsSending(false);
    }
  };

  const handleGoogleAutofill = async () => {
    try {
        const result = await signInWithPopup(auth as any, googleProvider as any);
        const user = result.user;
        setFormData(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));
        if (db) {
            await setDoc(doc(db as any, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'client',
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }
    } catch (e) {
        console.error("Google sync failed:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Navigation */}
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-20">
            {onBack ? (
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
            ) : <div className="w-9" />}
            
            <h3 className="text-sm font-black text-white uppercase tracking-widest text-center">Operator Verification</h3>
            
            <button onClick={close} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="text-center flex flex-col items-center">
              <Logo size={48} className="mb-6" />
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Identify <span className="text-blue-500">yourself</span></h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">We need to verify the operator before initializing neural builds.</p>
            </div>

            {/* AI BLUEPRINT SUMMARY (LOCKED) */}
            {aiFinancials && (
                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl relative">
                    <div className="absolute top-4 right-4"><Lock className="w-4 h-4 text-blue-500" /></div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4">Locked Blueprint</span>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Total Investment</p>
                            <p className="text-3xl font-black text-white tracking-tighter">${(aiFinancials.setupCost + aiFinancials.monthlyCost).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Est. Build: {aiFinancials.buildTime}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-5">
              {/* Google Fast Track */}
              <button 
                type="button" 
                onClick={handleGoogleAutofill}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
              >
                <Globe className="w-4 h-4" /> Sign In with Google
              </button>
              
              <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600"><span className="bg-slate-900 px-4">Direct Entry</span></div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Operator Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <input required placeholder="Your Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Enterprise Phone</label>
                    <PhoneInput
                      country={'us'}
                      value={formData.phone}
                      onChange={(phone, country: any) => setFormData({...formData, phone, country: country.countryCode})}
                      containerClass="phone-input-container"
                      inputClass="!w-full !h-14 !bg-slate-950 !border-slate-800 !rounded-2xl !text-white !font-bold !pl-14 !transition-all !focus:border-blue-500"
                      buttonClass="!bg-slate-950 !border-slate-800 !rounded-l-2xl !pl-2"
                      dropdownClass="!bg-slate-900 !text-white !border-slate-800"
                    />
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Work Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <input required type="email" placeholder="email@company.com" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Organization Type</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <input required placeholder="e.g. Finance, Healthcare, Real Estate" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Project Notes / Requirements</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                        <textarea 
                          placeholder="Tell us about your automation needs..." 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none" 
                          value={formData.notes} 
                          onChange={e => setFormData({...formData, notes: e.target.value})} 
                        />
                    </div>
                </div>
              </div>
            </div>

            <button 
                type="submit" 
                disabled={isSending}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Initialize"}
            </button>
            
            <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">Secure 256-bit Encrypted Transmission</p>
          </form>
        ) : (
          <div className="p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce border border-emerald-500/20">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Operator Verified</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {aiFinancials ? "Redirecting to Financial Settlement node..." : "Registration complete. A specialist will contact you."}
                </p>
            </div>
            {isSending && <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .phone-input-container .special-label { display: none; }
        .phone-input-container input:focus { border-color: #2563eb !important; background-color: #020617 !important; }
        .phone-input-container .selected-flag:hover, .phone-input-container .selected-flag:focus { background: #0f172a !important; }
      `}} />
    </div>
  );
};
