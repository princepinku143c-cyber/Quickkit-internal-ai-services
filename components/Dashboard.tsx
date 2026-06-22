
import React, { useMemo, useState, useEffect } from 'react';
import { Activity, CheckCircle2, Server, Bot, Layers, CheckSquare, Clock, Terminal, AlertCircle, Zap, Cpu, Fingerprint, Sparkles, Database, Play, Square, Plus, ShieldCheck, Briefcase, ChevronRight, Loader2, Globe, Mail, DollarSign } from 'lucide-react';
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

  if (!user) return null;

  const dynamicLabels = useMemo(() => {
    const isRealEstate = user.industryType === 'Real Estate';
    const isEcom = user.industryType === 'E-commerce';
    const isAgency = user.industryType === 'Agency';
    const isHealthcare = user.industryType === 'Healthcare';
    const isTravel = user.industryType === 'Travel';

    if (isRealEstate) {
      return {
        commandCenter: 'Property Command Center',
        deployments: 'Active Properties',
      };
    } else if (isEcom) {
      return {
        commandCenter: 'Store Sync Center',
        deployments: 'Store Syncs / Operations',
      };
    } else if (isAgency) {
      return {
        commandCenter: 'Agency Lead Hub',
        deployments: 'Active Client Workflows',
      };
    } else if (isHealthcare) {
      return {
        commandCenter: 'Patient Care Operations',
        deployments: 'Clinic Appointments',
      };
    } else if (isTravel) {
      return {
        commandCenter: 'Booking Hub',
        deployments: 'Active Tours & Inquiries',
      };
    }

    return {
      commandCenter: 'Build Command Center',
      deployments: 'Active Deployments',
    };
  }, [user.industryType]);

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'running' | 'completed'>('all');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [tokenInput, setTokenInput] = useState<{ [key: string]: string }>({});
  const [isVerifyingToken, setIsVerifyingToken] = useState<string | null>(null);

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

  const handleVerifyToken = async (projectId: string) => {
    const token = tokenInput[projectId];
    if (!token || token.trim().length < 6) {
        alert("🚨 Invalid Verification Token Structure.");
        return;
    }

    setIsVerifyingToken(projectId);
    try {
        const data = await apiCall('/api/system?action=verify-payment-token', {
            projectId,
            token: token.trim()
        });

        if (data.status === "VERIFIED") {
            alert("✅ Payment Verified! Build node initialized.");
            setTokenInput(prev => ({ ...prev, [projectId]: '' }));
        } else {
            throw new Error(data.message || "Invalid Token");
        }
    } catch (err: any) {
        alert(`❌ Verification Failed: ${err.message}`);
    } finally {
        setIsVerifyingToken(null);
    }
  };

  const handleAcceptQuote = async (projectId: string) => {
    try {
        await apiCall('/api/system?action=project-status', {
            projectId,
            status: 'accepted'
        });
        alert("🚀 Project Accepted! We are initializing the build node.");
    } catch (e) {
        alert("Failed to accept quote.");
    }
  };

  const [promoInput, setPromoInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsRedeeming(true);
    try {
        const data = await apiCall('/api/system?action=redeem-code', { code: promoInput.trim() });
        alert(`✅ Neural Injection Successful! Added ${data.amount} credits to your node.`);
        setPromoInput('');
    } catch (err: any) {
        alert(`❌ Injection Failed: ${err.message}`);
    } finally {
        setIsRedeeming(false);
    }
  };

  const handleCustomCreditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
    if (!amount || Number(amount) <= 0) return;

    try {
        await apiCall('/api/system?action=credit-request', {
            userId: user.uid,
            amount: Number(amount),
            email: user.email,
            displayName: user.displayName
        });
        alert("🚀 Request Dispatched! Our billing node will contact you with a payment link shortly.");
        (e.target as HTMLFormElement).reset();
    } catch (err) {
        alert("Failed to send request.");
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden p-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-[3rem] shadow-2xl shadow-blue-900/20 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> SECURE AGENT NODE
                </div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-400" /> V1.4 PRODUCTION
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">Welcome Back,<br/><span className="text-blue-300">{user.displayName?.split(' ')[0] || 'Architect'}</span></h1>
              <p className="text-blue-100/60 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Your neural network is active. Currently processing <strong>{agents.length} Agents</strong> and <strong>{projects.length} Active Builds</strong>.
              </p>
          </div>
      </div>

      {/* 2. Custom Credit Request & Header Stats */}
      <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-175"><Fingerprint className="w-32 h-32 text-blue-500" /></div>
              <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Authenticated Node ID: 0x{user.uid.slice(0,8).toUpperCase()}</span>
                  </span>
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                      NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">DASHBOARD</span>
                  </h2>
                  <p className="text-slate-500 font-bold uppercase text-[11px] mt-4 tracking-[0.3em] flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Standard Operating System <span className="text-slate-800">|</span> 24/7 Monitoring Active
                  </p>
              </div>
          </div>

          <div className="lg:w-[400px] bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Current Balance</p>
                      <p className="text-3xl font-black text-white leading-none">{user.credits || 0} <span className="text-sm text-blue-400 uppercase tracking-widest ml-1">Credits</span></p>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30"><Zap className="w-5 h-5" /></div>
              </div>

              <form onSubmit={handleCustomCreditRequest} className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Add Credits ($1 = 10 Credits)</p>
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                          <input name="amount" type="number" placeholder="Enter USD Amount (e.g. 50)" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-[11px] font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700" />
                      </div>
                      <button type="submit" className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20">Buy</button>
                  </div>
                  <div className="flex justify-between items-center px-1">
                      <p className="text-[8px] font-bold text-slate-600 uppercase">Secure Billing Node</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase">Immediate Response</p>
                  </div>
              </form>

              <div className="h-[1px] bg-slate-800/50 my-6" />

              <form onSubmit={handleRedeemCode} className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Bonus Injection (Promo Code)</p>
                  <div className="flex gap-2">
                      <input 
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE (E.G. QUICKKIT100)" 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-[11px] font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-mono" 
                      />
                      <button 
                        type="submit" 
                        disabled={isRedeeming}
                        className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl uppercase text-[10px] tracking-widest transition-all border border-slate-700"
                      >
                        {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                      </button>
                  </div>
              </form>
          </div>
      </div>

      {/* 3. Build Queue (LIFECYCLE TRACKER) */}
      {projects.length > 0 && (
        <section className="space-y-8">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{dynamicLabels.commandCenter}</h3>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{dynamicLabels.deployments}</h4>
                </div>
                <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl"><Briefcase className="w-5 h-5" /></div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.map((p) => (
                    <div key={p.id} className="p-8 glass-card rounded-[2.5rem] relative overflow-hidden group">
                        
                        {/* Status Strip */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h5 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{p.projectName}</h5>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pipeline Phase: <span className="text-blue-400">{p.status}</span></p>
                                </div>
                            </div>
                            
                            {/* Visual Timeline Nodes */}
                            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                {[
                                    { s: 'inquiry', i: Clock },
                                    { s: 'quoted', i: DollarSign },
                                    { s: 'accepted', i: CheckCircle2 },
                                    { s: 'in_progress', i: Cpu },
                                    { s: 'demo', i: Play },
                                    { s: 'active', i: Zap }
                                ].map((step, idx) => {
                                    const stages = ['inquiry', 'quoted', 'accepted', 'in_progress', 'demo', 'active'];
                                    const currentIdx = stages.indexOf(p.status);
                                    const stepIdx = stages.indexOf(step.s);
                                    const isActive = stepIdx <= currentIdx;
                                    
                                    return (
                                        <div key={step.s} className="flex items-center gap-2 shrink-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-950 text-slate-700 border border-slate-800'}`}>
                                                <step.i className="w-4 h-4" />
                                            </div>
                                            {idx < 5 && <div className={`w-4 md:w-8 h-[2px] rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-800'}`}></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* STATUS CARD */}
                            <div className="lg:col-span-2 p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-6">
                                <div className="flex justify-between items-center">
                                    <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Build Progress</h6>
                                    <span className="text-2xl font-black text-blue-500">{p.progress || 0}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${p.progress || 0}%` }}></div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Latest Architectural Update</p>
                                    <p className="text-sm font-bold text-white italic">"{p.lastUpdate || 'Initializing neural workspace and build environments...'}"</p>
                                </div>
                            </div>

                            {/* ACTIONS CARD */}
                            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex flex-col justify-between gap-4">
                                <div>
                                    <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Required Action</h6>
                                    
                                    {p.status === 'quoted' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-950 rounded-2xl border border-blue-500/20">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Project Investment</p>
                                                <p className="text-2xl font-black text-white">${p.quote?.price}</p>
                                                <p className="text-[10px] text-blue-400 font-black uppercase mt-1">Timeline: {p.quote?.timeline}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleAcceptQuote(p.id)}
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                                            >
                                                Accept Proposal
                                            </button>
                                        </div>
                                    )}

                                    {p.status === 'demo' && (
                                        <div className="text-center space-y-4">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">Your demo is ready for review.</p>
                                            <a href="mailto:admin@quickkitai.com" className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                                <Mail className="w-4 h-4" /> Schedule VC Demo
                                            </a>
                                        </div>
                                    )}

                                    {p.status === 'active' && (
                                        <div className="text-center py-4">
                                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                            <p className="text-xs font-black text-white uppercase">Operational Node Live</p>
                                        </div>
                                    )}

                                    {!['quoted', 'demo', 'active'].includes(p.status) && (
                                        <div className="flex items-center justify-center h-full text-center">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">System Processing...<br/>Check back for updates.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}

      {/* 4. Support & Maintenance Strip */}
      <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400"><ShieldCheck className="w-8 h-8" /></div>
              <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Enterprise Support Protocol</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Direct access to lead engineers and priority build queues.</p>
              </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:admin@quickkitai.com" className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-white hover:border-blue-500/30 transition-all uppercase tracking-widest flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-500" /> Admin Node
              </a>
              <a href="mailto:support@quickkitai.com" className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-white hover:border-blue-500/30 transition-all uppercase tracking-widest flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-500" /> Support Node
              </a>
          </div>
      </div>

      {/* 5. Fleet & Console Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Agent Fleet */}
          <div className="lg:col-span-1 glass-card rounded-[2rem] p-8 space-y-8">
              <div className="flex justify-between items-center">
                  <h3 className="font-black text-white uppercase text-xs tracking-widest">Neural Fleet</h3>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">{agents.length} Nodes</span>
              </div>
              <div className="space-y-4">
                  {(Array.isArray(agents) ? agents : []).map(agent => (
                      <div key={agent.id} className="p-6 glass-card rounded-2xl flex justify-between items-center group">
                          <div>
                              <p className="text-white font-bold text-sm uppercase">{agent.agent_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{agent.status || 'offline'}</span>
                              </div>
                          </div>
                          <button onClick={() => toggleAgentStatus(agent)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
                              {agent.status === 'running' ? <Square className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Activity Console */}
          <div className="lg:col-span-2 bg-[#050810] border border-slate-800 rounded-[2rem] flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/10">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Operational Telemetry</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/20"></div>
                    </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar text-slate-500">
                    {(Array.isArray(logs) ? logs : []).slice().reverse().map((log, i) => (
                        <div key={i} className="flex gap-4 group">
                             <span className="text-slate-800 shrink-0">[{log.time}]</span>
                             <span className="text-blue-500/80 font-bold">[{log.agent_id || 'SYS'}]</span>
                             <span className="text-slate-400 group-hover:text-white transition-colors">{log.action || log.message}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleCommand} className="p-5 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 focus-within:border-emerald-500/40 transition-colors">
                        <span className="text-emerald-500 font-bold">&gt;</span>
                        <input value={commandInput} onChange={e => setCommandInput(e.target.value)} placeholder="Execute terminal instruction..." className="bg-transparent border-none outline-none text-emerald-400 w-full text-xs font-mono" />
                    </div>
                </form>
          </div>

      </div>

    </div>
  );
};
