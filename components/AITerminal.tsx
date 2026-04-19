import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Terminal, Send, Loader2, Bot, Server, Shield, Zap } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AITerminalProps {
  user: UserProfile;
}

interface LogEntry {
  type: 'system' | 'user' | 'agent' | 'server';
  text: string;
  time: string;
}

export const AITerminal: React.FC<AITerminalProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([{
     type: 'system',
     text: 'QuickKit OS v1.0.4 loaded. Awaiting natural language instructions.',
     time: new Date().toLocaleTimeString()
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type: LogEntry['type'], text: string) => {
    setLogs(prev => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput('');
    addLog('user', command);
    setIsProcessing(true);

    // Simulate Network Request to Gemini & OpenClaw
    addLog('agent', 'Analyzing request with Gemini Intelligence...');
    await new Promise(r => setTimeout(r, 600));

    // Deduct Credit
    const currentBonus = Number(localStorage.getItem('bonusCredits')) || 0;
    if (user.credits + currentBonus < 5) {
        addLog('system', 'ERROR: Insufficient credits. Please add funds to wallet.');
        setIsProcessing(false);
        return;
    }
    
    addLog('system', 'Compiling logic tree into executable bash script...');
    await new Promise(r => setTimeout(r, 800));
    
    addLog('server', 'Connecting to OpenClaw VPS Endpoint (3e180...)...');
    await new Promise(r => setTimeout(r, 1200));
    
    // Fake deduct 5 credits from local storage
    if (currentBonus >= 5) {
        localStorage.setItem('bonusCredits', String(currentBonus - 5));
        window.dispatchEvent(new Event('storage'));
    }

    addLog('server', '[VPS] Executing remote task sequence.');
    await new Promise(r => setTimeout(r, 1500));
    addLog('agent', '✅ Task completed successfully. Total cost: 5 Credits.');
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-6">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Terminal className="text-blue-500" /> AI Terminal Agent
        </h1>
        <p className="text-slate-400 mt-1">Talk to the system in normal language. The CRM manages the servers automatically.</p>
      </div>

      <div className="flex-1 bg-black/60 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col font-mono text-sm relative">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0B1120] border-b border-[#1e293b]">
            <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
               root@quickkit-openclaw:~
            </div>
        </div>

        {/* Console Window */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
           {logs.map((log, idx) => (
             <div key={idx} className="flex gap-4">
               <span className="text-slate-600 shrink-0 text-xs mt-0.5 w-16 invisible sm:visible">[{log.time}]</span>
               <div className="flex-1">
                 {log.type === 'user' && (
                    <div className="flex gap-2 text-white">
                       <span className="text-emerald-400 font-bold shrink-0">client@admin:~#</span> 
                       <span className="text-blue-300">{log.text}</span>
                    </div>
                 )}
                 {log.type === 'system' && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Shield className="w-3.5 h-3.5 shrink-0" /> {log.text}
                    </div>
                 )}
                 {log.type === 'agent' && (
                    <div className="flex items-center gap-2 text-purple-400 font-medium">
                      <Bot className="w-3.5 h-3.5 shrink-0" /> {log.text}
                    </div>
                 )}
                 {log.type === 'server' && (
                    <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-500/10 inline-flex px-2 py-0.5 rounded border border-emerald-500/20">
                      <Server className="w-3 h-3 shrink-0" /> {log.text}
                    </div>
                 )}
               </div>
             </div>
           ))}
           {isProcessing && (
             <div className="flex gap-4 animate-pulse pt-2">
                 <span className="text-slate-600 invisible sm:visible w-16"></span>
                 <span className="text-white w-2 h-4 bg-slate-400"></span>
             </div>
           )}
           <div ref={logsEndRef} />
        </div>

        {/* Input Window */}
        <form onSubmit={handleSend} className="p-4 bg-[#0B1120] border-t border-[#1e293b]">
           <div className="relative flex items-center">
              <Zap className="absolute left-4 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Ex: 'Run workflow to enrich leads', 'Scrape contact emails', 'Check VPS health'..."
                className="w-full bg-[#0f172a] text-white border border-[#1e293b] rounded-xl pl-12 pr-14 py-4 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 text-sm"
              />
              <button 
                type="submit" 
                disabled={isProcessing || !input.trim()}
                className="absolute right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
              >
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};
