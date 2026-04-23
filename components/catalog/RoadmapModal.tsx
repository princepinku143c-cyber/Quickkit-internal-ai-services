
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, FileCheck, RefreshCw, MessageSquare, Terminal, ChevronRight, ShieldCheck, Layers, Sparkles, TrendingDown, Users2, HelpCircle, Paperclip, Image as ImageIcon, Trash2, Cpu, CheckCircle, Smartphone, Globe, Code, Box, Loader2, Mail, Phone, Building2, User, FileText } from 'lucide-react';
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
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'model', content: `Hello! I'm Kelly. I've prepared the architectural blueprint for the ${item?.name || 'requested automation'}. You can review the technical specs on the left or ask me anything!` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDeploymentForm, setShowDeploymentForm] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

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
      setChatHistory(prev => [...prev, { role: 'model', content: data.chatResponse || data.message || "I'm here to help!" }]);
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
        setDeployed(true);
      }
    } catch (err) {
        alert("Submission failed. Please check your connection.");
    } finally {
        setIsDeploying(false);
    }
  };

  // Static Data Extraction
  const features = item?.actions || ["Automated Workflows", "Real-time Monitoring", "Secure Data Encryption", "Custom Integrations"];
  const useCases = item?.bestFor?.split(', ') || ["Enterprise Ops", "Direct-to-Consumer", "Marketing Agencies"];
  const setupFee = item?.setupUSD || 2799;

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
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Kelly Architecture Studio</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase bg-slate-800 px-2 py-0.5 rounded">ID: {sessionRef.slice(0,8)}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live Consultant</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {!showDeploymentForm ? (
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

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-800"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capabilities</span>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 hover:bg-slate-900 transition-colors">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Primary Use Cases</span>
                        <div className="flex flex-wrap gap-2">
                            {useCases.map((u, i) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u}</span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-800">
                        <button 
                          onClick={() => setShowDeploymentForm(true)}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-[0.1em] active:scale-[0.98]"
                        >
                           <Zap className="w-5 h-5 fill-current" /> Deploy This Agent Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Live Consultation Chat (DeepSeek Powered) */}
            <div className="flex-1 flex flex-col bg-slate-900/10">
                <div className="px-8 py-3 bg-slate-900/30 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Live Consultant Thread
                    </span>
                </div>
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
                    {isTyping && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-slate-800 border border-slate-700 p-5 rounded-3xl rounded-tl-none flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono font-bold uppercase tracking-widest">Kelly is typing...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <form onSubmit={handleChat} className="relative">
                        <input 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="Ask Kelly about this architecture..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
                        />
                        <button type="submit" disabled={!userInput.trim() || isTyping} className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50">
                            <Zap className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-12 bg-slate-950/50 custom-scrollbar">
            {!deployed ? (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Finalize Deployment</h2>
                    <p className="text-slate-400 font-medium">Verify your business details to initiate the ${item?.name || 'requested'} system.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Operator Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                            <input 
                                required
                                placeholder="e.g. John Carter"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Business Identity</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                            <input 
                                required
                                placeholder="e.g. Acme Logistics"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                value={formData.businessName}
                                onChange={e => setFormData({...formData, businessName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Destination</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                            <input 
                                required
                                type="email"
                                placeholder="e.g. operations@acme.com"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Direct Contact</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                            <input 
                                required
                                placeholder="e.g. +1 555-0123"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Core Requirements</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                            <textarea 
                                required
                                rows={4}
                                placeholder="Describe any specific needs for this deployment..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all resize-none"
                                value={formData.requirement}
                                onChange={e => setFormData({...formData, requirement: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-6">
                        <button 
                            type="submit" 
                            disabled={isDeploying}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest disabled:opacity-50"
                        >
                            {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RocketIcon className="w-5 h-5" /> Submit Deployment Request</>}
                        </button>
                        
                        {/* Trust Messages */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 2-3 Days Guaranteed Delivery
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Live Demo Video Call Included
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Zero Payment Until Confirmation
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 24/7 Human-Led Assistance
                            </div>
                        </div>
                    </div>
                </form>
              </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-2xl">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Request Sent Successfully!</h2>
                    <p className="text-lg text-slate-400 font-medium max-w-lg mb-10 leading-relaxed">Your deployment signal has been received. Our lead architect will review the specs and contact you within the next 24 hours.</p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl flex items-center gap-3 uppercase text-xs tracking-widest transition-all">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RocketIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="m9 12 2.5 2.5"/>
        <path d="M12 21a9 9 0 0 0 9-9"/>
    </svg>
);
