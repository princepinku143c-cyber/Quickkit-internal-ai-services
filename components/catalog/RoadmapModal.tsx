
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
  isWidget?: boolean; // Renders as smaller floating widget instead of full modal
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

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ item, customPrompt, currency, existingData, existingHistory, sessionRef, isWidget, onSaveState, onClose, onBook }) => {
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
  
  const AI_MODEL = 'gemini-2.5-flash-lite'; // Newest cheap/fast model

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
    // Differentiation: if customPrompt exists and item does not, it's a Custom Project Scoping request.
    const isCustomProject = !item;

    return `You are Kelly, an AI Solutions Architect and expert Consultant for our Premium AI Automation Agency.

CRITICAL INSTRUCTIONS:
1. TIMELINE: We run on the powerful "OpenClaw Framework". The total project deployment time is ALWAYS 2 to 4 DAYS maximum. NEVER predict weeks or months. 
2. SPEED & CONCISENESS: Keep your 'chatResponse' extremely crispy, brief, and conversational (1-2 short sentences max). This ensures instant generation speed. Do NOT write paragraphs!
3. ROLE: Ask 1 precise follow-up question per turn to gather requirements, acting as a professional tech consultant.
4. When they give enough details, acknowledge it, give a final roadmap in 'steps' json, and say they can click "Finalize Architecture" to begin setup.

---
BUSINESS MODEL & PRICING (USD):
- SIMPLE (Starter): $799 setup. Maintenance: $100/month
- INTERMEDIATE (Pro): $1599 setup. Maintenance: $199/month
- ADVANCED/ENTERPRISE: $3499 setup. Maintenance: $299/month

${isCustomProject ? 'This is a Custom Project. Focus purely on understanding what they want to build and suggesting AI architectures (like OpenClaw + LLMs).' : 'This is a standard catalog service. You can mention the exact pricing tiers ABOVE if asked, but prioritize discussing the implementation and features first.'}

YOUR CONVERSATION STYLE (chatResponse):
- Provide quick, 1-2 line snappy conversational responses.
- Use emojis naturally but sparingly (e.g., 🚀, 💡, ⚡).
- DO NOT use rigid bolded formats in chat. Focus on normal chatting!

JSON OUTPUT FORMAT REQUIREMENTS (NO MARKDOWN TEXT OUTSIDE THE JSON):
- 'chatResponse': Your short 1-2 sentence conversational response to the user.
- 'steps': Provide an adaptive 3-step technical workflow mimicking a real roadmap (e.g., Phase 1: Planning, Phase 2: OpenClaw Setup, Phase 3: Go-Live). Make sure step duration says something like '1 Day' or 'Hours'.
- 'totalDuration': explicitly state something like "2-4 Days".
- 'roiBreakdown': One punchy sentence on how this saves time/money.
- 'complexityTier': "SIMPLE", "INTERMEDIATE", "ADVANCED", "ENTERPRISE", or "CUSTOM".
- 'estimatedSetup' & 'estimatedMaintenance': Number matching the tier.
- 'isCustomEstimate': true ONLY for custom project.
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
                isCustomEstimate: { type: Type.BOOLEAN },
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
      setChatHistory([
        { role: 'user', parts: [{ text: initialRequest }] },
        { role: 'model', parts: [{ text: "🚨 Connection Interrupted: Gemini API Key Limit Exceeded / Invalid. Please upgrade your key or check logs." }] }
      ]);
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
                isCustomEstimate: { type: Type.BOOLEAN },
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
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "🚨 Network Error: Gemini quota exceeded during refinement." }] }]);
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
          generatedAt: new Date().toISOString(),
          isCustomEstimate: data.isCustomEstimate
      };

      onBook(quote, chatHistory);
  };

  const getTierColor = (tier: string) => {
    if (tier === 'SIMPLE') return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
    if (tier === 'INTERMEDIATE') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    if (tier === 'ADVANCED') return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
    if (tier === 'CUSTOM') return 'text-fuchsia-400 border-fuchsia-400/20 bg-fuchsia-400/10';
    return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
  };

  if (isWidget) {
    return (
      <div className="fixed bottom-24 right-6 z-[60] w-[400px] h-[600px] max-h-[80vh] bg-nexus-card border border-nexus-border rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans border-t-blue-500/30 animate-fade-in origin-bottom-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-nexus-border flex justify-between items-center bg-nexus-dark z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Bot className="w-5 h-5 text-blue-400" />
             </div>
             <div>
                <h3 className="text-base font-black text-white uppercase tracking-tighter">Kelly <span className="hidden sm:inline text-[10px] bg-blue-600 px-2 py-0.5 rounded ml-2">PRO</span></h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#0D1117] scroll-smooth">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center pt-10">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Calculating...</h2>
                <p className="font-mono text-blue-400 tracking-widest text-[10px] uppercase font-bold animate-pulse">Initializing Agent...</p>
             </div>
          ) : (
            <div className="w-full space-y-6 pb-6 animate-fade-in">
                
                {chatHistory.length > 2 && data && data.steps && data.steps.length > 0 && (
                  <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700 mb-6 shadow-inner animate-fade-in border-l-4 border-l-blue-500">
                      <h4 className="text-[10px] font-bold text-white mb-2 flex justify-between items-center uppercase font-mono tracking-widest">
                         <span className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-blue-400" /> Live Mini-Map</span>
                         <span className="text-emerald-400">{data.totalDuration || '2-4 Days'}</span>
                      </h4>
                      <div className="space-y-2">
                          {data.steps.slice(0,3).map((s, i) => (
                             <div key={i} className="flex gap-2 text-[11px] bg-slate-900/50 p-2 rounded-lg">
                                <div className="text-emerald-500 font-black shrink-0 mt-0.5"><div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-[9px] border border-emerald-500/20">{i+1}</div></div>
                                <div><span className="text-slate-200 font-bold block">{s.title}</span> <span className="text-slate-500 leading-tight block">{s.description} • {s.duration}</span></div>
                             </div>
                          ))}
                      </div>
                  </div>
                )}

                {chatHistory.map((msg, idx) => {
                    let textToShow = msg.parts[0]?.text || '';
                    if (idx === 0 && textToShow.startsWith('Custom Build:')) textToShow = textToShow.replace('Custom Build: ', '');
                    if (idx === 0 && textToShow.startsWith('Service:')) textToShow = "I'm interested in the " + textToShow.replace('Service: ', '') + " service.";

                    return (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                                : 'bg-nexus-card border border-nexus-border text-slate-300 rounded-tl-none shadow-lg'
                            }`}>
                                {msg.parts.map((part, pIdx) => (
                                    <div key={pIdx}>
                                        {part.inlineData && (
                                            <img src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} className="w-full rounded-lg mb-2 border border-slate-700 shadow-sm" />
                                        )}
                                        {part.text && (
                                              <p className="whitespace-pre-wrap font-sans">
                                                {idx === 0 ? textToShow : part.text}
                                                {msg.role === 'model' && idx === chatHistory.length - 1 && !data && <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-400 animate-pulse align-middle"></span>}
                                              </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {refining && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl bg-nexus-card border border-nexus-border text-slate-400 rounded-tl-none shadow-lg flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Footer Input Area */}
        <div className="p-4 border-t border-nexus-border bg-nexus-dark z-20 shrink-0">
           {!loading && (
              <div className="space-y-3">
                 <div className="relative">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                    {selectedImage && (
                        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                            <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="h-8 w-8 rounded object-cover" />
                            <button onClick={() => setSelectedImage(null)} className="text-[10px] text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    )}
                    <input 
                       value={userInput}
                       onChange={(e) => setUserInput(e.target.value)}
                       placeholder="Type your message..."
                       className="w-full bg-nexus-card border border-nexus-border rounded-xl py-3 pl-10 pr-12 text-white focus:border-blue-500 outline-none text-xs placeholder:text-slate-600"
                       onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition">
                       <ImageIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleRefine} disabled={!userInput.trim() && !selectedImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                       <Zap className="w-4 h-4" />
                    </button>
                 </div>
                 {data && data.estimatedSetup > 0 && (
                    <button onClick={handleProceedToBooking} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                       <ShieldCheck className="w-4 h-4" /> Finalize Architecture
                    </button>
                 )}
              </div>
           )}
        </div>
      </div>
    );
  }

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
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Kelly <span className="text-[10px] text-slate-400 font-mono tracking-widest ml-2">AI Solutions Architect</span> <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded ml-2 align-middle">PRO</span></h3>
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
                      {/* Pure Chat Interface */}
               <div className="space-y-6 mb-8 pb-8">
                  {chatHistory.map((msg, idx) => {
                      // Skip internal system-like prefixes if we want, or just show them.
                      // The first message has the prompt (e.g. "Custom Build: ...")
                      let textToShow = msg.parts[0]?.text || '';
                      if (idx === 0 && textToShow.startsWith('Custom Build:')) {
                           textToShow = textToShow.replace('Custom Build: ', '');
                      }
                      if (idx === 0 && textToShow.startsWith('Service:')) {
                           textToShow = "I'm interested in the " + textToShow.replace('Service: ', '') + " service.";
                      }

                      return (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${
                                  msg.role === 'user' 
                                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                                  : 'bg-nexus-card border border-nexus-border text-slate-300 rounded-tl-none shadow-lg'
                              }`}>
                                  {/* Render User Images if present */}
                                  {msg.parts.map((part, pIdx) => (
                                      <div key={pIdx}>
                                          {part.inlineData && (
                                              <img 
                                                  src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                                                  alt="Uploaded context" 
                                                  className="w-full max-w-[250px] rounded-xl mb-3 border border-slate-700 shadow-md"
                                              />
                                          )}
                                          {part.text && (
                                               <p className="whitespace-pre-wrap font-sans">
                                                  {idx === 0 ? textToShow : part.text}
                                                  {msg.role === 'model' && idx === chatHistory.length - 1 && !data && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>}
                                               </p>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
                  {refining && (
                     <div className="flex justify-start">
                         <div className="max-w-[80%] p-5 rounded-3xl bg-nexus-card border border-nexus-border text-slate-400 rounded-tl-none shadow-lg flex items-center gap-3">
                             <div className="flex gap-1">
                                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                             </div>
                             <span className="text-xs font-mono">Kelly is typing...</span>
                         </div>
                     </div>
                  )}
               </div>
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
                       {data?.needsClarification ? "Architect Waiting..." : data?.isCustomEstimate ? "REQUEST CUSTOM PROPOSAL" : "PROCEED TO DEPLOYMENT"} <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
