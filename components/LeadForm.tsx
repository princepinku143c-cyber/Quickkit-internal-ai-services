import React, { useState, useEffect } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { X, CheckCircle, Loader2, Building2, User, FileText, Mail, Lock, ArrowLeft, Globe, Briefcase, ShieldCheck } from 'lucide-react';
import { PlanTier, Language, AIQuote } from '../types';
import { CONTACT_EMAIL, RAJA_COMMERCIAL_OFFER } from '../constants';
import { Logo } from './Logo';
import { apiCall } from '../lib/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Props { lang: Language; close: () => void; onBack?: () => void; onVerified?: (data:any)=>void; initialData:{bizType:string;plan:PlanTier}; prefilledNotes?:string; aiFinancials?:AIQuote; }

export const LeadForm: React.FC<Props> = ({ close, onBack, onVerified, initialData, prefilledNotes = '', aiFinancials }) => {
  const [submitted,setSubmitted]=useState(false); const [isSending,setIsSending]=useState(false);
  const [formData,setFormData]=useState({name:'',phone:'',email:'',businessName:'',businessType:initialData.bizType||'',notes:'',country:'IN'});
  useEffect(()=>{ if(prefilledNotes) setFormData(prev=>({...prev,notes:prefilledNotes})); if(auth.currentUser){const u=auth.currentUser;setFormData(prev=>({...prev,name:prev.name||u.displayName||'',email:prev.email||u.email||''}));}},[prefilledNotes]);
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!formData.name.trim()) return alert('Please enter your full name.');
    if(formData.phone.length<10) return alert('Please enter a valid phone number.');
    if(!formData.email.trim()) return alert('Please enter your work email.');
    if(!formData.businessName.trim()) return alert('Please enter your business name.');
    if(!formData.businessType.trim()) return alert('Please enter your business type.');
    setIsSending(true);
    const newLead={name:formData.name.trim(),phone:formData.phone,email:formData.email.trim(),businessName:formData.businessName.trim(),businessType:formData.businessType.trim(),projectName:'Raja AI Systems — 5-Agent Workforce',plan:'Dussehra 50% Pilot',requirement:formData.notes.trim(),price:RAJA_COMMERCIAL_OFFER.festiveSetupINR,maintenance:RAJA_COMMERCIAL_OFFER.festiveMonthlyINR,regularPrice:{setup:RAJA_COMMERCIAL_OFFER.regularSetupINR,monthly:RAJA_COMMERCIAL_OFFER.regularMonthlyINR},aiFinancials,userId:auth.currentUser?.uid||null,source:'raja-ai-systems-dussehra-offer',submittedAt:new Date().toISOString()};
    try{await apiCall(`${window.location.origin}/api/lead-submit`,newLead,{allowGuest:true});setSubmitted(true);setIsSending(false);if(aiFinancials&&onVerified)setTimeout(()=>onVerified(newLead),900);else setTimeout(()=>close(),2200);}catch(err:any){console.error('Submission error:',err);alert(err?.message||`Unable to submit right now. Please email ${CONTACT_EMAIL}.`);setIsSending(false);}
  };
  const handleGoogleAutofill=async()=>{try{const result=await signInWithPopup(auth as any,googleProvider as any);const u=result.user;setFormData(prev=>({...prev,name:u.displayName||'',email:u.email||''}));if(db)await setDoc(doc(db as any,'users',u.uid),{uid:u.uid,email:u.email,displayName:u.displayName,role:'client',updatedAt:new Date().toISOString()},{merge:true});}catch(e){console.error('Google sync failed:',e);}};
  const quoteSetup=aiFinancials?.setupCost||RAJA_COMMERCIAL_OFFER.festiveSetupINR;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl relative shadow-[0_0_60px_rgba(0,0,0,.55)] animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
    <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-20">{onBack?<button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400" aria-label="Go back"><ArrowLeft className="w-5 h-5"/></button>:<div className="w-9"/>}<h3 className="text-sm font-black text-white uppercase tracking-widest">Request Your Pilot</h3><button onClick={close} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></button></div>
    {!submitted?<form onSubmit={handleSubmit} className="p-8 space-y-7">
      <div className="text-center"><Logo size={48} className="mx-auto mb-5"/><h2 className="text-3xl font-black text-white tracking-tighter">Claim the <span className="text-amber-300">Dussehra pilot</span></h2><p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">3 pilot slots · 50% lifetime lock*</p></div>
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><div className="flex items-end justify-between gap-4"><div><div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Regular setup</div><div className="text-sm text-slate-600 line-through">₹{RAJA_COMMERCIAL_OFFER.regularSetupINR.toLocaleString('en-IN')}</div></div><div className="text-right"><div className="text-[9px] font-mono uppercase tracking-widest text-amber-300">Today</div><div className="text-3xl font-black text-white">₹{quoteSetup.toLocaleString('en-IN')}</div></div></div><div className="mt-3 text-xs text-slate-400">Monthly management: <strong className="text-white">₹{RAJA_COMMERCIAL_OFFER.festiveMonthlyINR.toLocaleString('en-IN')}</strong> from Day 30 under the pilot agreement.</div></div>
      <div className="space-y-4">
        {!auth.currentUser&&<><button type="button" onClick={handleGoogleAutofill} className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"><Globe className="w-4 h-4"/> Continue with Google</button><div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"/></div><div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600"><span className="bg-slate-900 px-4">Or enter manually</span></div></div></>}
        {[
          ['Full Name',User,'Your Full Name','name','text'],
          ['Work Email',Mail,'email@company.com','email','email'],
          ['Business Name',Briefcase,'e.g. ABC Realty','businessName','text'],
          ['Business Type / Industry',Building2,'e.g. Luxury Real Estate or Aesthetic Clinic','businessType','text'],
        ].map(([label,Icon,placeholder,key,type])=><div key={String(key)}><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">{String(label)}</label><div className="relative">{React.createElement(Icon as React.ElementType,{className:'absolute left-4 top-4 w-4 h-4 text-slate-600'})}<input required type={String(type)} placeholder={String(placeholder)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500" value={(formData as any)[String(key)]} onChange={e=>setFormData({...formData,[String(key)]:e.target.value})}/></div></div>)}
        <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Phone / WhatsApp</label><PhoneInput country="in" value={formData.phone} onChange={(phone)=>setFormData({...formData,phone})} containerClass="phone-input-container" inputClass="!w-full !h-14 !bg-slate-950 !border-slate-800 !rounded-2xl !text-white !font-bold !pl-14" buttonClass="!bg-slate-950 !border-slate-800 !rounded-l-2xl !pl-2" dropdownClass="!bg-slate-900 !text-white !border-slate-800"/></div>
        <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">What should the AI workforce handle?</label><textarea placeholder="Tell us about lead volume, WhatsApp, follow-up, site visits, dormant leads, CRM or reputation workflows." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white font-bold outline-none focus:border-blue-500 min-h-[120px] resize-none" value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})}/></div>
      </div>
      <button type="submit" disabled={isSending} className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-[.18em] hover:bg-slate-100 disabled:opacity-50">{isSending?<Loader2 className="w-5 h-5 animate-spin mx-auto"/>:'Request My Pilot Slot'}</button>
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest"><ShieldCheck className="w-3.5 h-3.5"/> SLA and commercial terms are provided in the signed agreement.</div>
    </form>:<div className="p-12 text-center space-y-7"><div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-400/20"><CheckCircle className="w-12 h-12"/></div><h3 className="text-3xl font-black text-white tracking-tighter uppercase">Pilot Request Received</h3><p className="text-slate-500 text-sm leading-relaxed">Our team will confirm the scope, qualifying conditions and SLA before deployment.</p></div>}
  </div></div>;
};