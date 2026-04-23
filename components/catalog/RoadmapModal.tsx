
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, FileCheck, RefreshCw, MessageSquare, Terminal, ChevronRight, ShieldCheck, Layers, Sparkles, TrendingDown, Users2, HelpCircle, Paperclip, Image as ImageIcon, Trash2, Cpu, CheckCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceItem, Currency, AIQuote } from '../../types';

interface RoadmapModalProps {
  item?: ServiceItem;
  customPrompt?: string;
  currency: Currency;
  existingData?: AIData;
  existingHistory?: ChatMessage[];
  onSaveState: (data: AIData, history: ChatMessage[]) => void;
  onClose: () => void;
  onBook: (quote: AIQuote, history: ChatMessage[]) => void;
  sessionRef: string;
  isWidget?: boolean;
}

interface ChatPart {
  text?: string;
  inlineData?: { mimeType: string; data: string; };
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatPart[];
}

interface Step {
  title: string;
  description: string;
  keyAction: string; 
  duration: string;
}

interface AIData {
  steps: Step[];
  summary: string;
  chatResponse: string;
  totalDuration: string;
  estimatedSetup: number;
  estimatedMaintenance: number;
  efficiencySavedHours: number;
  complexityTier: 'SIMPLE' | 'INTERMEDIATE' | 'ADVANCED' | 'ENTERPRISE';
  complexityReason: string;
  annualRoiEstimate: number;
  roiBreakdown: string;
  manualLaborCostEstimate: number;
  needsClarification: boolean;
  isCustomEstimate?: boolean;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ item, customPrompt, currency, existingData, existingHistory, sessionRef, isWidget, onSaveState, onClose, onBook }) => {
  const [loading, setLoading] = useState(!existingData);
  const [refining, setRefining] = useState(false);
  const [data, setData] = useState<AIData | null>(existingData || null);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState(existingData?.chatResponse || '');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(existingHistory || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const AI_MODEL = 'gemini-2.0-flash-lite'; 

  useEffect(() => {
    if (!existingData) generateRoadmap();
  }, [item, customPrompt]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, displayText, refining]);

  const getSystemPrompt = () => {
    const isCustomProject = !item;
    return `You are Kelly, a Professional AI Solutions Architect.
    
    CRITICAL:
    1. RESPONSE LENGTH: Max 2 short sentences. Be snappy!
    2. TIMELINE: Always 2-4 days.
    3. JSON: Always output valid JSON including 'steps', 'chatResponse', and 'estimatedSetup'.
    
    PRICING (USD):
    - SIMPLE: $799. Monthly: $100
    - INTERMEDIATE: $1599. Monthly: $199
    - ADVANCED: $3499. Monthly: $299
    `;
  };

  const generateRoadmap = async () => {
    setLoading(true);
    const initialRequest = item ? `Service: ${item.name}` : `Custom Build: ${customPrompt}`;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Missing");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: [{ role: 'user', parts: [{ text: initialRequest }] }],
        config: { 
            systemInstruction: getSystemPrompt(),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                chatResponse: { type: Type.STRING },
                needsClarification: { type: Type.BOOLEAN },
                totalDuration: { type: Type.STRING },
                estimatedSetup: { type: Type.NUMBER },
                estimatedMaintenance: { type: Type.NUMBER },
                complexityTier: { type: Type.STRING },
                roiBreakdown: { type: Type.STRING },
                annualRoiEstimate: { type: Type.NUMBER },
                isCustomEstimate: { type: Type.BOOLEAN },
                steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, duration: { type: Type.STRING } } } }
              }
            }
        }
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const result = JSON.parse(responseText);
      setData(result);
      
      const newHistory: ChatMessage[] = [
        { role: 'user', parts: [{ text: initialRequest }] },
        { role: 'model', parts: [{ text: result.chatResponse }] }
      ];
      setChatHistory(newHistory);
      onSaveState(result, newHistory);

    } catch (err: any) {
      console.error(err);
      setChatHistory([{ role: 'model', parts: [{ text: `Error: ${err.message}. Check your VITE_GEMINI_API_KEY.` }] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!userInput.trim() || !data) return;
    setRefining(true);
    const currentInput = userInput;
    setUserInput('');
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: currentInput }] }];
        setChatHistory(updatedHistory);

        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: updatedHistory,
            config: { systemInstruction: getSystemPrompt(), responseMimeType: 'application/json' }
        });

        const result = JSON.parse(response.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
        setData(result);
        setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: result.chatResponse }] }]);
    } catch (e) {
        console.error(e);
    } finally {
        setRefining(false);
    }
  };

  const handleProceedToDeployment = () => {
    if (!data) return;
    const quote: AIQuote = {
        setupCost: data.estimatedSetup,
        monthlyCost: data.estimatedMaintenance,
        roiEstimate: data.annualRoiEstimate,
        buildTime: data.totalDuration,
        generatedAt: new Date().toISOString(),
        isCustomEstimate: data.isCustomEstimate
    };
    onBook(quote, chatHistory);
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
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Kelly Architecture Studio</h3>
                    <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">Session ID: {sessionRef.slice(0,8)}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {/* Master Layout */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left: AI Blueprint (The "Detailed" part) */}
            <div className="w-full md:w-[450px] border-r border-slate-800 bg-slate-950/40 p-8 overflow-y-auto hidden md:block">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Building Blueprint...</p>
                    </div>
                ) : data ? (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 block">Project Summary</span>
                            <h4 className="text-2xl font-black text-white leading-tight mb-3">{item?.name || 'Custom Build'}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{data.summary}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Estimated ROI</p>
                                <p className="text-xl font-black text-emerald-400">+{data.annualRoiEstimate}%</p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Time To Live</p>
                                <p className="text-xl font-black text-blue-400">{data.totalDuration}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Technical Roadmap</span>
                            {data.steps?.map((step, i) => (
                                <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</div>
                                    <div>
                                        <p className="text-xs font-black text-white mb-1 uppercase tracking-tight">{step.title}</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Setup Fee</p>
                                    <p className="text-2xl font-black text-white">${data.estimatedSetup.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-emerald-500/70 font-bold uppercase">Monthly Ops</p>
                                    <p className="text-2xl font-black text-emerald-400">${data.estimatedMaintenance.toLocaleString()}</p>
                                </div>
                             </div>
                             <button onClick={handleProceedToDeployment} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                                Proceed to Deployment <ChevronRight className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Right: Consultation Chat */}
            <div className="flex-1 flex flex-col bg-slate-900/10">
                <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'}`}>
                                {msg.parts[0].text?.replace(/Service: |Custom Build: /g, '')}
                            </div>
                        </div>
                    ))}
                    {refining && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span className="text-xs text-slate-500 font-mono italic">Kelly is writing...</span>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleRefine(); }} className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <div className="relative">
                        <input 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="Type a message to customize your agent..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors">
                            <Zap className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => <RefreshCw className={className} />;
