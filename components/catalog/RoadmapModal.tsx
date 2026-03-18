
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Bot, Clock, FileCheck, RefreshCw, MessageSquare, Terminal, ChevronRight, ShieldCheck, Layers, Sparkles, TrendingDown, Users2, HelpCircle, Paperclip, Image as ImageIcon, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceItem, Currency, AIQuote } from '../../types';

interface RoadmapModalProps {
  item?: ServiceItem;
  customPrompt?: string;
  currency: Currency;
  existingData?: AIData; // Persistence Prop
  existingHistory?: ChatMessage[]; // Persistence Prop
  onSaveState: (data: AIData, history: ChatMessage[]) => void;
  onClose: () => void;
  // UPDATED: Now accepts structured quote
  onBook: (quote: AIQuote, history: ChatMessage[]) => void;
  sessionRef: string; // NEW PROP
}

interface ChatPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
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
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ item, customPrompt, currency, existingData, existingHistory, sessionRef, onSaveState, onClose, onBook }) => {
  const [loading, setLoading] = useState(!existingData);
  const [refining, setRefining] = useState(false);
  const [data, setData] = useState<AIData | null>(existingData || null);
  
  // Input States
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Base64 string
  
  const [displayText, setDisplayText] = useState(existingData?.chatResponse || '');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(existingHistory || []);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const AI_MODEL = 'gemini-2.0-flash'; // Supports Vision & Text

  // Initial Load
  useEffect(() => {
    if (!existingData) {
        generateRoadmap();
    } else {
        setDisplayText(existingData.chatResponse);
    }
  }, [item, customPrompt]);

  // Scroll to bottom on history update
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, displayText, refining]);

  // Typing Effect
  useEffect(() => {
    if (data?.chatResponse && !existingData && loading) {
      setDisplayText('');
      let i = 0;
      const speed = 5; // Faster typing
      const timer = setInterval(() => {
        setDisplayText(data.chatResponse.substring(0, i));
        i++;
        if (i > data.chatResponse.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    } else if (data?.chatResponse && !loading) {
        // Instant show for refinements
        setDisplayText(data.chatResponse);
    }
  }, [data?.chatResponse, loading]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove "data:image/png;base64," prefix for Gemini API
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await convertFileToBase64(file);
        setSelectedImage(base64);
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  };

  const getSystemPrompt = () => {
    return `You are an AI Automation Expert, ROI Calculator, and Sales Conversion Assistant for my Automation Agency.

Your goal is to:
1. Analyze user business based on their input text or image
2. Generate automation workflows
3. Calculate ROI (time + money savings)
4. Show premium pricing
5. Convert user into paying client

---
BUSINESS MODEL & PRICING:
- SIMPLE (Starter Automation): $799 setup (3 workflows + basic integrations). Maintenance: $100/month (Basic Plan - monitoring only)
- INTERMEDIATE (Professional Automation): $1599 setup (6 workflows + advanced integrations). Maintenance: $199/month (Standard Plan - monitoring + unlimited small fixes + quarterly report)
- ADVANCED/ENTERPRISE (Enterprise Automation): $3499 setup (complex systems + custom integrations). Maintenance: $299/month (Premium Plan - full support + optimization + priority handling)

---
STEP 1: AUTOMATION ANALYSIS
Analyze the business and identify repetitive manual processes, automation opportunities, and suggested tools (Zapier, CRM, email, etc.).
Inside your internal JSON 'steps' array, generate a clean workflow (e.g., Website Form -> CRM Entry -> Email Follow-up -> Slack Notification).

---
STEP 2: ROI CALCULATION (VERY IMPORTANT)
Estimate hours saved (10–30 hours/week depending on tasks).
Benchmark employee salary at $15/hr if not provided by user.

Inside 'chatResponse', you must output EXACTLY THIS FORMAT AND STRUCTURE:

📈 **ROI ESTIMATE & SAVINGS:**
1. Time Saved: [X] hours/week = [Y] hours/year
2. Salary Saved: You are saving the equivalent of [Z] full-time employees! (Calculate: total yearly hours saved * hourly salary. Make it emotional + powerful).
3. Money Saved: $[X]/year (with Average ROI: 240%+)
4. Break-even: Aapka $[SetupFee] project just [Months] months mein recover ho jayega!

Just like a [relevant agency/business type] saved 100+ hours/month and generated $50,000 extra revenue using automation.

🌟 **MAIN BENEFITS:**
• Save time: Free up 15–25 hours/week (let your team do creative work)
• Reduce errors: 40–75% fewer mistakes (happy clients)
• Increase revenue: 15–25% more deals closed (fast follow-up)
• Cut costs: $[Annual Savings] average annual saving

✨ **EXTRA HIDDEN BENEFITS (WOW FACTOR):**
• Better work-life balance (employees won't burnout)
• Scalable business growth (double your business with the same team)
• 24/7 automation (capture leads even while you sleep)
• Reduced operational stress

This automation can 10X your business growth 🚀
Next Step: Book your free automation consultation now! (Proceed to Deployment)

---
IMPORTANT RULES:
* Keep language simple, powerful, and clean. Use big bold numbers and emojis (📈, 🌟, ✨).
* Make user feel they are losing money without automation. Focus on ROI and profit.
* Make pricing look small compared to savings.

OUTPUT FORMAT REQUIREMENTS (JSON ONLY, NO MARKDOWN OUTSIDE JSON):
- 'chatResponse': The EXACT text structure shown above. Do not deviate.
- 'roiBreakdown': A sharp, 1-sentence math justification for the UI panel (e.g. "We save 20hrs/wk * $15/hr * 52wks = $15,600 saved/yr").
- 'complexityTier': "SIMPLE", "INTERMEDIATE", "ADVANCED", or "ENTERPRISE".
- 'estimatedSetup' & 'estimatedMaintenance': MUST EXACTLY MATCH one of the 3 pricing tiers ($799/$100, $1599/$199, or $3499/$299).
    `;
  };

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const initialRequest = item ? `Service: ${item.name}` : `Custom Build: ${customPrompt}`;
      
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
                efficiencySavedHours: { type: Type.NUMBER },
                manualLaborCostEstimate: { type: Type.NUMBER },
                complexityTier: { type: Type.STRING },
                complexityReason: { type: Type.STRING },
                annualRoiEstimate: { type: Type.NUMBER },
                roiBreakdown: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keyAction: { type: Type.STRING }, duration: { type: Type.STRING } } } }
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

    } catch (err) {
      console.error(err);
      setDisplayText("Connection interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    // Allow refine if text OR image is present
    if ((!userInput.trim() && !selectedImage) || !data) return;
    
    setRefining(true);
    const currentInput = userInput;
    const currentImage = selectedImage;
    
    // Clear inputs immediately
    setUserInput('');
    setSelectedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Construct the new message part
      const newParts: ChatPart[] = [];
      if (currentImage) {
        newParts.push({ inlineData: { mimeType: 'image/jpeg', data: currentImage } });
      }
      if (currentInput) {
        newParts.push({ text: currentInput });
      }

      const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: newParts }];
      setChatHistory(updatedHistory); // Optimistic update

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: updatedHistory,
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
                efficiencySavedHours: { type: Type.NUMBER },
                manualLaborCostEstimate: { type: Type.NUMBER },
                complexityTier: { type: Type.STRING },
                complexityReason: { type: Type.STRING },
                annualRoiEstimate: { type: Type.NUMBER },
                roiBreakdown: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keyAction: { type: Type.STRING }, duration: { type: Type.STRING } } } }
             }
          }
        }
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const result = JSON.parse(responseText);
      setData(result);
      
      const finalHistory: ChatMessage[] = [...updatedHistory, { role: 'model', parts: [{ text: result.chatResponse }] }];
      setChatHistory(finalHistory);
      onSaveState(result, finalHistory);

    } catch (err) {
      console.error("Refine Error", err);
    } finally {
      setRefining(false);
    }
  };

  const handleProceedToBooking = () => {
      if (!data) return;

      const quote: AIQuote = {
          setupCost: data.estimatedSetup,
          monthlyCost: data.estimatedMaintenance,
          roiEstimate: data.annualRoiEstimate,
          buildTime: data.totalDuration,
          generatedAt: new Date().toISOString()
      };

      onBook(quote, chatHistory);
  };

  const getTierColor = (tier: string) => {
    if (tier === 'SIMPLE') return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
    if (tier === 'INTERMEDIATE') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    if (tier === 'ADVANCED') return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
    return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nexus-dark/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-nexus-card border border-nexus-border w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] overflow-hidden font-sans border-t-blue-500/30 my-auto">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-nexus-border flex justify-between items-center bg-nexus-dark z-10 shrink-0">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Bot className="w-5 h-5 text-blue-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">QuickKit AI Architect <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded ml-2 align-middle">PRO</span></h3>
                <div className="flex items-center gap-4 mt-0.5">
                   <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">REF: {sessionRef}</span>
                   <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-widest"><Clock className="w-3 h-3" /> Est. Build: <span className="text-white">{data?.totalDuration || 'Calculating...'}</span></span>
                   <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live Session</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0D1117] scroll-smooth">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
               <div className="relative">
                 <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                 </div>
               </div>
               <p className="font-mono text-blue-400 tracking-widest text-[10px] uppercase font-bold animate-pulse">Analyzing Workflow Logic...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
               
               {/* Chat History (For Refinements) */}
               {chatHistory.length > 2 && (
                 <div className="space-y-4 mb-8 pb-8 border-b border-slate-800/50">
                    {chatHistory.slice(2, -1).map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-slate-800 text-slate-300 rounded-tr-none' 
                                : 'bg-blue-900/10 text-blue-200 rounded-tl-none border border-blue-500/10'
                            }`}>
                                {/* Render User Images if present */}
                                {msg.parts.map((part, pIdx) => (
                                    <div key={pIdx}>
                                        {part.inlineData && (
                                            <img 
                                                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                                                alt="Uploaded context" 
                                                className="w-full max-w-[200px] rounded-lg mb-2 border border-slate-700"
                                            />
                                        )}
                                        {part.text && <p>{part.text}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
               )}

               {/* Architect Insight Message (Main Output) */}
               <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl relative shadow-lg overflow-hidden">
                  <div className="flex gap-4 relative z-10">
                     <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Terminal className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                        <p className="text-blue-100 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                           {displayText}
                           {!existingData && <span className="inline-block w-1 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>}
                        </p>
                        {data?.roiBreakdown && (
                           <p className="mt-4 text-xs text-slate-400 italic border-l-2 border-slate-700 pl-4 py-1">
                             {data.roiBreakdown}
                           </p>
                        )}
                     </div>
                  </div>
               </div>

               {!data?.needsClarification && (
                 <div className="space-y-8 animate-fade-in-up">
                    {/* Financial & ROI Breakdown */}
                    <div className="bg-slate-900/50 border border-nexus-border p-6 rounded-[2rem]">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Efficiency Audit</h2>
                           <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getTierColor(data?.complexityTier || '')}`}>
                              {data?.complexityTier} Plan
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Human Cost Card */}
                           <div className="bg-nexus-card/50 p-5 rounded-2xl border border-red-500/10 group cursor-help relative" title="Cost of a Human VA doing this work manually">
                              <span className="text-[9px] text-slate-600 font-black block mb-1 uppercase tracking-widest flex items-center gap-1.5">
                                <Users2 className="w-3 h-3 text-red-500" /> Manual Labor Cost
                              </span>
                              <span className="text-2xl font-black text-slate-300 line-through decoration-red-500/40">${data?.manualLaborCostEstimate?.toLocaleString()}</span>
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">ESTIMATED ANNUAL DRAIN</p>
                           </div>

                           {/* Net ROI Card */}
                           <div 
                              onClick={() => setShowBreakdown(!showBreakdown)}
                              className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 group cursor-pointer hover:bg-emerald-500/10 transition-all"
                            >
                              <div className="flex justify-between items-start">
                                 <span className="text-[9px] text-emerald-500/70 font-black block mb-1 uppercase tracking-widest flex items-center gap-1.5">
                                   <TrendingDown className="w-3 h-3" /> QuickKit Saved ROI
                                 </span>
                                 <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-emerald-400" />
                              </div>
                              <span className="text-2xl font-black text-emerald-400">${data?.annualRoiEstimate?.toLocaleString()} <span className="text-xs text-slate-500">/yr</span></span>
                              <p className="text-[9px] text-emerald-500 font-mono mt-1 font-bold">NET PROFIT RECLAIMED</p>
                           </div>
                        </div>

                        {/* Expandable Breakdown Details */}
                        {showBreakdown && (
                           <div className="mt-4 p-4 bg-nexus-dark border border-slate-800 rounded-xl animate-fade-in-up">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">How we save you ${data?.annualRoiEstimate.toLocaleString()}</h4>
                              <div className="space-y-2">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Manual Hours Saved</span>
                                    <span className="text-white font-mono">{data?.efficiencySavedHours} hrs/week</span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Equivalent VA Salary ($12/hr)</span>
                                    <span className="text-white font-mono">${data?.manualLaborCostEstimate.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Nexus Maintenance ($100/mo)</span>
                                    <span className="text-red-400 font-mono">-${data?.estimatedMaintenance * 12}</span>
                                 </div>
                                 <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                                    <span className="text-emerald-400 font-black">Your Profit</span>
                                    <span className="text-emerald-400 font-black text-lg">${data?.annualRoiEstimate.toLocaleString()}</span>
                                 </div>
                              </div>
                           </div>
                        )}
                        
                        <div className="mt-6 flex gap-4">
                           <div className="flex-1 bg-nexus-dark/50 p-4 rounded-xl border border-nexus-border">
                              <span className="text-[8px] text-slate-600 font-black block mb-1 uppercase tracking-widest">Initial Setup</span>
                              <span className="text-xl font-bold text-white">${data?.estimatedSetup}</span>
                           </div>
                           <div className="flex-1 bg-nexus-dark/50 p-4 rounded-xl border border-nexus-border">
                              <span className="text-[8px] text-slate-600 font-black block mb-1 uppercase tracking-widest">Monthly Maint.</span>
                              <span className="text-xl font-bold text-blue-400">${data?.estimatedMaintenance}</span>
                           </div>
                        </div>
                    </div>

                    {/* Step Timeline */}
                    <div className="space-y-4 relative pl-4">
                       <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-800"></div>
                       {data?.steps.map((step, idx) => (
                         <div key={idx} className="flex gap-6 group">
                            <div className="shrink-0 relative">
                               <div className="w-10 h-10 rounded-xl bg-nexus-card border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs group-hover:border-blue-500 group-hover:text-white transition-all z-10 relative">
                                  {idx + 1}
                               </div>
                            </div>
                            <div className="flex-1 pb-8">
                               <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs">{step.title}</h4>
                                  <span className="text-[8px] font-mono text-slate-600 bg-slate-800 px-2 py-0.5 rounded">{step.duration}</span>
                               </div>
                               <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{step.description}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer Interaction Area */}
        <div className="p-6 border-t border-nexus-border bg-nexus-dark z-20 shrink-0">
           {!loading && (
              <div className="max-w-3xl mx-auto space-y-4">
                 <div className="relative">
                    {/* Hidden File Input */}
                    <input 
                       type="file" 
                       accept="image/*"
                       ref={fileInputRef}
                       onChange={handleImageSelect}
                       className="hidden"
                    />

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="absolute bottom-full left-0 mb-3 ml-2 flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 animate-fade-in">
                            <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="h-12 w-12 rounded object-cover" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400">Image attached</span>
                                <button onClick={() => setSelectedImage(null)} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                        </div>
                    )}

                    <input 
                       value={userInput}
                       onChange={(e) => setUserInput(e.target.value)}
                       placeholder="Ask to refine, or upload a workflow screenshot..."
                       className="w-full bg-nexus-card border border-nexus-border rounded-xl py-4 pl-12 pr-44 text-white focus:border-blue-500 outline-none transition-all font-mono text-xs placeholder:text-slate-600"
                       onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                    />
                    
                    {/* Attachment Button */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3 top-3.5 p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800"
                        title="Upload Workflow Screenshot"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Send / Refine Button */}
                    <button 
                       onClick={handleRefine}
                       disabled={(!userInput.trim() && !selectedImage) || refining}
                       className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-[10px] transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-tighter"
                    >
                       {refining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3" /> Refine</>}
                    </button>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={onClose} className="px-8 py-4 border border-nexus-border text-slate-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest">Exit</button>
                    <button 
                       onClick={handleProceedToBooking}
                       disabled={loading || refining || data?.needsClarification}
                       className="flex-1 py-4 bg-white text-nexus-dark font-black rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 text-sm uppercase disabled:opacity-20"
                    >
                       {data?.needsClarification ? "Architect Waiting..." : "PROCEED TO DEPLOYMENT"} <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
