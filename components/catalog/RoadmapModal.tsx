
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, FileCheck, RefreshCw, MessageSquare, Terminal, ChevronRight, ShieldCheck, Layers, Sparkles, TrendingDown, Users2, HelpCircle, Paperclip, Image as ImageIcon, Trash2, Cpu, CheckCircle, Smartphone, Globe, Code, Box, Loader2, Mail, Phone, Building2, User, FileText, CreditCard, DollarSign, Wallet, Shield } from 'lucide-react';
import { ServiceItem, Currency, AIQuote } from '../../types';
import { auth } from '../../lib/firebase';

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
  const [activeTab, setActiveTab] = useState<'blueprint' | 'chat'>('blueprint');
  const [view, setView] = useState<'studio' | 'form' | 'payment' | 'tracking'>('studio');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'model', content: `Hello! I'm Kelly. I've prepared the architectural blueprint for the ${item?.name || 'requested automation'}. You can review the technical specs on the left or ask me anything!` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Form State
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      const res = await fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectName: item?.name || 'Custom Build',
          price: item?.setupUSD || 2799
        })
      });

      if (res.ok) {
        setView('payment');
      }
    } catch (err) {
        alert("Submission failed. Please check your connection.");
    } finally {
        setIsDeploying(false);
    }
  };

  const setupFee = item?.setupUSD || 2799;
  const advanceAmount = Math.round(setupFee * 0.1);

  const handlePayAdvance = async () => {
    setPaymentLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User must be logged in.");
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          amount: advanceAmount,
          projectName: item?.name || 'Custom Solution'
        })
      });
      const order = await res.json();
      if (order.links) {
        window.location.href = order.links.find((l: any) => l.rel === 'approve').href;
      }
    } catch (e) {
      alert("Payment initiation failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-xl">
      <div className="bg-[#080c14] border border-slate-800 w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] overflow-hidden relative border-t-blue-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                        {view === 'payment' ? 'Project Settlement' : view === 'tracking' ? 'Project Dashboard' : 'Kelly Architecture Studio'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase bg-slate-800 px-2 py-0.5 rounded">ID: {sessionRef.slice(0,8)}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live Consultant</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {view === 'studio' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Professional Blueprint */}
            <div className="w-full md:w-[500px] border-r border-slate-800 bg-slate-950/40 p-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-10 animate-fade-in">
                    <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 block">Architectural Blueprint</span>
                        <h4 className="text-3xl font-black text-white leading-tight mb-4">{item?.name || 'Custom Solution'}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{item?.outcome || "Premium AI integration designed for high-performance operations and autonomous execution."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl group hover:border-blue-500/30 transition-all">
                            <Clock className="w-5 h-5 text-blue-400 mb-3" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Timeline</p>
                            <p className="text-xl font-black text-white">2–3 Days</p>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Setup Cost</p>
                            <p className="text-xl font-black text-white">${setupFee.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-800">
                        <button 
                          onClick={() => setView('form')}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-[0.1em] active:scale-[0.98]"
                        >
                           <Zap className="w-5 h-5 fill-current" /> Deploy This Agent Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Live Consultation Chat */}
            <div className="flex-1 flex flex-col bg-slate-900/10">
                <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none font-medium'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <form onSubmit={handleChat} className="relative">
                        <input 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="Ask Kelly about this architecture..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
                        />
                        <button type="submit" disabled={!userInput.trim() || isTyping} className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all">
                            <Zap className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="flex-1 overflow-y-auto p-12 bg-slate-950/50 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8 text-center">Verify Operator Details</h2>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Operator Name</label>
                        <input required className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Business Name</label>
                        <input required className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email</label>
                        <input required type="email" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Phone</label>
                        <input required className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Requirements</label>
                        <textarea rows={4} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 text-white resize-none" value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 pt-6">
                        <button type="submit" disabled={isDeploying} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-sm tracking-widest">
                            {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                        </button>
                    </div>
                </form>
              </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             {/* Left: Invoice Summary */}
             <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/30">
                <div className="max-w-md mx-auto space-y-8 animate-fade-in">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block">Invoice Summary</span>
                        <h2 className="text-4xl font-black text-white slashed-zero">${setupFee.toLocaleString()}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global AI Deployment: {item?.name}</p>
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-400">Advance (10% Required)</span>
                            <span className="text-xl font-black text-white">${advanceAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-4">
                            <span className="text-slate-500">Remaining Balance</span>
                            <span className="text-slate-400 font-mono">${(setupFee - advanceAmount).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center mt-2">
                            Pay advance to initiate development
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button onClick={handlePayAdvance} disabled={paymentLoading} className="w-full py-5 bg-[#0070ba] text-white font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-[#004b7c] transition-all disabled:opacity-50 text-sm italic">
                            {paymentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> PayPal Advance</>}
                        </button>
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600 bg-[#080c14] px-4">or pay via crypto</div>
                        </div>
                        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center gap-4">
                           <Wallet className="w-6 h-6 text-amber-500" />
                           <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-200 uppercase mb-1">USDT (TRC20) Advance</p>
                              <p className="text-[9px] font-mono text-slate-500">TX7j...W9kL (Click to Copy)</p>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                    </div>
                </div>
             </div>

             {/* Right: Terms & Conditions */}
             <div className="w-full md:w-[400px] bg-slate-900/40 p-10 border-l border-slate-800 overflow-y-auto custom-scrollbar">
                <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center gap-3 text-blue-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terms of Service</span>
                    </div>
                    
                    <div className="space-y-6 text-[11px] leading-relaxed text-slate-400 font-medium">
                        <section>
                            <h5 className="text-white font-black uppercase tracking-widest mb-2">Payment Terms</h5>
                            <ul className="space-y-2 list-disc pl-4 marker:text-blue-500">
                                <li>We require a 10% advance payment to initiate your project.</li>
                                <li>Remaining balance is payable after demo and before final delivery.</li>
                                <li>Project delivery timeline: 2–3 working days.</li>
                            </ul>
                        </section>
                        <section>
                            <h5 className="text-white font-black uppercase tracking-widest mb-2">Customization</h5>
                            <p>Any additional features requested after initial scope may incur extra charges. Final pricing adjustments will be communicated via email.</p>
                        </section>
                        <section>
                            <h5 className="text-white font-black uppercase tracking-widest mb-2">Trust & Delivery</h5>
                            <p>You will receive a live demo before final payment. Full system access will be provided after complete payment.</p>
                        </section>
                        <section className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <h5 className="text-red-400 font-black uppercase tracking-widest mb-2">Refund Policy</h5>
                            <p>Advance payment is non-refundable once development has started.</p>
                        </section>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] text-emerald-400 font-black uppercase leading-tight">Secure Transaction Guaranteed by QuickKit Global</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
