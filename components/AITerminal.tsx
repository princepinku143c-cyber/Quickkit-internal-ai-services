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

const ALLOWED_COMMANDS = ["ls", "pwd", "whoami", "uptime", "df", "free", "pm2", "top", "cat", "echo"];
const BLOCKED_COMMANDS = ["rm -rf", "shutdown", "reboot", "mkfs", "dd", "chmod -R 777", "chown -R"];

const STORAGE_KEY = 'ai_terminal_logs';
const MODEL_STORAGE_KEY = 'ai_terminal_model';

// Curated popular models (shown first in dropdown)
const POPULAR_MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash-preview',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'anthropic/claude-3.5-haiku',
  'anthropic/claude-3.5-sonnet',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen3-8b:free',
];

export const AITerminal: React.FC<AITerminalProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || 'auto');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [totalSessionCost, setTotalSessionCost] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      role: 'system' as const,
      text: 'QuickKit Agent v3.0 (OpenRouter) online. 200+ AI models available. Type any instruction.',
      time: new Date().toLocaleTimeString()
    }];
  });

  // Save logs on change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(logs.slice(-100))); // Keep last 100
  }, [logs, user.uid]);

  // Save selected model
  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  // Auto-scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Close model picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load API key from per-user Firebase settings
  useEffect(() => {
    const loadKey = async () => {
      if (!db || Object.keys(db).length === 0 || !user.uid) return;
      try {
        const docRef = doc(db as any, 'users', user.uid, 'private', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.apiKey) {
            setApiKey(data.apiKey);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load API key:", e);
      }
      setKeyError(true);
    };
    loadKey();
  }, [user.uid]);

  // Fetch models list from OpenRouter
  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      if (data.data) {
        const parsed: ModelInfo[] = data.data
          .filter((m: any) => m.id && m.pricing)
          .map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            pricing: m.pricing || { prompt: '0', completion: '0' },
            context_length: m.context_length || 4096
          }))
          .sort((a: ModelInfo, b: ModelInfo) => {
            // Popular models first
            const aPopular = POPULAR_MODELS.indexOf(a.id);
            const bPopular = POPULAR_MODELS.indexOf(b.id);
            if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
            if (aPopular !== -1) return -1;
            if (bPopular !== -1) return 1;
            return a.name.localeCompare(b.name);
          });
        setModels(parsed);
      }
    } catch (e) {
      console.warn("Failed to fetch models:", e);
    }
    setModelsLoading(false);
  }, []);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const addLog = (entry: Omit<LogEntry, 'time' | 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setLogs(prev => [...prev, { ...entry, time: new Date().toLocaleTimeString(), id }]);
  };

  const updateLog = (id: string, updates: Partial<LogEntry>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const validateCommand = (cmd: string) => {
    let safe = true;
    let blockedReason = '';

    for (const bad of BLOCKED_COMMANDS) {
      if (cmd.includes(bad)) {
         safe = false;
         blockedReason = `Dangerous command blocked (${bad})`;
         break;
      }
    }
    
    if (safe) {
      let isAllowed = false;
      for (const allowed of ALLOWED_COMMANDS) {
        if (cmd.trim().startsWith(allowed)) {
           isAllowed = true;
           break;
        }
      }
      if (!isAllowed) {
         safe = false;
         blockedReason = `Command not in whitelist (${cmd.split(' ')[0]}). Cannot execute.`;
      }
    }
    return { safe, blockedReason };
  };

  const handleExecute = async (logId: string, cmd: string) => {
    const currentBonus = Number(localStorage.getItem('bonusCredits')) || 0;
    if (user.credits + currentBonus < 10) {
      updateLog(logId, { cmdStatus: 'failed', cmdResult: 'Insufficient credits. VPS execution requires 10 credits.' });
      return;
    }

    if (!db || !user.uid) return;
    
    updateLog(logId, { cmdStatus: 'running' });

    try {
        const docRef = doc(db as any, 'users', user.uid, 'private', 'settings');
        const docSnap = await getDoc(docRef);
        let endpoint = '', token = '';
        if (docSnap.exists()) {
             const d = docSnap.data();
             endpoint = d.vpsEndpoint;
             token = d.vpsToken;
        }

        if (!endpoint || !token) {
             updateLog(logId, { cmdStatus: 'failed', cmdResult: 'VPS Endpoint or Token not configured in Settings.' });
             return;
        }

        const data = await apiCall('/api/execute', { 
            command: cmd, 
            devEndpoint: endpoint, // Fallback if server ENV is missing
            devToken: token 
        }).catch((e: any) => {
            updateLog(logId, { cmdStatus: 'failed', cmdResult: e.message || 'Execution Error.' });
            return null;
        });
        
        if (!data) return;

        const out = data.output || data.message || JSON.stringify(data);

        updateLog(logId, { cmdStatus: 'success', cmdResult: out });
    } catch(err: any) {
        updateLog(logId, { cmdStatus: 'failed', cmdResult: err.message || 'Execution error.' });
    }
  };

  const clearHistory = () => {
    setLogs([{
      role: 'system',
      text: 'Chat history cleared. QuickKit Agent ready.',
      time: new Date().toLocaleTimeString()
    }]);
    setTotalSessionCost(0);
  };

  const getAutoModel = (): string => {
    return 'google/gemini-2.0-flash-001'; // Cheapest smart model
  };

  const getModelDisplayName = (id: string): string => {
    if (id === 'auto') return '⚡ Auto';
    const m = models.find(m => m.id === id);
    return m?.name || id.split('/').pop() || id;
  };

  const getModelPrice = (id: string): string => {
    const m = models.find(m => m.id === id);
    if (!m) return '';
    const promptCost = parseFloat(m.pricing.prompt) * 1000000;
    if (promptCost === 0) return 'FREE';
    return `$${promptCost.toFixed(2)}/M`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput('');
    addLog({ role: 'user', text: command });
    setIsProcessing(true);

    // Credit check
    const currentBonus = Number(localStorage.getItem('bonusCredits')) || 0;
    if (user.credits + currentBonus < 5) {
      addLog({ role: 'error', text: 'Insufficient credits (need 5). Top up your Credit Wallet.' });
      setIsProcessing(false);
      return;
    }

    if (!apiKey) {
      addLog({ role: 'error', text: 'No API key configured. Go to Settings → AI Provider Key (OpenRouter) to add your key.' });
      setIsProcessing(false);
      return;
    }

    const activeModel = selectedModel === 'auto' ? getAutoModel() : selectedModel;

    try {
      // Build conversation context (last 12 messages)
      const recentLogs = logs.filter(l => l.role === 'user' || l.role === 'agent').slice(-12);
      const messages = [
        { role: 'system', content: SYSTEM_PERSONA },
        ...recentLogs.map(l => ({
          role: l.role === 'user' ? 'user' : 'assistant',
          content: l.text
        })),
        { role: 'user', content: command }
      ];

      // Call OpenRouter API
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://quickkitai.com',
          'X-Title': 'QuickKit AI CRM'
        },
        body: JSON.stringify({
          model: activeModel,
          messages,
          max_tokens: 1024,
          temperature: 0.7
        })
      });

      const data = await res.json();

      if (data.error) {
        const errMsg = data.error.message || JSON.stringify(data.error);
        if (errMsg.includes('rate') || errMsg.includes('429')) {
          addLog({ role: 'error', text: 'Rate limited. Wait a moment and try again.' });
        } else if (errMsg.includes('key') || errMsg.includes('auth') || errMsg.includes('401')) {
          addLog({ role: 'error', text: 'Invalid API Key. Update it in Settings → AI Provider Key.' });
        } else if (errMsg.includes('insufficient') || errMsg.includes('credits') || errMsg.includes('balance')) {
          addLog({ role: 'error', text: 'OpenRouter balance exhausted. Add funds at openrouter.ai/credits' });
        } else {
          addLog({ role: 'error', text: `API Error: ${errMsg}` });
        }
        setIsProcessing(false);
        return;
      }

      let reply = data.choices?.[0]?.message?.content || 'No response generated.';
      
      let cmdPreview: string | undefined = undefined;
      let cmdStatus: LogEntry['cmdStatus'] = undefined;
      let cmdResult: string | undefined = undefined;

      const cmdMatch = reply.match(/<command>([\s\S]*?)<\/command>/i);
      if (cmdMatch && cmdMatch[1]) {
         cmdPreview = cmdMatch[1].trim();
         const validation = validateCommand(cmdPreview);
         if (!validation.safe) {
             cmdStatus = 'blocked';
             cmdResult = validation.blockedReason;
         } else {
             cmdStatus = 'pending';
         }
         reply = reply.replace(/<command>[\s\S]*?<\/command>/ig, '').trim();
         if (!reply) reply = "Command generated for review:";
      }

      // Extract cost from response
      const queryCost = data.usage 
        ? (Number(data.usage.prompt_tokens || 0) * parseFloat(models.find(m => m.id === activeModel)?.pricing.prompt || '0') +
           Number(data.usage.completion_tokens || 0) * parseFloat(models.find(m => m.id === activeModel)?.pricing.completion || '0'))
        : 0;

      setTotalSessionCost(prev => prev + queryCost);

      // Dynamic CRM credits: 2 for normal chat, 5 if command generated
      const creditCost = cmdPreview ? 5 : 2;
      if (currentBonus >= creditCost) {
        localStorage.setItem('bonusCredits', String(currentBonus - creditCost));
        window.dispatchEvent(new Event('storage'));
      }

      addLog({ 
        role: 'agent', 
        text: reply,
        cmdPreview,
        cmdStatus,
        cmdResult,
        cost: queryCost,
        model: activeModel
      });

    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.message?.includes('network') || err?.message?.includes('Failed')) {
        addLog({ role: 'error', text: 'Network error. Check your internet connection.' });
      } else {
        addLog({ role: 'error', text: `Error: ${err.message || 'Unknown error'}` });
      }
    }

    setIsProcessing(false);
  };

  const popularModelsFiltered = models.filter(m => POPULAR_MODELS.includes(m.id));
  const otherModels = models.filter(m => !POPULAR_MODELS.includes(m.id));

  return (
    <div className="space-y-3 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="p-1.5 bg-blue-500/10 rounded-lg inline-flex"><Terminal className="text-blue-500 w-4 h-4" /></span> AI Agent
              <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">OpenRouter</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {totalSessionCost > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              <DollarSign className="w-3 h-3 inline" /> Session: ${totalSessionCost.toFixed(6)}
            </span>
          )}
          <button onClick={clearHistory} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="flex-none flex items-center gap-2 flex-wrap">
        <div className="relative" ref={modelPickerRef}>
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/40 rounded-xl text-slate-300 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {getModelDisplayName(selectedModel)}
            {selectedModel !== 'auto' && <span className="text-emerald-400 text-[10px]">{getModelPrice(selectedModel)}</span>}
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showModelPicker && (
            <div className="absolute top-full mt-1 left-0 z-50 w-80 max-h-80 overflow-y-auto bg-[#0B1120] border border-[#1e293b] rounded-xl shadow-2xl">
              {/* Auto Option */}
              <button
                onClick={() => { setSelectedModel('auto'); setShowModelPicker(false); }}
                className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-blue-500/10 transition-colors border-b border-[#1e293b] ${selectedModel === 'auto' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-400" /> ⚡ Auto (Best value)</span>
                <span className="text-[10px] text-emerald-400">Gemini Flash</span>
              </button>

              {/* Popular Models */}
              {popularModelsFiltered.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-[#0a0f1c]">Popular Models</div>
                  {popularModelsFiltered.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-500/10 transition-colors ${selectedModel === m.id ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300'}`}
                    >
                      <span className="truncate max-w-[200px]">{m.name}</span>
                      <span className={`text-[10px] shrink-0 ml-2 ${parseFloat(m.pricing.prompt) === 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {parseFloat(m.pricing.prompt) === 0 ? 'FREE' : `$${(parseFloat(m.pricing.prompt) * 1e6).toFixed(2)}/M`}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* All Other Models */}
              {otherModels.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-[#0a0f1c] flex items-center justify-between">
                    <span>All Models ({otherModels.length})</span>
                    <button onClick={(e) => { e.stopPropagation(); fetchModels(); }} className="text-blue-400 hover:text-blue-300">
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
                      <span className="text-slate-600 shrink-0 ml-2">
                        {parseFloat(m.pricing.prompt) === 0 ? 'FREE' : `$${(parseFloat(m.pricing.prompt) * 1e6).toFixed(1)}/M`}
                      </span>
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

      {/* Key Error */}
      {keyError && (
        <div className="flex-none flex items-center gap-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No API key configured. <strong>Settings → AI Provider Key (OpenRouter)</strong></span>
        </div>
      )}

      {/* Terminal Window */}
      <div className="flex-1 bg-black/60 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col font-mono text-sm relative min-h-0">
        {/* Header Bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1120] border-b border-[#1e293b]">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
               quickkit-agent@{selectedModel === 'auto' ? 'auto' : (selectedModel.split('/').pop() || 'openrouter')}
            </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
           {logs.map((log, idx) => (
             <div key={idx} className="flex gap-2.5 animate-fade-in">
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
                          {log.cost !== undefined && log.cost > 0 && (
                            <span className="text-[9px] text-emerald-500/70 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                              ${log.cost.toFixed(6)}
                            </span>
                          )}
                          {log.cost === 0 && <span className="text-[9px] text-emerald-400 font-bold">FREE</span>}
                        </div>
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{log.text}</div>
                      
                      {/* Command Preview UI */}
                      {log.cmdPreview && (
                        <div className="mt-3 bg-[#050810] border border-[#1e293b] rounded-lg overflow-hidden shadow-inner">
                           <div className="bg-[#0B1120] px-3 py-1.5 flex justify-between items-center text-[10px] font-bold text-slate-400">
                             <span>Suggested Command</span>
                             {log.cmdStatus === 'blocked' && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> BLOCKED</span>}
                           </div>
                           <div className="p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              $ {log.cmdPreview}
                           </div>
                           
                           {log.cmdStatus === 'pending' && (
                              <div className="p-2.5 bg-[#0B1120]/50 flex gap-2 justify-end border-t border-[#1e293b]">
                                 <button onClick={() => updateLog(log.id!, { cmdStatus: 'failed', cmdResult: 'Cancelled by user.' })} className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">Cancel</button>
                                 <button onClick={() => handleExecute(log.id!, log.cmdPreview!)} className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/30 flex items-center gap-1.5 shadow-sm active:scale-95">
                                    <Terminal className="w-3 h-3"/> Execute (10 Credits)
                                 </button>
                              </div>
                           )}

                           {log.cmdStatus === 'running' && (
                              <div className="p-3 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2 text-amber-400 text-[11px] font-mono">
                                 <Loader2 className="w-3.5 h-3.5 animate-spin"/> [Running on VPS...]
                              </div>
                           )}

                           {(log.cmdStatus === 'success' || log.cmdStatus === 'failed' || log.cmdStatus === 'blocked') && log.cmdResult && (
                              <div className={`p-3 border-t font-mono text-[11px] whitespace-pre-wrap overflow-x-auto max-h-48 custom-scrollbar ${log.cmdStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                                  {log.cmdStatus === 'success' ? <span className="font-bold">[SUCCESS]</span> : <span className="font-bold">[ERROR]</span>}
                                  <br/>{log.cmdResult}
                              </div>
                           )}
                        </div>
                      )}
                    </div>
                 )}
                 {log.role === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 mt-1">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {log.text}
                      </div>
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

        {/* Input */}
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
              <button 
                type="submit" 
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
              >
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
           <div className="flex items-center justify-between mt-1.5 px-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="flex items-center gap-1"><Bot className="w-3 h-3 text-blue-400"/> Chat: <span className="text-emerald-400">2cr</span></span> | 
                  <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-purple-400"/> Command: <span className="text-emerald-400">5cr</span></span> | 
                  <span className="flex items-center gap-1"><Server className="w-3 h-3 text-amber-400"/> VPS Execute: <span className="text-emerald-400">10cr</span></span>
              </span>
              <span className="text-[10px] text-slate-600">Memory: 12 messages</span>
           </div>
        </form>
      </div>
    </div>
  );
};
