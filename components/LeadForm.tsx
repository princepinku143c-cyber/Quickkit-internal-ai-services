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
  const handleSubmit=async(e:React.FormEvent)=¶»§q«^