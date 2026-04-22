import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { Terminal, Send, Loader2, Bot, Shield, Zap, Server, Trash2, AlertTriangle, ChevronDown, Sparkles, DollarSign, RefreshCw } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { apiCall } from '../lib/api';

interface AITerminalProps {
  user: UserProfile;
}

interface LogEntry {
  id?: string;
  role: 'system' | 'user' | 'agent' | 'error';
  text: string;
  time: string;
  model?: string;
  cost?: number;
  cmdPreview?: string;
  cmdStatus?: 'pending' | 'running' | 'success' | 'failed' | 'blocked';
  cmdResult?: string;
}

interface ModelInfo {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
}

const SYSTEM_PERSONA = `You are "QuickKit Agent", an advanced AI Operating System working inside an enterprise CRM with direct VPS execution privileges.

RULES:
- Answer in a professional but friendly tone.
- If a user asks to run a server command (e.g. "restart server", "check uptime", "list files", "deploy app"), you MUST put the EXACT corresponding linux command inside <command></command> tags.
- Example: "Here is the command to restart the server: <command>pm2 restart all</command>"
- Keep answers concise (max 2-3 sentences).
- If you don't know something, say so honestly.`;

const STORAGE_KEY = 'ai_terminal_logs';
const MODEL_STORAGE_KEY = 'ai_terminal_model';

const POPULAR_MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash-preview',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct'
];

export const AITerminal: React.FC<AITerminalProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-001');
  const [apiKey, setApiKey] = useState<string>(''); // LOADED FROM DB
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [popularModels, setPopularModels] = useState<ModelInfo[]>([]);
  const [otherModels, setOtherModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [keyError, setKeyError] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initial Logs
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        setLogs([]);
      }
    } else {
      setLogs([{
        id: 'init',
        role: 'system',
        text: 'QuickKit AI OS initialized. Ready for command input.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    // 2. Load Selected Model
    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) setSelectedModel(savedModel);

    // 3. Fetch Models List
    fetchModels();

    // 4. LOAD SETTINGS (CRITICAL FIX)
    const loadSettings = async () => {
        try {
            const docRef = doc(db as any, 'users', user.uid, 'private', 'settings');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.openrouterApiKey) {
                    setApiKey(data.openrouterApiKey);
                } else {
                    console.warn("API Key found but field 'openrouterApiKey' is missing in subcollection.");
                }
            } else {
                console.warn("No private settings found for this user.");
            }
        } catch (e) {
            console.error("Failed to load settings in Terminal:", e);
        }
    };
    loadSettings();
  }, [user.uid]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    scrollToBottom();
  }, [logs, selectedModel]);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchModels = async () => {
    setModelsLoading(true);
    setKeyError(false);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      if (data.data) {
        const all: ModelInfo[] = data.data;
        const pop = all.filter(m => POPULAR_MODELS.includes(m.id));
        const rest = all.filter(m => !POPULAR_MODELS.includes(m.id));
        setModels(all);
        setPopularModels(pop);
        setOtherModels(rest);
      }
    } catch (e) {
      console.error("Failed to fetch models:", e);
    } finally {
      setModelsLoading(false);
    }
  };

  const updateLog = (id: string, updates: Partial<LogEntry>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const addLog = (entry: LogEntry) => {
    setLogs(prev => [...prev, { ...entry, id: entry.id || Math.random().toString(36).substr(2, 9) }]);
  };

  const handleExecute = async (logId: string, command: string) => {
    updateLog(logId, { cmdStatus: 'running' });
    try {
      const res = await apiCall('/api/execute', { command });
      updateLog(logId, { 
        cmdStatus: 'success', 
        cmdResult: res.output || 'Success (No output)' 
      });
      addLog({
        role: 'system',
        text: `Command executed successfully. 10 credits deducted.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (e: any) {
      updateLog(logId, { cmdStatus: 'failed', cmdResult: e.message });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    if (!apiKey) {
        addLog({
          role: 'error',
          text: 'OpenRouter API Key missing. Please set it in Settings → AI Provider Key.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setKeyError(true);
        return;
    }

    const userMsg = input.trim();
    setInput('');
    addLog({
      role: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setIsProcessing(true);
    setKeyError(false);
    
    try {
      // Prepare Context
      const history = logs.slice(-12).map(l => ({
        role: l.role === 'user' ? 'user' : 'assistant',
        content: l.text
      }));

      // Call AI
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://quickkitai.com",
          "X-Title": "QuickKit AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: SYSTEM_PERSONA },
            ...history,
            { role: "user", content: userMsg }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'AI request failed');

      const text = data.choices[0].message.content;
      const cost = data.usage?.total_cost || 0;

      const cmdMatch = text.match(/<command>([\s\S]*?)<\/command>/);
      const cmdPreview = cmdMatch ? cmdMatch[1].trim() : undefined;

      addLog({
        role: 'agent',
        text: text.replace(/<command>[\s\S]*?<\/command>/g, '').trim() || (cmdPreview ? `Command suggested: ${cmdPreview}` : ''),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model,
        cost: cost,
        cmdPreview,
        cmdStatus: cmdPreview ? 'pending' : undefined
      });

    } catch (e: any) {
      addLog({
        role: 'error',
        text: `AI Error: ${e.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getModelDisplayName = (id: string) => {
    if (id === 'auto') return 'Auto Strategy';
    return id.split('/').pop()?.toUpperCase() || id;
  };

  if (!logs || !Array.isArray(logs)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-700 bg-[#030712] p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs uppercase tracking-widest font-black text-slate-500">Initializing Terminal Logs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Model Selector Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
        <div className="relative">
          <button 
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-100">{getModelDisplayName(selectedModel)}</span>
            <ChevronDown className={`w-3 h-3 text-blue-400 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {showModelPicker && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#020617] border border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              {popularModels.length > 0 && (
                <>
                  <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-[#0a0f1c]">Recommended</div>
                  {popularModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-500/10 transition-colors ${selectedModel === m.id ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300'}`}
                    >
                      <span className="truncate max-w-[200px]">{m.name}</span>
                    </button>
                  ))}
                </>
              )}
              {otherModels.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-[#0a0f1c] flex items-center justify-between">
                    <span>All Models</span>
                    <button onClick={(e) => { e.stopPropagation(); fetchModels(); }}>
                      <RefreshCw className={`w-3 h-3 ${modelsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {otherModels.slice(0, 50).map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[10px] flex items-center justify-between hover:bg-blue-500/10 transition-colors ${selectedModel === m.id ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400'}`}
                    >
                      <span className="truncate max-w-[200px]">{m.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-600">
          {models.length > 0 ? `${models.length} models available` : modelsLoading ? 'Loading models...' : ''}
        </span>
      </div>

      {keyError && (
        <div className="flex-none flex items-center gap-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No API key configured. <strong>Settings → AI Provider Key (OpenRouter)</strong></span>
        </div>
      )}

      <div className="flex-1 bg-black/60 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col font-mono text-sm relative min-h-0">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1120] border-b border-[#1e293b]">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
               quickkit-agent@{selectedModel.split('/').pop() || 'openrouter'}
            </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
           {logs?.map((log, idx) => (
               <div key={log.id || idx} className="flex gap-2.5 animate-fade-in">
                 <span className="text-slate-700 shrink-0 text-[9px] mt-1 w-12 hidden sm:block">{log.time}</span>
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
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px]">
                            <Bot className="w-3 h-3" /> QuickKit Agent
                          </div>
                          <div className="flex items-center gap-2">
                            {log.model && <span className="text-[9px] text-slate-600 font-normal">{log.model.split('/').pop()}</span>}
                            {log.cost !== undefined && log.cost > 0 && <span className="text-[9px] text-emerald-500/70 bg-emerald-500/5 px-1.5 py-0.5 rounded">${log.cost.toFixed(6)}</span>}
                          </div>
                        </div>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{log.text}</div>
                        {log.cmdPreview && (
                          <div className="mt-3 bg-[#050810] border border-[#1e293b] rounded-lg overflow-hidden shadow-inner">
                             <div className="bg-[#0B1120] px-3 py-1.5 flex justify-between items-center text-[10px] font-bold text-slate-400">
                               <span>Suggested Command</span>
                               {log.cmdStatus === 'blocked' && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> BLOCKED</span>}
                             </div>
                             <div className="p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto">$ {log.cmdPreview}</div>
                             {log.cmdStatus === 'pending' && (
                                <div className="p-2.5 bg-[#0B1120]/50 flex gap-2 justify-end border-t border-[#1e293b]">
                                   <button onClick={() => updateLog(log.id!, { cmdStatus: 'failed', cmdResult: 'Cancelled.' })} className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">Cancel</button>
                                   <button onClick={() => handleExecute(log.id!, log.cmdPreview!)} className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/30 flex items-center gap-1.5 shadow-sm active:scale-95">
                                      <Terminal className="w-3 h-3"/> Execute (10 Credits)
                                   </button>
                                </div>
                             )}
                             {log.cmdStatus === 'running' && (
                                <div className="p-3 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2 text-amber-400 text-[11px] font-mono"><Loader2 className="w-3.5 h-3.5 animate-spin"/> [Running on VPS...]</div>
                             )}
                             {(log.cmdStatus === 'success' || log.cmdStatus === 'failed') && log.cmdResult && (
                                <div className={`p-3 border-t font-mono text-[11px] whitespace-pre-wrap overflow-x-auto max-h-48 custom-scrollbar ${log.cmdStatus === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                                    {log.cmdStatus === 'success' ? <span className="font-bold">[SUCCESS]</span> : <span className="font-bold">[ERROR]</span>}<br/>{log.cmdResult}
                                </div>
                             )}
                          </div>
                        )}
                      </div>
                   )}
                   {log.role === 'error' && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 mt-1 text-red-400 font-bold text-xs flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {log.text}
                      </div>
                   )}
                 </div>
               </div>
           ))}
           {isProcessing && (
             <div className="flex gap-2.5 items-center pt-1">
                 <span className="w-12 hidden sm:block"></span>
                 <div className="flex items-center gap-2 text-purple-400 text-xs">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="animate-pulse">Thinking via {getModelDisplayName(selectedModel)}...</span>
                 </div>
             </div>
           )}
           <div ref={logsEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-[#0B1120] border-t border-[#1e293b]">
           <div className="relative flex items-center">
              <Zap className="absolute left-3 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Ask anything... 'Set up lead gen', 'Explain billing', 'Help me automate'"
                className="w-full bg-[#0f172a] text-white border border-[#1e293b] rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 text-sm"
              />
              <button type="submit" disabled={isProcessing || !input.trim()} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
           <div className="flex items-center justify-between mt-1.5 px-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><Bot className="w-3 h-3 text-blue-400"/> Chat: <span className="text-emerald-400">2cr</span></span> | 
                  <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-purple-400"/> Command: <span className="text-emerald-400">5cr</span></span>
              </span>
              <span>Memory: 12 messages</span>
           </div>
        </form>
      </div>
    </div>
  );
};
