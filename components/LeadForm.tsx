import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, Building2, User, Mail, ArrowLeft, Briefcase, ShieldCheck, MessageCircle } from 'lucide-react';
import { PlanTier, Language, AIQuote } from '../types';
import { CONTACT_EMAIL, RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL } from '../constants';
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
    country: 'IN'
  });

  useEffect(() => {
    if (prefilledNotes) setFormData(prev => ({ ...prev, notes: prefilledNotes }));
  }, [prefilledNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter your full name.');
    if (formData.phone.length < 10) return alert('Please enter a valid phone number.');
    if (!formData.email.trim()) return alert('Please enter your work email.');
    if (!formData.businessName.trim()) return alert('Please enter your business name.');
    if (!formData.businessType.trim()) return alert('Please enter your business type.');

    setIsSending(true);

    // Format all user biodata for direct WhatsApp receipt
    const waLines = [
      `*🚀 New Client Request — Raja AI Systems / QuickKitAI*`,
      ``,
      `👤 *Name:* ${formData.name.trim()}`,
      `📞 *Phone / WhatsApp:* +${formData.phone.replace(/^\+/, '')}`,
      `📧 *Work Email:* ${formData.email.trim()}`,
      `🏢 *Business Name:* ${formData.businessName.trim()}`,
      `🏷️ *Industry:* ${formData.businessType.trim()}`,
      `💼 *Requested Scope:* ${initialData.bizType || 'AEO / SEO & AI Growth Engine'}`,
      `📝 *Requirements / Notes:* ${formData.notes.trim() || 'Interested in AI Technical Foundation & Pilot Offer'}`,
      ``,
      `_Submitted via quickkitai.com Lead Portal_`
    ];

    const waText = waLines.join('\n');
    const whatsappUrl = `${WHATSAPP_DIRECT_URL}?text=${encodeURIComponent(waText)}`;

    const newLead = {
      name: formData.name.trim(),
      phone: formData.phone,
      email: formData.email.trim(),
      businessName: formData.businessName.trim(),
      businessType: formData.businessType.trim(),
      projectName: 'Raja AI Systems — Client Request',
      plan: 'AEO / SEO & AI Pilot',
      requirement: formData.notes.trim(),
      price: RAJA_COMMERCIAL_OFFER.festiveSetupINR,
      maintenance: RAJA_COMMERCIAL_OFFER.festiveMonthlyINR,
      regularPrice: { setup: RAJA_COMMERCIAL_OFFER.regularSetupINR, monthly: RAJA_COMMERCIAL_OFFER.regularMonthlyINR },
      aiFinancials,
      source: 'whatsapp-direct-lead-form',
      submittedAt: new Date().toISOString()
    };

    // Background logging to database without blocking WhatsApp redirect
    try {
      apiCall(`${window.location.origin}/api/lead-submit`, newLead, { allowGuest: true }).catch(() => {});
    } catch (_) {}

    // Open WhatsApp directly with all biodata
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    setIsSending(false);

    if (aiFinancials && onVerified) {
      setTimeout(() => onVerified(newLead), 1500);
    } else {
      setTimeout(() => close(), 3000);
    }
  };

  const quoteSetup = aiFinancials?.setupCost || RAJA_COMMERCIAL_OFFER.festiveSetupINR;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl relative shadow-[0_0_60px_rgba(0,0,0,.55)] animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-20">
          {onBack ? (
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400" aria-label="Go back">
              <ArrowLeft className="w-5 h-5"/>
            </button>
          ) : <div className="w-9"/>}
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Connect on WhatsApp</h3>
          <button onClick={close} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white" aria-label="Close">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-7">
            <div className="text-center">
              <Logo size={48} className="mx-auto mb-5"/>
              <h2 className="text-3xl font-black text-white tracking-tighter">
                Claim the <span className="text-amber-300">Pilot Offer</span>
              </h2>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Direct WhatsApp submission · Zero upfront risk · Pay after live result
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <div className="flex items-center gap-2.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400"/> Zero-Risk Pilot Onboarding
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Fill details below and tap <strong className="text-white">Continue with WhatsApp</strong>. Your requirements will be directly delivered to our WhatsApp desk for instant discussion.
              </p>
            </div>

            <div className="space-y-4">
              {[
                ['Full Name', User, 'Your Full Name', 'name', 'text'],
                ['Work Email', Mail, 'email@company.com', 'email', 'email'],
                ['Business Name', Briefcase, 'e.g. ABC Realty or Clinic Name', 'businessName', 'text'],
                ['Business Type / Industry', Building2, 'e.g. Luxury Real Estate or Dental Clinic', 'businessType', 'text'],
              ].map(([label, Icon, placeholder, key, type]) => (
                <div key={String(key)}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                    {String(label)}
                  </label>
                  <div className="relative">
                    {React.createElement(Icon as React.ElementType, { className: 'absolute left-4 top-4 w-4 h-4 text-slate-600' })}
                    <input
                      required
                      type={String(type)}
                      placeholder={String(placeholder)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors"
                      value={(formData as any)[String(key)]}
                      onChange={e => setFormData({ ...formData, [String(key)]: e.target.value })}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                  Phone / WhatsApp Number
                </label>
                <PhoneInput
                  country="in"
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  containerClass="phone-input-container"
                  inputClass="!w-full !h-14 !bg-slate-950 !border-slate-800 !rounded-2xl !text-white !font-bold !pl-14"
                  buttonClass="!bg-slate-950 !border-slate-800 !rounded-l-2xl !pl-2"
                  dropdownClass="!bg-slate-900 !text-white !border-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                  Website URL / Specific Requirements
                </label>
                <textarea
                  placeholder="e.g. yourwebsite.com — tell us about your speed issues, schema requirements, or lead goals."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white font-bold outline-none focus:border-emerald-500 min-h-[100px] resize-none transition-colors"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-[.18em] flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(16,185,129,.3)] transition-all disabled:opacity-50 hover:-translate-y-0.5"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-950"/>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 text-slate-950" />
                  Continue with WhatsApp
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400/90 font-bold uppercase tracking-widest text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0"/>
              Direct 1-Tap WhatsApp delivery with all filled details
            </div>
          </form>
        ) : (
          <div className="p-12 text-center space-y-7">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-400/20">
              <MessageCircle className="w-12 h-12"/>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
              Opening WhatsApp...
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Your details have been pre-filled. Just tap <strong className="text-white">Send</strong> on WhatsApp to connect directly with our desk!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
