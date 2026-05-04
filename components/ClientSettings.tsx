import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, Mail, Key, Shield, EyeOff, Eye, Server, Lock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/api';

interface ClientSettingsProps {
  user: UserProfile;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    contactEmail: user.email || '',
  });

  const [apiData, setApiData] = useState({
    geminiKey: '',
    vpsEndpoint: '',
    vpsToken: '',
  });

  const [savedStatus, setSavedStatus] = useState({
    hasApiKey: false,
    hasVpsEndpoint: false,
    hasVpsToken: false
  });

  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-user config path: users/{uid}/private/settings
  useEffect(() => {
    const loadConfig = async () => {
        if (!db || Object.keys(db).length === 0 || !user.uid) {
          setLoading(false);
          return;
        }
        try {
            const docRef = doc(db as any, 'users', user.uid, 'private', 'settings');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.openrouterApiKey) setSavedStatus(prev => ({ ...prev, hasApiKey: true }));
                if (data.contactEmail) setFormData({ contactEmail: data.contactEmail });
                if (data.vpsEndpoint) setSavedStatus(prev => ({ ...prev, hasVpsEndpoint: true }));
                if (data.vpsToken) setSavedStatus(prev => ({ ...prev, hasVpsToken: true }));
            }
        } catch (e) {
            console.error("Failed to load config", e);
        }
        setLoading(false);
    };
    loadConfig();
  }, [user.uid]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    
    // Validate API key only if it's being updated (is not empty)
    if (apiData.geminiKey && apiData.geminiKey.length < 10) {
        setErrorMsg("API Key is too short. Please paste your full OpenRouter key.");
        return;
    }

    try {
        if (db && Object.keys(db).length > 0) {
            const updates: any = {
              contactEmail: formData.contactEmail,
              updated_at: new Date().toISOString()
            };

            // Only update keys if actually typed
            if (apiData.geminiKey) {
                updates.openrouterApiKey = apiData.geminiKey;
                setSavedStatus(prev => ({ ...prev, hasApiKey: true }));
            }
            if (apiData.vpsEndpoint) {
                updates.vpsEndpoint = apiData.vpsEndpoint;
                setSavedStatus(prev => ({ ...prev, hasVpsEndpoint: true }));
            }
            if (apiData.vpsToken) {
                updates.vpsToken = apiData.vpsToken;
                setSavedStatus(prev => ({ ...prev, hasVpsToken: true }));
            }

            const docRef = doc(db as any, 'users', user.uid, 'private', 'settings');
            await setDoc(docRef, updates, { merge: true });

            // Clear inputs (Write-Only)
            setApiData({ geminiKey: '', vpsEndpoint: '', vpsToken: '' });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    } catch (e) {
        console.error("Save config failed", e);
        setErrorMsg("Failed to save. Check internet or Firebase rules.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm animate-pulse">Loading your settings...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Settings</h1>
        <p className="text-slate-400">Private configuration — only visible to you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* AI Provider Key */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 border-b border-[#1e293b] pb-4 relative">
               <div className="flex items-center gap-2">
                 <div className="p-2 bg-purple-500/10 rounded-lg"><Key className="w-5 h-5 text-purple-400" /></div>
                 <div>
                   <h3 className="text-lg font-bold text-white">AI Provider Key</h3>
                   <p className="text-[10px] text-slate-500">Private — masked after save.</p>
                 </div>
               </div>
               {savedStatus.hasApiKey && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">LOCKED ✓</span>}
            </div>
            
            <div className="space-y-5 relative">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" /> OpenRouter API Key
                  </label>
                  <div className="relative">
                      <input 
                        type="password"
                        autoComplete="new-password"
                        value={apiData.geminiKey || (savedStatus.hasApiKey ? "****************" : "")}
                        onChange={e => setApiData({...apiData, geminiKey: e.target.value})}
                        onFocus={(e) => { if (savedStatus.hasApiKey && !apiData.geminiKey) e.target.value = ''; }}
                        placeholder={savedStatus.hasApiKey ? "Saved Securely (Type to overwrite)" : "sk-or-v1-..."}
                        className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:border-purple-500 outline-none pr-10"
                      />
                      <div className="absolute right-3 top-3 text-slate-500">
                          <Lock className="w-4 h-4" />
                      </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-blue-400 hover:underline">openrouter.ai/keys</a></p>
               </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4 relative">
               <div className="p-2 bg-blue-500/10 rounded-lg"><Mail className="w-5 h-5 text-blue-400" /></div>
               <h3 className="text-lg font-bold text-white">Account</h3>
            </div>
            <div className="space-y-5 relative">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" /> Notification Email
                  </label>
                  <input 
                    type="email"
                    value={formData.contactEmail}
                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-300 focus:border-blue-500 outline-none"
                  />
               </div>
               <div className="pt-2 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">User ID</span>
                    <span className="text-slate-600 font-mono text-[10px]">{user.uid.slice(0, 12)}...</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 border-b border-[#1e293b] pb-4 relative">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-amber-500/10 rounded-lg"><Server className="w-5 h-5 text-amber-500" /></div>
               <div>
                 <h3 className="text-lg font-bold text-white">VPS Configuration</h3>
                 <p className="text-[10px] text-slate-500">Write-Only: Saved values are hidden.</p>
               </div>
             </div>
          </div>
          <div className="space-y-5 relative">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Server className="w-4 h-4 text-amber-500/70" /> OpenClaw Endpoint</div>
                    {savedStatus.hasVpsEndpoint && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">SECURED ✓</span>}
                </label>
                <input 
                  type="text"
                  placeholder={savedStatus.hasVpsEndpoint ? "•••••••••••••••• (Type to overwrite)" : "https://api.yourvps.com/v1"}
                  value={apiData.vpsEndpoint}
                  onChange={e => setApiData({...apiData, vpsEndpoint: e.target.value})}
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-amber-300/80 font-mono text-sm focus:border-amber-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500/70" /> VPS Auth Token</div>
                    {savedStatus.hasVpsToken && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">SECURED ✓</span>}
                </label>
                <input 
                  type="password"
                  autoComplete="new-password"
                  placeholder={savedStatus.hasVpsToken ? "•••••••••••••••• (Type to overwrite)" : "Paste secret auth token"}
                  value={apiData.vpsToken}
                  onChange={e => setApiData({...apiData, vpsToken: e.target.value})}
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:border-emerald-500 outline-none"
                />
             </div>
             <div className="flex items-center justify-between pt-2">
                <button 
                  type="button"
                  onClick={async () => {
                      const endpoint = apiData.vpsEndpoint || '';
                      if (!endpoint) { alert("Enter an endpoint!"); return; }
                      const res = await apiCall('/api/ai?action=vps-test', { endpoint, token: apiData.vpsToken || '' });
                      alert(res.status === 'CONNECTED' ? '✅ VPS Online' : `❌ Failed: ${res.error || 'Check endpoint URL'}`);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                >
                  Test Connection
                </button>
                <div className="text-xs font-mono">
                   Status: <span className={savedStatus.hasVpsEndpoint ? "text-emerald-400" : "text-amber-400"}>
                     {savedStatus.hasVpsEndpoint ? '✅ Connected' : '❌ Disconnected'}
                   </span>
                 </div>
              </div>
           </div>
         </div>
       </div>
 
       <div className="flex flex-col items-end pt-6 gap-3">
         <button 
           type="submit"
           className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all ${
             saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
           }`}
         >
           {saved ? '✓ Saved' : <><Save className="w-4 h-4" /> Save Configuration</>}
         </button>
       </div>
       {errorMsg && <p className="text-xs text-red-500 text-right font-bold mt-2">{errorMsg}</p>}
     </form>
   );
 };
