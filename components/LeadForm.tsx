import React, { useState, useEffect } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { X, CheckCircle, Loader2, Building2, User, FileText, Mail, Lock, ArrowLeft, Globe, Briefcase } from 'lucide-react';
import { PlanTier, Language, AIQuote } from '../types';
import { CONTACT_EMAIL } from '../constants';
import { Logo } from './Logo';
import { apiCall } from '../lib/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Props {
  lang: Language;
  close: () => void;
  onBack?: () => void;
  onVerified?: (data: any) => void;
  initialData: { bizType: string; plan: PlanTier };
  prefilledNotes?: string;
  aiFinancials?: AIQuote;
}

const PLAN_META: Record<PlanTier, { label: string; setup: number; maintenance: number }> = {
  [PlanTier.STARTER]: { label: 'KVM 4', setup: 19999, maintenance: 15000 },
  [PlanTier.PRO]: { label: 'KVM 8', setup: 39999, maintenance: 30000 },
  [PlanTier.BUSINESS]: { label: 'Custom Managed System', setup: 0, maintenance: 0 },
};

export const LeadForm: React.FC<Props> = ({ close, onBack, onVerified, initialData, prefilledNotes = '', aiFinancials }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    businessType: initialData.bizType || '',
    notes: '',
    country: 'IN',
  });

  const selectedPlan = PLAN_META[initialData.plan] || PLAN_META[PlanTier.STARTER];

  useEffect(() => {
    if (prefilledNotes) setFormData(prev => ({ ...prev, notes: prefilledNotes }));
    if (auth.currentUser) {
      const user = auth.currentUser;
      setFormData(prev => ({ ...prev, name: prev.name || user.displayName || '', email: prev.email || user.email || '' }));
    }
  }, [prefilledNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('Please enter your full name.'); return; }
    if (formData.phone.length < 10) { alert('Please enter a valid phone number.'); return; }
    if (!formData.email.trim()) { alert('Please enter your work email.'); return; }
    if (!formData.businessName.trim()) { alert('Please enter your business name.'); return; }
    if (!formData.businessType.trim()) { alert('Please enter your business type.'); return; }

    setIsSending(true);
    const newLead = {
      name: formData.name.trim(),
      phone: formData.phone,
      email: formData.email.trim(),
      businessName: formData.businessName.trim(),
      businessType: formData.businessType.trim(),
      projectName: selectedPlan.label,
      plan: selectedPlan.label,
      requirement: formData.notes.trim(),
      price: aiFinancials?.setupCost || selectedPlan.setup,
      maintenance: selectedPlan.maintenance,
      aiFinancials,
      userId: auth.currentUser?.uid || null,
      source: 'website-pricing',
      submittedAt: new Date().toISOString(),
    };

    try {
      await apiCall(`${window.location.origin}/api/lead-submit`, newLead, { allowGuest: true });
      setSubmitted(true);
      setIsSending(false);
      if (aiFinancials && onVerified) setTimeout(() => onVerified(newLead), 900);
      else setTimeout(() => close(), 2200);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(err?.message || `Unable to submit right now. Please email ${CONTACT_EMAIL}.`);
      setIsSending(false);
    }
  };

  const handleGoogleAutofill = async () => {
    try {
      const result = await signInWithPopup(auth as any, googleProvider as any);
      const user = result.user;
      setFormData(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));
      if (db) await setDoc(doc(db as any, 'users', user.uid), { uid: user.uid, email: user.email, displayName: user.displayName, role: 'client', updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.error('Google sync failed:', e); }
  };

  const quoteSetup = aiFinancials?.setupCost || selectedPlan.setup;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-20">
          {onBack ? <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" aria-label="Go back"><ArrowLeft className="w-5 h-5" /></button> : <div className="w-9" />}
          <h3 className="text-sm font-black text-white uppercase tracking-widest text-center">Business Details</h3>
          <button onClick={close} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="text-center flex flex-col items-center">
              <Logo size={48} className="mb-6" />
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Let’s start with <span className="text-blue-500">your business</span></h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">We’ll send your details to our team and confirm the request by email.</p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-[10px] uppercase tracking-widest text-blue-300 font-black">Selected plan</p><p className="text-xl text-white font-black mt-1">{selectedPlan.label}</p></div>
                <div className="text-right"><p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Setup</p><p className="text-xl text-white font-black">₹{quoteSetup.toLocaleString('en-IN')}</p></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Month 1 managed operation is included. From month 2: ₹{selectedPlan.maintenance.toLocaleString('en-IN')}/month. AI/API usage is separate.</p>
            </div>

            <div className="space-y-5">
              {!auth.currentUser && <>
                <button type="button" onClick={handleGoogleAutofill} className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"><Globe className="w-4 h-4" /> Continue with Google</button>
                <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div><div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600"><span className="bg-slate-900 px-4">Or enter manually</span></div></div>
              </>}

              <div className="space-y-4">
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label><div className="relative"><User className="absolute left-4 top-4 w-4 h-4 text-slate-600"/><input required placeholder="Your Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})}/></div></div>
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Phone / WhatsApp</label><PhoneInput country="in" value={formData.phone} onChange={(phone,country:any)=>setFormData({...formData,phone,country:country.countryCode})} containerClass="phone-input-container" inputClass="!w-full !h-14 !bg-slate-950 !border-slate-800 !rounded-2xl !text-white !font-bold !pl-14" buttonClass="!bg-slate-950 !border-slate-800 !rounded-l-2xl !pl-2" dropdownClass="!bg-slate-900 !text-white !border-slate-800" /></div>
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Work Email</label><div className="relative"><Mail className="absolute left-4 top-4 w-4 h-4 text-slate-600"/><input required type="email" placeholder="email@company.com" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.email} onChange={e => setFormData({...formData,email:e.target.value})}/></div></div>
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Business Name</label><div className="relative"><Briefcase className="absolute left-4 top-4 w-4 h-4 text-slate-600"/><input required placeholder="e.g. ABC Realty" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.businessName} onChange={e => setFormData({...formData,businessName:e.target.value})}/></div></div>
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Business Type / Industry</label><div className="relative"><Building2 className="absolute left-4 top-4 w-4 h-4 text-slate-600"/><input required placeholder="e.g. Real Estate, Clinic, Education" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formData.businessType} onChange={e => setFormData({...formData,businessType:e.target.value})}/></div></div>
                <div className="group"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">What should the AI system handle?</label><div className="relative"><FileText className="absolute left-4 top-4 w-4 h-4 text-slate-600"/><textarea placeholder="Tell us about repetitive work, sales, support, CRM, WhatsApp, voice or other workflows." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none" value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})}/></div></div>
              </div>
            </div>

            <button type="submit" disabled={isSending} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Send Request to QuickKit AI'}
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest"><Lock className="w-3.5 h-3.5"/> Your details are used only for this business request.</div>
          </form>
        ) : (
          <div className="p-12 text-center space-y-8"><div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce border border-emerald-500/20"><CheckCircle className="w-12 h-12"/></div><div><h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Request Received</h3><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">We’ve sent the request to our team. A confirmation has been sent to your email, and we’ll contact you on WhatsApp/phone.</p></div></div>
        )}
      </div>
    </div>
  );
};
