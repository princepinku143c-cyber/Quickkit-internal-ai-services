import React, { useMemo, useState, useEffect } from 'react';
import { Activity, CheckCircle2, Server, Bot, Layers, CheckSquare, Clock, Terminal, AlertCircle, Zap, Cpu, Fingerprint, Sparkles, Database, Play, Square, Plus } from 'lucide-react';
import { UserProfile } from '../types';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'running' | 'completed'>('all');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [commandInput, setCommandInput] = useState('');

  // Per user instruction:
  // "Filter all data by business_id = 'biz_1'"
  const businessId = "biz_1"; 

  useEffect(() => {
    if (demoMode) return; // Do not fetch from Firebase if in demo mode

    if (!db || Object.keys(db).length === 0) {
      setIsFirebaseConnected(false);
      return;
    }

    try {
      const qAgents = query(collection(db as any, 'agents'), where('business_id', '==', businessId), where('user_id', '==', user.uid));
      const unSubAgents = onSnapshot(qAgents, (snapshot) => {
        setAgents(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (err) => console.warn("Agents error:", err));

      const qTasks = query(collection(db as any, 'tasks'), where('business_id', '==', businessId), where('user_id', '==', user.uid));
      const unSubTasks = onSnapshot(qTasks, (snapshot) => {
        setTasks(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (err) => console.warn("Tasks error:", err));

      const qLogs = query(collection(db as any, 'logs'), where('business_id', '==', businessId), where('user_id', '==', user.uid));
      const unSubLogs = onSnapshot(qLogs, (snapshot) => {
        setLogs(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (err) => console.warn("Logs error:", err));

      return () => {
        unSubAgents();
        unSubTasks();
        unSubLogs();
      };
    } catch (e) {
      console.error("Firebase setup error:", e);
      setIsFirebaseConnected(false);
    }
  }, [businessId, demoMode]);

  const toggleDemoMode = () => {
    if (!demoMode) {
      setAgents([
        { id: '1', agent_id: 'agent_1', agent_name: 'Lead Gen Autobot', status: 'running', last_activity: 'Just now' },
        { id: '2', agent_id: 'agent_2', agent_name: 'Voice AI Dialer', status: 'running', last_activity: '10s ago' },
        { id: '3', agent_id: 'agent_3', agent_name: 'SEO Architect', status: 'stopped', last_activity: '2h ago' }
      ]);
      setTasks([
        { id: '1', agent_id: 'agent_1', type: 'Email Campaign', status: 'running', result: 'Sending batch 45/100' },
        { id: '2', agent_id: 'agent_2', type: 'Outbound Call', status: 'completed', result: 'Meeting booked successfully' },
        { id: '3', agent_id: 'agent_1', type: 'LinkedIn Outreach', status: 'pending', result: 'Queued for 09:00 AM' },
        { id: '4', agent_id: 'agent_3', type: 'Competitor DB Build', status: 'completed', result: 'Data synced to CRM' }
      ]);
      setLogs([
        { id: '1', time: new Date(Date.now() - 30000).toLocaleTimeString(), agent_id: 'agent_1', action: 'Drafted follow-up sequence for target segment.' },
        { id: '2', time: new Date(Date.now() - 15000).toLocaleTimeString(), agent_id: 'agent_2', action: 'Initiated outbound voice call to +1 (555) ***-**89' },
        { id: '3', time: new Date().toLocaleTimeString(), agent_id: 'agent_2', action: 'Call connected. Voice AI responding to objections.' }
      ]);
      setDemoMode(true);
    } else {
      setAgents([]);
      setTasks([]);
      setLogs([]);
      setDemoMode(false);
    }
  };

  const toggleAgentStatus = async (agent: any) => {
    if(demoMode) return;
    try {
      const newStatus = agent.status === 'running' ? 'stopped' : 'running';
      const agentRef = doc(db as any, 'agents', agent.id);
      await updateDoc(agentRef, { status: newStatus });
    } catch (e) {
      console.warn("Update agent failed - check firebase rules", e);
      alert("Failed to update. Check Firebase permissions.");
    }
  };

  const runNewTask = async () => {
    if(demoMode) return;
    try {
      await addDoc(collection(db as any, 'tasks'), {
        agent_id: 'System',
        user_id: user.uid,
        business_id: businessId,
        type: 'Fast Execution',
        status: 'pending',
        result: 'Awaiting agent allocation...',
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Add task failed", e);
      alert("Failed to add task. Check Firebase permissions.");
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!commandInput.trim() || demoMode) return;
    
    try {
        await addDoc(collection(db as any, 'logs'), {
            agent_id: 'USER',
            user_id: user.uid,
            business_id: businessId,
            action: `> ${commandInput}`,
            time: new Date().toLocaleTimeString()
        });
        setCommandInput('');
    } catch (e) {
        console.warn("Add command failed", e);
        alert("Failed to send command. Check Firebase permissions.");
    }
  }

  const stats = useMemo(() => {
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      activeAgents: agents.filter(a => a.status === 'running').length,
    };
  }, [agents, tasks]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter(t => t.status === taskFilter);
  }, [tasks, taskFilter]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-[#0B1120]/80 border border-[#1e293b]/80 p-6 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Live Operating System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center gap-4">
             <Fingerprint className="w-10 h-10 text-blue-500" /> 
             Smart AI CRM
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-2 ml-1">Enterprise-grade multi-agent operations command center.</p>
        </div>

        <div className="flex flex-col items-end gap-3 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Workspace</span>
                  <span className="text-white font-mono font-bold">{businessId}</span>
              </div>
              <div className="h-8 w-px bg-slate-700/50"></div>
              <button 
                onClick={toggleDemoMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg ${
                  demoMode 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 shadow-amber-500/10' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 shadow-indigo-500/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {demoMode ? 'Exit Demo Visualization' : 'Simulate Data (Demo)'}
              </button>
            </div>
            {!isFirebaseConnected && !demoMode && (
               <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono animate-pulse">
                   <AlertCircle className="w-3 h-3" /> No Database Detected
               </div>
            )}
            {isFirebaseConnected && !demoMode && (
               <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                   <CheckCircle2 className="w-3 h-3" /> Database Sync Active
               </div>
            )}
        </div>
      </div>

      {/* 1. Dashboard Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-[#0f172a]/60 border-t-2 border-t-blue-500 border-x border-b border-[#1e293b] p-6 rounded-2xl hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
             <div className="p-2 bg-blue-500/10 rounded-md"><Layers className="w-4 h-4 text-blue-400" /></div>
             Total Capacity
          </p>
          <div className="flex items-end gap-3">
              <p className="text-5xl font-black text-white">{stats.totalTasks}</p>
              <p className="text-xs text-slate-500 font-medium mb-1 border-l border-slate-700 pl-2">Lifetime Tasks</p>
          </div>
        </div>

        <div className="bg-[#0f172a]/60 border-t-2 border-t-emerald-500 border-x border-b border-[#1e293b] p-6 rounded-2xl hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
             <div className="p-2 bg-emerald-500/10 rounded-md"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
             Successful Output
          </p>
          <div className="flex items-end gap-3">
              <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{stats.completedTasks}</p>
              <p className="text-xs text-slate-500 font-medium mb-1 border-l border-slate-700 pl-2">Operations complete</p>
          </div>
        </div>

        <div className="bg-[#0f172a]/60 border-t-2 border-t-amber-500 border-x border-b border-[#1e293b] p-6 rounded-2xl hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)] transition-all duration-300 relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
             <div className="p-2 bg-amber-500/10 rounded-md"><Zap className="w-4 h-4 text-amber-400" /></div>
             Live Processing
          </p>
          <div className="flex items-end gap-3">
              <p className="text-5xl font-black text-amber-400">{stats.runningTasks}</p>
              <p className="text-xs text-slate-500 font-medium mb-1 border-l border-slate-700 pl-2">Active threads</p>
          </div>
        </div>

        <div className="bg-[#0f172a]/60 border-t-2 border-t-purple-500 border-x border-b border-[#1e293b] p-6 rounded-2xl hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-all"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
             <div className="p-2 bg-purple-500/10 rounded-md"><Cpu className="w-4 h-4 text-purple-400" /></div>
             Active Agents
          </p>
          <div className="flex items-end gap-3">
              <p className="text-5xl font-black text-purple-400">{stats.activeAgents}</p>
              <p className="text-xs text-slate-500 font-medium mb-1 border-l border-slate-700 pl-2">AI Systems running</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        
        {/* 2. Agents Section */}
        <div className="lg:col-span-1 bg-[#0f172a]/60 backdrop-blur-md border border-[#1e293b] rounded-2xl flex flex-col shadow-xl">
          <div className="p-5 border-b border-[#1e293b] flex justify-between items-center bg-[#0B1120]/50 rounded-t-2xl">
             <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" /> Fleet Agents
             </h3>
             <span className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-1 rounded-md">{agents.length} Deployed</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
             {agents.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <Database className="w-12 h-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-xs font-bold text-center">No agents deployed.</p>
                    <p className="text-slate-500 text-[10px] text-center mt-1">Awaiting synchronization from `agents` collection.</p>
                 </div>
             ) : (
                 agents.map(agent => (
                    <div key={agent.id} className="bg-[#0B1120]/80 p-4 rounded-xl border border-[#1e293b] hover:border-purple-500/30 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.05)] group">
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{agent.agent_name || 'Unnamed Agent'}</span>
                           
                           {/* AGENT CONTROL BUTTONS */}
                           <div className="flex items-center gap-2">
                             <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md flex items-center gap-1.5 ${agent.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                               {agent.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                               {agent.status || 'offline'}
                             </span>
                             <button 
                                onClick={() => toggleAgentStatus(agent)} 
                                className="p-1.5 rounded-md bg-[#0f172a] border border-slate-700 hover:bg-slate-800 transition shadow-sm active:scale-95"
                                title={agent.status === 'running' ? 'Stop Agent' : 'Start Agent'}
                             >
                               {agent.status === 'running' ? <Square className="w-3.5 h-3.5 text-red-400 fill-current" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />}
                             </button>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                           <div className="flex items-center gap-1.5 bg-[#0f172a] px-2 py-1 rounded-md border border-slate-800">
                              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-white text-[11px]">{tasks.filter(t => t.agent_id === agent.agent_id && t.status === 'completed').length} Output</span>
                           </div>
                           {agent.last_activity && (
                             <div className="flex items-center gap-1.5 text-slate-400 text-[10px] bg-[#0f172a] px-2 py-1 rounded-md border border-slate-800">
                                <Clock className="w-3 h-3" /> {agent.last_activity}
                             </div>
                           )}
                        </div>
                    </div>
                 ))
             )}
          </div>
        </div>

        {/* 3. Tasks Section */}
        <div className="lg:col-span-1 bg-[#0f172a]/60 backdrop-blur-md border border-[#1e293b] rounded-2xl flex flex-col shadow-xl">
          <div className="p-5 border-b border-[#1e293b] flex justify-between items-center bg-[#0B1120]/50 rounded-t-2xl">
             <div className="flex items-center gap-3">
                 <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Pipeline
                 </h3>
                 <button onClick={runNewTask} className="w-6 h-6 flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/40 rounded border border-blue-500/30 text-blue-400 transition" title="Trigger Fast Task">
                    <Plus className="w-3 h-3" />
                 </button>
             </div>
             <select 
               className="bg-[#0B1120] text-slate-300 text-[10px] font-bold px-2 py-1.5 rounded-md border border-[#1e293b] outline-none uppercase cursor-pointer hover:border-blue-500/50 transition-colors"
               value={taskFilter}
               onChange={(e: any) => setTaskFilter(e.target.value)}
             >
               <option value="all">All Status</option>
               <option value="pending">⏳ Pending</option>
               <option value="running">⚡ Running</option>
               <option value="completed">✅ Completed</option>
             </select>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
             {filteredTasks.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <Database className="w-12 h-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-xs font-bold text-center">No tasks in pipeline.</p>
                 </div>
             ) : (
                 filteredTasks.map(task => (
                    <div key={task.id} className="bg-[#0B1120]/80 p-4 rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-all flex justify-between items-center group">
                        <div className="w-full">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                                   <Bot className="w-3 h-3 text-slate-500" /> {task.agent_id || 'System'}
                               </span>
                               <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md ${
                                   task.status === 'running' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                   task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                   'bg-slate-800 text-slate-400 border border-slate-700'
                               }`}>
                                 {task.status || 'pending'}
                               </span>
                           </div>
                           <span className="text-sm font-black tracking-tight text-white capitalize block mt-1">{task.type || 'Automation Task'}</span>
                           {task.result && <p className="text-[11px] text-slate-500 mt-1.5 border-l-2 border-slate-700 pl-2 group-hover:border-blue-500/50 transition-colors">{task.result}</p>}
                        </div>
                    </div>
                 ))
             )}
          </div>
        </div>

        {/* 4. Command Console (Upgraded Activity Logs) */}
        <div className="lg:col-span-1 bg-[#050810] border border-[#1e293b] rounded-2xl flex flex-col shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none"></div>
          <div className="p-3 border-b border-[#1e293b] flex items-center gap-2 bg-[#080c17]">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 border border-red-500"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-500"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-500"></div>
             </div>
             <h3 className="text-emerald-500/80 font-mono font-bold uppercase tracking-widest text-[9px] ml-2 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Command Console / {businessId}
             </h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed custom-scrollbar flex flex-col">
             
             {/* Log History */}
             <div className="flex-1 space-y-3 mb-4">
                {logs.length === 0 ? (
                    <p className="text-slate-600 animate-pulse">Waiting for incoming operations...</p>
                ) : (
                    logs.slice().reverse().map((log, i) => ( // Show latest first
                        <div key={log.id || i} className="flex gap-3 text-slate-400">
                            <span className="text-emerald-500/60 shrink-0">[{log.time || new Date().toLocaleTimeString()}]</span>
                            <div>
                                <span className={log.agent_id === 'USER' ? 'text-amber-400/80 font-bold' : 'text-blue-400/80 font-bold'}>[{log.agent_id}]</span>{' '}
                                <span className={log.agent_id === 'USER' ? 'text-white' : 'text-slate-300'}>{log.action || log.message}</span>
                            </div>
                        </div>
                    ))
                )}
             </div>

             {/* Command Input Form */}
             <form onSubmit={handleCommand} className="flex gap-2 mt-auto items-center bg-[#0B1120] border border-slate-800 p-2.5 rounded-lg focus-within:border-emerald-500/50 transition shadow-inner">
                 <span className="text-emerald-500 font-bold text-sm">&gt;</span>
                 <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="bg-transparent border-none outline-none text-emerald-100 text-[11px] w-full font-mono placeholder:text-slate-700" 
                    placeholder={demoMode ? "Demo mode: Input disabled..." : "Enter system command (e.g., 'deploy agent')..."} 
                    disabled={demoMode}
                 />
                 <button type="submit" className="hidden">Send</button>
             </form>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1);
        }
      `}} />
    </div>
  );
};
