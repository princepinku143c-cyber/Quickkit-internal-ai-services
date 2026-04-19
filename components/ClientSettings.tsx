import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, Bell, Mail, Key, Shield, Webhook, EyeOff, Eye, Server } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ClientSettingsProps {
  user: UserProfile;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    contactEmail: user.settings?.contactEmail || user.email,
    slackWebhook: user.settings?.slackWebhook || '',
    notificationPhone: user.settings?.notificationPhone || ''
  });

  const [apiData, setApiData] = useState({
    geminiKey: '',
    openclawEndpoint: '',
    customWebhook: ''
  });

  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const businessId = "biz_1"; 

  useEffect(() => {
    // Load config from Firebase
    const loadConfig = async () => {
        if (!db) return;
        try {
            const docRef = doc(db as any, 'business_configs', businessId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.apiData) setApiData(data.apiData);
            }
        } catch (e) {
            console.error("Failed to load config", e);
        }
    };
    loadConfig();
  }, [businessId]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);
    
    // Strict Input Validation for Enterprise Strength
    if (apiData.customWebhook && !/^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/.test(apiData.customWebhook)) {
        setErrorMsg("Invalid Telegram Bot Token format.");
        return;
    }
    if (apiData.openclawEndpoint && apiData.openclawEndpoint.length < 20) {
        setErrorMsg("OpenClaw Endpoint Token seems too short or invalid.");
        return;
    }
    if (apiData.geminiKey && !apiData.geminiKey.startsWith('sk_') && !apiData.geminiKey.startsWith('AIza')) {
        setErrorMsg("API Key must start with 'sk_' or 'AIza'.");
        return;
    }

    try {
        if (db && Object.keys(db).length > 0) {
            const docRef = doc(db as any, 'business_configs', businessId);
            await setDoc(docRef, { apiData, formData, updated_at: new Date().toISOString(), updated_by: user.uid }, { merge: true });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    } catch (e) {
        console.error("Save config failed", e);
        setErrorMsg("Failed to save settings. Check Firebase rules.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <p className="text-slate-400">Manage security, API limits, and webhook routes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Secure API Config */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4 relative">
             <div className="p-2 bg-purple-500/10 rounded-lg"><Key className="w-5 h-5 text-purple-400" /></div>
             <h3 className="text-lg font-bold text-white">Secure API Configuration</h3>
          </div>
          
          <div className="space-y-5 relative">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> AI Provider Key (OpenRouter)
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
                <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-blue-400 hover:underline">openrouter.ai/keys</a> — Supports 200+ AI models.</p>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" /> OpenClaw Endpoint (VPS)
                </label>
                <input 
                  type="text"
                  placeholder="https://api.yourvps.com/v1/claw"
                  value={apiData.openclawEndpoint}
                  onChange={e => setApiData({...apiData, openclawEndpoint: e.target.value})}
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-blue-300 font-mono text-sm focus:border-blue-500 outline-none"
                />
             </div>
          </div>
        </div>

        {/* Global Webhooks */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4 relative">
             <div className="p-2 bg-blue-500/10 rounded-lg"><Webhook className="w-5 h-5 text-blue-400" /></div>
             <h3 className="text-lg font-bold text-white">Event Webhooks</h3>
          </div>
          
          <div className="space-y-5 relative">
             
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" /> System Admin Email
                </label>
                <input 
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-300 focus:border-blue-500 outline-none"
                />
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
          {saved ? 'Settings Enforced' : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>
    </div>
  );
};
