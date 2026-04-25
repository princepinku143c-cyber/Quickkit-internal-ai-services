
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, ShieldCheck, Cpu, CheckCircle2, Loader2, Mail, Phone, Building2, User, FileText, CreditCard, DollarSign, Wallet, Shield, CheckCircle, Ticket, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { ServiceItem, Currency, AIQuote } from '../../types';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Logo } from "../Logo";

// Phone Input for high conversion
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';

interface RoadmapModalProps {
  item?: ServiceItem;
  customPrompt?: string;
  currency: Currency;
  existingData?: any;
  existingHistory?: any[];
  onSaveState: (data: any, history: any[]) => void;
  onClose: () => void;
  onBook: (quote: AIQuote, history: any[]) => void;
  sessionRef: string;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ item, currency, onClose, sessionRef }) => {
  const [view, setView] = useState<'studio' | 'form' | 'payment' | 'tracking'>('studio');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'model', content: `Hello! I'm Kelly. I've prepared the architectural blueprint for the ${item?.name || 'requested automation'}. You can review the technical specs on the left or ask me anything!` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    phone: '',
    businessName: '',
    requirement: '',
    country: 'us'
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isTyping]);

  const handleChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userMsg = userInput;
    setUserInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    setErrorStatus(null);

    try {
      const authHeader = auth.currentUser ? `Bearer ${await auth.currentUser.getIdToken()}` : '';
      
      const res = await fetch(`${window.location.origin}/api/kelly-architect`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      
      if (res.status === 403 && data.message === "LIMIT_REACHED") {
          setErrorStatus("LOGIN_REQUIRED");
          setChatHistory(prev => [...prev, { role: 'model', content: "🚨 You've reached the guest message limit. Please log in to continue our architectural session." }]);
      } else if (!res.ok) {
          setChatHistory(prev => [...prev, { role: 'model', content: "System temporarily unavailable. Our engineers are stabilizing the neural link." }]);
      } else {
          setChatHistory(prev => [...prev, { role: 'model', content: data.reply || "I'm here to translate your vision into automation." }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', content: "🚨 Neural link timeout. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const docRef = doc(db as any, 'coupons', couponCode.toUpperCase());
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setDiscount(data.discount || 0);
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code');
        setDiscount(0);
      }
    } catch (err) {
      setCouponError('Error verifying coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const basePrice = item?.setupUSD || 2499;
  const finalPrice = Math.round(basePrice * (1 - discount / 100));
  const advanceAmount = Math.round(finalPrice * 0.1);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
        alert("Please enter a valid phone number.");
        return;
    }
    setIsDeploying(true);
    try {
      const res = await fetch(`${window.location.origin}/api/send-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            businessName: formData.businessName,
            projectName: item?.name || 'Custom Build', 
            requirement: formData.requirement || `Architect Session: ${item?.name}`,
            price: finalPrice 
        })
      });

      const data = await res.json();

      if (res.ok) setView('payment');
      else throw new Error(data.message || data.details || "API Failure");
    } catch (err: any) {
        console.error("LEAD ERROR:", err);
        alert(`Lead transmission failed: ${err.message}`);
    } finally {
        setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-3xl">
      <div className="bg-[#080c14] border border-slate-800 w-full max-w-6xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-[90vh] overflow-hidden relative animate-fade-in">
        
        {/* Superior Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
            <div className="flex items-center gap-5">
                <Logo size={48} />
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Kelly Architect Studio</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Live Intelligence Sync: {item?.name || 'Custom Solution'}</p>
                   </div>
                </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
        </div>

        {view === 'studio' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-full md:w-[450px] border-r border-white/5 bg-slate-950/20 p-12 overflow-y-auto custom-scrollbar">
                <div className="space-y-12">
                    <div className="relative">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 block">Deployment Blueprint</span>
                        <h4 className="text-4xl font-black text-white leading-none tracking-tighter mb-6">{item?.name || 'Custom Solution'}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-bold border-l-2 border-slate-800 pl-4 uppercase tracking-wide">{item?.outcome}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Clock className="w-5 h-5" /></div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Delivery Time</span>
                            </div>
                            <p className="text-lg font-black text-white">2–3 DAYS</p>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><ShieldCheck className="w-5 h-5" /></div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Fixed Asset Value</span>
                            </div>
                            <p className="text-lg font-black text-white">${finalPrice.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button onClick={() => setView('form')} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 hover:-translate-y-1 transition-all uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3">
                            Deploy This Agent <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-900/10 relative">
                {/* Status Overlays */}
                {errorStatus === 'LOGIN_REQUIRED' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md p-10">
                        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center max-w-sm space-y-6">
                            <Lock className="w-16 h-16 text-blue-500 mx-auto" />
                            <h5 className="text-2xl font-black text-white uppercase tracking-tighter">Session Locked</h5>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">You have reached the guest limit. Please log in to authorize further architectural scoping.</p>
                            <button onClick={() => navigate('/login', { replace: true })} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Authorize Now</button>
                        </div>
                    </div>
                )}


                <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-8 custom-scrollbar">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-medium ${msg.role === 'user' ? 'bg-blue-600 shadow-xl text-white rounded-tr-none' : 'bg-slate-900/60 border border-white/5 text-slate-300 rounded-tl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-900 p-6 rounded-[2rem] rounded-tl-none flex gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-8 border-t border-white/5 bg-slate-950/20">
                    <form onSubmit={handleChat} className="relative group">
                        <input value={userInput} disabled={errorStatus === 'LOGIN_REQUIRED'} onChange={e => setUserInput(e.target.value)} placeholder="Ask Kelly about deployment, ROI, or custom features..." className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-5 pl-8 pr-20 text-white font-bold placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all disabled:opacity-50" />
                        <button type="submit" disabled={isTyping || errorStatus === 'LOGIN_REQUIRED'} className="absolute right-3 top-3 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-lg transition-all active:scale-95 disabled:opacity-50"><Zap className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="flex-1 overflow-y-auto p-16 bg-slate-950/50 flex flex-col items-center">
              <div className="w-full max-w-2xl space-y-12">
                <div className="text-center space-y-4">
                    <button onClick={() => setView('studio')} className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto uppercase text-[10px] font-black tracking-widest transition-all"><ArrowLeft className="w-4 h-4" /> Return to Architect</button>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Operator Verification</h2>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Synchronizing your session with the neural deployment node.</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Operator Name</label>
                        <input required placeholder="Your Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Business Unit</label>
                        <input required placeholder="Organization Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500/50" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Secure Email</label>
                        <input required type="email" placeholder="work@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500/50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Direct Phone</label>
                         <PhoneInput
                            country={'us'}
                            value={formData.phone}
                            onChange={(phone, country: any) => setFormData({...formData, phone, country: country.countryCode})}
                            containerClass="phone-input-container"
                            inputClass="!w-full !h-14 !bg-slate-950 !border-slate-800 !rounded-2xl !text-white !font-bold !pl-14 !transition-all"
                            buttonClass="!bg-slate-950 !border-slate-800 !rounded-2xl"
                            dropdownClass="!bg-slate-900 !text-white !border-slate-800"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Specific Requirements</label>
                        <textarea rows={3} placeholder="Tell us more about your target outcome..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500/50 resize-none" value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})} />
                    </div>
                    
                    <button type="submit" disabled={isDeploying} className="md:col-span-2 w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] flex items-center justify-center gap-4 uppercase text-sm tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 mt-4">
                        {isDeploying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Start Build"}
                    </button>
                    <p className="md:col-span-2 text-center text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">Encrypted Session Encryption Active</p>
                </form>
              </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/20">
             <div className="flex-1 p-16 overflow-y-auto custom-scrollbar flex flex-col items-center">
                <div className="w-full max-w-sm space-y-12">
                    <div className="text-center">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit mx-auto mb-6 text-emerald-500"><CreditCard className="w-10 h-10" /></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Investment Summary</p>
                        <h2 className="text-6xl font-black text-white tracking-tighter">${finalPrice.toLocaleString()}</h2>
                        {discount > 0 && <span className="inline-block mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{discount}% ECO SYSTEM DISCOUNT</span>}
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Initial Advance (10%)</span>
                            <span className="text-2xl font-black text-white tracking-tighter">${advanceAmount.toLocaleString()}</span>
                        </div>

                        {/* Coupon Logic */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="COUPON CODE" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs font-black text-white outline-none focus:border-blue-500/30" />
                                <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase transition-all">
                                    {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                                </button>
                            </div>
                            {couponError && <p className="text-[9px] text-red-500 font-bold uppercase ml-2 tracking-widest">{couponError}</p>}
                        </div>

                        <div className="pt-2 relative z-10">
                           <PayPalButtons 
                             style={{ color: 'blue', shape: 'pill', label: 'pay', height: 55 }}
                             createOrder={async () => {
                                const idToken = await auth.currentUser?.getIdToken();
                                const res = await fetch(`${window.location.origin}/api/create-paypal-order`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
                                  body: JSON.stringify({ amount: advanceAmount, projectName: item?.name || 'AI Agent' })
                                });
                                const data = await res.json();
                                return data.id;
                             }}
                             onApprove={async (data) => {
                                const idToken = await auth.currentUser?.getIdToken();
                                const res = await fetch(`${window.location.origin}/api/capture-paypal-order`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
                                  body: JSON.stringify({ orderID: data.orderID, projectName: item?.name || "AI Agent" })
                                });
                                if (res.ok) { alert("Initialization Successful. Redirecting to Build Queue."); setView('studio'); onClose(); }
                             }}
                           />
                        </div>
                    </div>
                </div>
             </div>

             <div className="w-full md:w-[450px] bg-slate-900/60 p-16 border-l border-white/5 overflow-y-auto overflow-x-hidden">
                <div className="space-y-12">
                    <div className="flex items-center gap-4 text-blue-500"><Shield className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Secure Node</span></div>
                    
                    <div className="space-y-10">
                        <section className="space-y-4">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-md">Project Integrity</h5>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Initial 10% advance is fully refundable within 72 hours of transaction if engineering logic has not been committed to the VPS stack.</p>
                        </section>
                        <section className="space-y-4">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-md">Build Cycle</h5>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Standard build velocity is estimated at 48-72 hours. High-order complexity may require additional scoping threads.</p>
                        </section>
                        <section className="space-y-4">
                             <h5 className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-md">Global SLA</h5>
                             <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">All deployments include 1 year of managed neural hosting and security patch orchestration.</p>
                        </section>
                    </div>

                    <div className="pt-10 opacity-30">
                        <Bot className="w-24 h-24 text-slate-800" />
                    </div>
                </div>
             </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .phone-input-container .special-label { display: none; }
        .phone-input-container input:focus { border-color: #2563eb !important; background-color: #020617 !important; }
        .phone-input-container .form-control { width: 100% !important; height: 56px !important; background: #020617 !important; color: white !important; font-weight: 700 !important; border-radius: 16px !important; border: 1px solid #1e293b !important; }
        .phone-input-container .flag-dropdown { background: #020617 !important; border: 1px solid #1e293b !important; border-top-left-radius: 16px !important; border-bottom-left-radius: 16px !important; }
      `}} />
    </div>
  );
};
