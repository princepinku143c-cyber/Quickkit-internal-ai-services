
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, ShieldCheck, Cpu, CheckCircle2, Loader2, Mail, Phone, Building2, User, FileText, CreditCard, DollarSign, Wallet, Shield, CheckCircle, Ticket } from 'lucide-react';
import { ServiceItem, Currency, AIQuote } from '../../types';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PayPalButtons } from "@paypal/react-paypal-js";

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
    requirement: ''
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

    try {
      const res = await fetch('/api/kelly-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          messages: [...chatHistory, { role: 'user', content: userMsg }].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'model', content: data.reply || data.message || "I'm here to help!" }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', content: "🚨 Connection interrupted. Please try again." }]);
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

  const basePrice = item?.setupUSD || 2799;
  const finalPrice = Math.round(basePrice * (1 - discount / 100));
  const advanceAmount = Math.round(finalPrice * 0.1);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      const res = await fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectName: item?.name || 'Custom Build', price: finalPrice })
      });
      if (res.ok) setView('payment');
    } catch (err) {
        alert("Submission failed.");
    } finally {
        setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-xl">
      <div className="bg-[#080c14] border border-slate-800 w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Kelly Architect Studio</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Building: {item?.name || 'Custom Solution'}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {view === 'studio' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-full md:w-[500px] border-r border-slate-800 bg-slate-950/40 p-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-10">
                    <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 block">Architectural Blueprint</span>
                        <h4 className="text-3xl font-black text-white leading-tight mb-4">{item?.name || 'Custom Solution'}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{item?.outcome}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
                            <Clock className="w-5 h-5 text-blue-400 mb-3" />
                            <p className="text-xl font-black text-white">2–3 Days</p>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3" />
                            <p className="text-xl font-black text-white">${finalPrice.toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={() => setView('form')} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-500 transition-all uppercase text-sm tracking-widest">Deploy This Agent</button>
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-900/10">
                <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{msg.content}</div>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-slate-800">
                    <form onSubmit={handleChat} className="relative">
                        <input value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Ask Kelly anything..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-white focus:outline-none" />
                        <button type="submit" className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl"><Zap className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="flex-1 overflow-y-auto p-12 bg-slate-950/50">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8 text-center">Operator Verification</h2>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required placeholder="Full Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required placeholder="Business Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    <input required type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input required placeholder="Phone" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <textarea rows={4} placeholder="Specific Requirements" className="md:col-span-2 w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})} />
                    <button type="submit" disabled={isDeploying} className="md:col-span-2 w-full py-5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-sm tracking-widest">
                        {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                    </button>
                </form>
              </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/30">
                <div className="max-w-md mx-auto space-y-8">
                    <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block">Invoice Summary</span>
                        <h2 className="text-4xl font-black text-white">${finalPrice.toLocaleString()}</h2>
                        {discount > 0 && <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">Discount Applied: {discount}% OFF</p>}
                    </div>

                    {/* Coupon System UI */}
                    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Redeem Coupon</p>
                        <div className="flex gap-2">
                           <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Code" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-white" />
                           <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
                              {applyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                           </button>
                        </div>
                        {couponError && <p className="text-[9px] text-red-500 mt-2 font-bold">{couponError}</p>}
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-400">Advance (10%)</span><span className="text-xl font-black text-white slashed-zero">${advanceAmount.toLocaleString()}</span></div>
                        
                        {/* PAYPAL BUTTON INTEGRATION */}
                        <div className="pt-4">
                           <PayPalButtons 
                             style={{ color: 'blue', shape: 'pill', label: 'pay', height: 50 }}
                             createOrder={async () => {
                                const idToken = await auth.currentUser?.getIdToken();
                                const res = await fetch("/api/create-paypal-order", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
                                  body: JSON.stringify({ amount: advanceAmount, projectName: item?.name || 'AI Agent' })
                                });
                                const data = await res.json();
                                return data.id;
                             }}
                             onApprove={async (data) => {
                                const idToken = await auth.currentUser?.getIdToken();
                                const res = await fetch("/api/capture-paypal-order", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
                                  body: JSON.stringify({ orderID: data.orderID, projectName: item?.name || "AI Agent" })
                                });
                                if (res.ok) { alert("Payment Successful 🚀 Project Initialized."); setView('studio'); onClose(); }
                             }}
                           />
                        </div>
                    </div>
                </div>
             </div>

             <div className="w-full md:w-[400px] bg-slate-900/40 p-10 border-l border-slate-800 overflow-y-auto">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 text-blue-400"><Shield className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment Guard</span></div>
                    <div className="space-y-6 text-[11px] leading-relaxed text-slate-400 font-medium">
                        <section><h5 className="text-white font-black uppercase mb-2">Refund Policy</h5><p>Advance payments are refundable within 3 days only if no development work has started. Once build begins, fee is non-refundable.</p></section>
                        <section><h5 className="text-white font-black uppercase mb-2">Timeline</h5><p>Standard unit delivery: 2–3 working days. Highly complex builds may vary slightly.</p></section>
                    </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
