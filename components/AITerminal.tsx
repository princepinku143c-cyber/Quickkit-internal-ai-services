import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Terminal, Send, Loader2, Bot, Server, Shield, Zap, Trash2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AITerminalProps {
  user: UserProfile;
}

interface LogEntry {
  role: 'system' | 'user' | 'agent' | 'error';
  text: string;
  time: string;
}

const SYSTEM_PERSONA = `You are "QuickKit Agent", a Senior AI Infrastructure Specialist. You help business owners automate operations.

RULES:
- You answer in a professional but friendly tone.
- If a user asks to run a server command, describe what the script would do. Do NOT output raw bash.
- If a user asks about credits/billing, explain QuickKit pricing.
- Keep answers concise (max 4-5 sentences).
- You can help with: lead generation, email campaigns, data scraping strategy, CRM setup, VPS health checks, API integrations.
- If you don't know something, say so honestly.`;

const STORAGE_KEY = 'ai_terminal_logs';

export const AITerminal: React.FC<AITerminalProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      role: 'system' as const,
      text: 'QuickKit Agent v2.0 online. Type any instruction in normal language.',
      time: new Date().toLocaleTimeString()
    }];
  });

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(logs));
  }, [logs, user.uid]);

  // Auto-scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load Gemini key from Firebase on mount
  useEffect(() => {
    const loadKey = async () => {
      if (!db || Object.keys(db).length === 0) return;
      try {
        const docRef = doc(db as any, 'business_configs', 'biz_1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.apiData?.geminiKey) {
            setGeminiKey(data.apiData.geminiKey);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load API key from Firebase:", e);
      }
      setKeyError(true);
    };
    loadKey();
  }, []);

  const addLog = (role: LogEntry['role'], text: string) => {
    setLogs(prev => [...prev, { role, text, time: new Date().toLocaleTimeString() }]);
  };

  const clearHistory = () => {
    const fresh: LogEntry[] = [{
      role: 'system',
      text: 'Chat history cleared. QuickKit Agent ready.',
      time: new Date().toLocaleTimeString()
    }];
    setLogs(fresh);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput('');
    addLog('user', command);
    setIsProcessing(true);

    // Credit check
    const currentBonus = Number(localStorage.getItem('bonusCredits')) || 0;
    const totalCredits = user.credits + currentBonus;
    if (totalCredits < 5) {
      addLog('error', 'Insufficient credits (need 5). Please top up your Credit Wallet first.');
      setIsProcessing(false);
      return;
    }

    // Check for API key
    if (!geminiKey) {
      addLog('error', 'Gemini API Key not configured. Go to Settings → Secure API Configuration to add your key.');
      setIsProcessing(false);
      return;
    }

    try {
      // Build conversation context (last 10 messages for memory)
      const recentLogs = logs.filter(l => l.role === 'user' || l.role === 'agent').slice(-10);
      const historyFormatted = recentLogs.map(l => 
        `${l.role === 'user' ? 'User' : 'Agent'}: ${l.text}`
      ).join('\n');

      const fullPrompt = `${SYSTEM_PERSONA}\n\n--- CONVERSATION HISTORY ---\n${historyFormatted}\n\nUser: ${command}\n\nAgent:`;

      // Call Gemini API
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
      });

      const reply = response.text || 'I received your request but couldn\'t generate a response. Please try again.';

      // Deduct credits
      if (currentBonus >= 5) {
        localStorage.setItem('bonusCredits', String(currentBonus - 5));
        window.dispatchEvent(new Event('storage'));
      }

      addLog('agent', reply);

    } catch (err: any) {
      const errMsg = err?.message || 'Unknown error';
      if (errMsg.includes('API_KEY') || errMsg.includes('401') || errMsg.includes('403')) {
        addLog('error', `API Key Error: Your Gemini key may be invalid or expired. Please update it in Settings.`);
      } else if (errMsg.includes('429') || errMsg.includes('quota')) {
        addLog('error', `Rate Limited: Too many requests. Please wait a moment and try again.`);
      } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
        addLog('error', `Network Error: Could not reach Gemini servers. Check your internet connection.`);
      } else {
        addLog('error', `System Error: ${errMsg}`);
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4">
      <div className="flex-none flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Terminal className="text-blue-500 w-5 h-5" /></div> AI Agent
          </h1>
          <p className="text-slate-500 text-sm mt-1">Powered by Gemini Intelligence. Chat saves automatically.</p>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {keyError && (
        <div className="flex-none flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No Gemini API Key configured. Go to <strong>Settings → Secure API Configuration</strong> to connect your AI intelligence.</span>
        </div>
      )}

      <div className="flex-1 bg-black/60 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col font-mono text-sm relative">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0B1120] border-b border-[#1e293b]">
            <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
               quickkit-agent@gemini-2.0-flash — {logs.filter(l => l.role === 'user').length} queries this session
            </div>
        </div>

        {/* Console Window */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
           {logs.map((log, idx) => (
             <div key={idx} className="flex gap-3 animate-fade-in">
               <span className="text-slate-700 shrink-0 text-[10px] mt-1 w-14 hidden sm:block">{log.time}</span>
               <div className="flex-1 min-w-0">
                 {log.role === 'user' && (
                    <div className="flex gap-2">
                       <span className="text-emerald-400 font-bold shrink-0 text-xs">YOU →</span> 
                       <span className="text-blue-300 break-words">{log.text}</span>
                    </div>
                 )}
                 {log.role === 'system' && (
                    <div className="flex items-start gap-2 text-slate-500 text-xs">
                      <Shield className="w-3 h-3 shrink-0 mt-0.5" /> <span>{log.text}</span>
                    </div>
                 )}
                 {log.role === 'agent' && (
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 mt-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1.5">
                        <Bot className="w-3.5 h-3.5" /> QuickKit Agent
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{log.text}</div>
                    </div>
                 )}
                 {log.role === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-1">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" /> {log.text}
                      </div>
                    </div>
                 )}
               </div>
             </div>
           ))}
           {isProcessing && (
             <div className="flex gap-3 items-center pt-2">
                 <span className="w-14 hidden sm:block"></span>
                 <div className="flex items-center gap-2 text-purple-400 text-xs">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="animate-pulse">Agent is thinking...</span>
                 </div>
             </div>
           )}
           <div ref={logsEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-[#0B1120] border-t border-[#1e293b]">
           <div className="relative flex items-center">
              <Zap className="absolute left-4 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Ask anything... 'Set up a lead gen workflow', 'Explain my billing', 'Check server status'"
                className="w-full bg-[#0f172a] text-white border border-[#1e293b] rounded-xl pl-12 pr-14 py-3.5 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 text-sm"
              />
              <button 
                type="submit" 
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
              >
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
           <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-slate-600">Cost: 5 credits per query</span>
              <span className="text-[10px] text-slate-600">Memory: last 10 messages</span>
           </div>
        </form>
      </div>
    </div>
  );
};
