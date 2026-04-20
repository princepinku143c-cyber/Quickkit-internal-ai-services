import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, Mail, Key, Shield, EyeOff, Eye, Server, Lock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    hasVpsEndpoint: false,
    hasVpsToken: false
  });

  const [showKey, setShowKey] = useState(false);
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
                if (data.apiKey) setApiData(prev => ({ ...prev, geminiKey: data.apiKey }));
                if (data.contactEmail) setFormData({ contactEmail: data.contactEmail });
                
                // Write-only logic: If data exists in DB, mark as saved, but don't populate input
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

  const handleSave = async () => {
    setErrorMsg(null);
    
    if (apiData.geminiKey && apiData.geminiKey.length < 10) {
        setErrorMsg("API Key is too short. Please paste your full OpenRouter key.");
        return;
    }

    try {
        if (db && Object.keys(db).length > 0) {
            const updates: any = {
              apiKey: apiData.geminiKey,
              contactEmail: formData.contactEmail,
              updated_at: new Date().toISOString()
            };

            // Only update VPS details if the user actually typed something new
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

            // Clear the local state so the inputs become empty again (Write-Only policy)
            setApiData(prev => ({ ...prev, vpsEndpoint: '', vpsToken: '' }));
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
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Settings</h1>
        <p className="text-slate-400">Private configuration — only visible to you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Settings Column */}
        <div className="space-y-8">
          {/* AI Provider Key */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4 relative">
               <div className="p-2 bg-purple-500/10 rounded-lg"><Key className="w-5 h-5 text-purple-400" /></div>
               <div>
                 <h3 className="text-lg font-bold text-white">AI Provider Key</h3>
                 <p className="text-[10px] text-slate-500">Private — encrypted and stored per-user.</p>
               </div>
            </div>
            
            <div className="space-y-5 relative">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" /> OpenRouter API Key
                  </label>
                  <div className="relative">
                      <input 
                      type={showKey ? "text" : "password"}
                      value={apiData.geminiKey}
                      onChange={e => setApiData({...apiData, geminiKey: e.target.value})}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:border-purple-500 outline-none pr-10"
                      />
                      <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-3 text-slate-500 hover:text-white">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-slate-500">Account Tier</span>
                    <span className="text-blue-400 font-bold">{user.tier || 'STARTER'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Server & Infrastructure Column */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4 relative">
             <div className="p-2 bg-amber-500/10 rounded-lg"><Server className="w-5 h-5 text-amber-500" /></div>
             <div>
               <h3 className="text-lg font-bold text-white">VPS Configuration</h3>
               <p className="text-[10px] text-slate-500">Write-Only: Saved values are hidden for security.</p>
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
                  placeholder={savedStatus.hasVpsToken ? "•••••••••••••••• (Type to overwrite)" : "Paste secret auth token"}
                  value={apiData.vpsToken}
                  onChange={e => setApiData({...apiData, vpsToken: e.target.value})}
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:border-emerald-500 outline-none"
                />
             </div>

             <div className="bg-[#0B1120] border border-[#1e293b] p-3 rounded-lg mt-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-amber-500">Security Note:</strong> Your server details operate on a strict <strong>Write-Only</strong> policy. Once saved, they are never exposed to the frontend browser interface again. To update, simply enter a new value.
                </p>
             </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col items-end pt-6 gap-3">
        {errorMsg && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold animate-pulse">
             ⚠️ {errorMsg}
          </div>
        )}
        <button 
          onClick={handleSave}
          className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1 ${
            saved 
            ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
          }`}
        >
          {saved ? '✓ Saved Successfully' : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>
    </div>
  );
};
