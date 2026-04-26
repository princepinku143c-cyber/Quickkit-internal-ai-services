
import React, { useMemo, useState, useEffect } from 'react';
import { Activity, CheckCircle2, Server, Bot, Layers, CheckSquare, Clock, Terminal, AlertCircle, Zap, Cpu, Fingerprint, Sparkles, Database, Play, Square, Plus, ShieldCheck, Briefcase, ChevronRight, Loader2, Globe } from 'lucide-react';
import { UserProfile } from '../types';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/api';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);
  
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'running' | 'completed'>('all');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [commandInput, setCommandInput] = useState('');

  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setIsFirebaseConnected(false);
      return;
    }

    // Standard Listeners
    const qAgents = query(collection(db as any, 'agents'), where('user_id', '==', user.uid));
    const unSubAgents = onSnapshot(qAgents, snapshot => setAgents(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))));

    const qTasks = query(collection(db as any, 'tasks'), where('user_id', '==', user.uid));
    const unSubTasks = onSnapshot(qTasks, snapshot => setTasks(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))));

    const qLogs = query(collection(db as any, 'logs'), where('user_id', '==', user.uid));
    const unSubLogs = onSnapshot(qLogs, snapshot => setLogs(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))));

    // 🚀 NEW: Project Build Queue Listener
    const qProjects = query(collection(db as any, 'projects'), where('userId', '==', user.uid));
    const unSubProjects = onSnapshot(qProjects, snapshot => setProjects(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))));

    // 🚀 NEW: User Settings Listener (for VPS credentials)
    const unSubSettings = onSnapshot(doc(db as any, 'users', user.uid, 'private', 'settings'), snap => {
        if (snap.exists()) setUserSettings(snap.data());
    });

    return () => {
      unSubAgents();
      unSubTasks();
      unSubLogs();
      unSubProjects();
      unSubSettings();
    };
  }, [user.uid]);

  const toggleAgentStatus = async (agent: any) => {
    const agentRef = doc(db as any, 'agents', agent.id);
    await updateDoc(agentRef, { status: agent.status === 'running' ? 'stopped' : 'running' });
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!commandInput.trim()) return;
    await addDoc(collection(db as any, 'logs'), {
        agent_id: 'USER',
        user_id: user.uid,
        action: `> ${commandInput}`,
        time: new Date().toLocaleTimeString()
    });
    setCommandInput('');
  }

  const handleDeploy = async (projectId: string) => {
    if (!userSettings?.vpsEndpoint || !userSettings?.vpsToken) {
        alert("🚨 Missing Navigation Node: Please configure your VPS Endpoint and Token in Settings first.");
        return;
    }

    setIsDeploying(projectId);
    try {
        const data = await apiCall('/api/ai?action=deploy', {
            userId: user.uid,
            projectId,
            vpsEndpoint: userSettings.vpsEndpoint,
            vpsToken: userSettings.vpsToken
        });

        if (data.status === "PROVISIONING") {
            alert("🚀 Neural Link Established! Your agent is now LIVE.");
        } else {
            throw new Error("Cluster Rejected Deployment");
        }
    } catch (err: any) {
        alert(`❌ Deployment FAILED: ${err.message}`);
    } finally {
        setIsDeploying(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Industrial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-175"><Fingerprint className="w-32 h-32 text-blue-500" /></div>
        
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Authenticated Node ID: 0x{user.uid.slice(0,8).toUpperCase()}</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">
             NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">DASHBOARD</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[11px] mt-4 tracking-[0.3em] flex items-center gap-3">
             <ShieldCheck className="w-4 h-4 text-emerald-500" /> Standard Operating System <span className="text-slate-800">|</span> 24/7 Monitoring Active
          </p>
        </div>

        <div className="mt-8 md:mt-0 flex flex-col items-end">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3 pr-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">{user.displayName?.[0] || 'O'}</div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active session</p>
                   <p className="text-sm font-black text-white uppercase">{user.displayName || 'Operator'}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
          {[
            { icon: ShieldCheck, label: "Secure PayPal Node", sub: "AES-256 Encrypted" },
            { icon: Clock, label: "48h Build Velocity", sub: "Standard ETA" },
            { icon: CheckCircle2, label: "Success Audit", sub: "QA Verified" },
            { icon: Zap, label: "Neural Hosting", sub: "Included 1yr" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-center">
                <item.icon className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.label}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
            </div>
          ))}
      </div>

      {/* 2. Build Queue (STABLE CLIENT FEATURE) */}
      {projects.length > 0 && (
        <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-orange-400" /> Active Build Queue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(projects) ? projects : []).map((p, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-orange-500/30 transition-all group">
                             <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight">{p.projectName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {p.status === 'PENDING_PAYMENT' ? 'Awaiting Advance Deposit' : 
                                         p.status === 'IN_PROGRESS' ? 'Architectural Scoping Active' :
                                         p.status === 'READY' ? 'Build Sequence Finalized' : 'Operational'}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{p.status?.replace('_', ' ')}</span>
                         </div>
                         <div className="space-y-4">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Next Objective</span>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                        {p.status === 'PENDING_PAYMENT' ? 'Payment Verification' : 'Asset Assembly'}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                    {p.status === 'PENDING_PAYMENT' ? 'Complete the 10% advance to trigger the VPS engineering node.' : 
                                     p.status === 'IN_PROGRESS' ? 'Our agents are currently committing code to your target VPS.' : 
                                     'Your solution is ready for final deployment.'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest"><span className="text-slate-500">Build Progress</span> <span className="text-orange-400">{p.status === 'READY' ? '100% COMPLETE' : 'Phase 1: Architecture'}</span></div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden"><div className={`h-full bg-orange-600 ${p.status !== 'READY' && 'animate-pulse-slow'}`} style={{width: p.status === 'READY' || p.status === 'LIVE' ? '100%' : '25%'}}></div></div>
                            </div>
                            
                            {p.status === 'READY' && (
                                <button 
                                    onClick={() => handleDeploy(p.id)}
                                    disabled={isDeploying === p.id}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                                >
                                    {isDeploying === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Initialize Deployment</>}
                                </button>
                            )}

                            {p.status === 'LIVE' && p.deploymentUrl && (
                                <a 
                                    href={p.deploymentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 font-black rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                >
                                    <Globe className="w-4 h-4" /> Access Live Agent <ChevronRight className="w-4 h-4" />
                                </a>
                            )}
                         </div>
                    </div>
                ))}
            </div>
        </section>
      )}

      {/* 3. Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Agent Fleet */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 space-y-8">
              <div className="flex justify-between items-center">
                  <h3 className="font-black text-white uppercase text-xs tracking-widest">Fleet Systems</h3>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">{agents.length} Active</span>
              </div>
              <div className="space-y-4">
                  {(Array.isArray(agents) ? agents : []).map(agent => (
                      <div key={agent.id} className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center group">
                          <div>
                              <p className="text-white font-bold text-sm uppercase">{agent.agent_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{agent.status || 'offline'}</span>
                              </div>
                          </div>
                          <button onClick={() => toggleAgentStatus(agent)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
                              {agent.status === 'running' ? <Square className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Activity Console */}
          <div className="lg:col-span-2 bg-[#050810] border border-slate-800 rounded-[2rem] flex flex-col h-[500px] shadow-2xl relative overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/10">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Operation Logs</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/20"></div>
                    </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar text-slate-500">
                    {(Array.isArray(logs) ? logs : []).slice().reverse().map((log, i) => (
                        <div key={i} className="flex gap-4 group">
                             <span className="text-slate-800 shrink-0">[{log.time}]</span>
                             <span className="text-blue-500/80 font-bold">[{log.agent_id || 'SYS'}]</span>
                             <span className="text-slate-400 group-hover:text-white transition-colors">{log.action || log.message}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleCommand} className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 focus-within:border-emerald-500/40 transition-colors">
                        <span className="text-emerald-500 font-bold">&gt;</span>
                        <input value={commandInput} onChange={e => setCommandInput(e.target.value)} placeholder="Submit cluster command..." className="bg-transparent border-none outline-none text-emerald-400 w-full text-xs font-mono" />
                    </div>
                </form>
          </div>

      </div>

    </div>
  );
};
