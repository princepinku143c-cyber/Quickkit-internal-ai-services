import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Puzzle, Lock, HelpCircle, CheckCircle2, Loader2, Link, 
  Copy, Check, Mail, Phone, CreditCard, Sparkles, Settings2,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface IntegrationsProps {
  user: UserProfile;
}

interface AppDetails {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  fields: { name: string; key: string; label: string; placeholder: string; type: 'text' | 'password' }[];
}

const APPS: AppDetails[] = [
  {
    id: 'stripe',
    name: 'Stripe / Razorpay',
    desc: 'Send invoices & collect payments directly from the CRM.',
    icon: CreditCard,
    color: 'from-blue-500 to-indigo-500 shadow-blue-500/20',
    fields: [
      { name: 'stripePublicKey', key: 'stripePublicKey', label: 'Public Key (Publishable)', placeholder: 'pk_live_...', type: 'text' },
      { name: 'stripeSecretKey', key: 'stripeSecretKey', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio Gateway',
    desc: 'Automate SMS and WhatsApp reminders directly to leads.',
    icon: Phone,
    color: 'from-red-500 to-rose-500 shadow-red-500/20',
    fields: [
      { name: 'twilioSid', key: 'twilioSid', label: 'Account SID', placeholder: 'AC...', type: 'text' },
      { name: 'twilioToken', key: 'twilioToken', label: 'Auth Token', placeholder: 'Twilio Auth Token', type: 'password' },
      { name: 'twilioSender', key: 'twilioSender', label: 'Sender Number (WhatsApp/SMS)', placeholder: '+1...', type: 'text' }
    ]
  },
  {
    id: 'brevo',
    name: 'Brevo / SendGrid',
    desc: '2-way email synchronization for lead threads.',
    icon: Mail,
    color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    fields: [
      { name: 'brevoKey', key: 'brevoKey', label: 'SMTP / API Key', placeholder: 'xkeysib-...', type: 'password' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI / OpenRouter',
    desc: 'Activate the Neural AI Agent to auto-respond to leads.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500 shadow-purple-500/20',
    fields: [
      { name: 'openaiKey', key: 'openaiKey', label: 'API Key', placeholder: 'sk-proj-...', type: 'password' }
    ]
  }
];

export const IntegrationsView: React.FC<IntegrationsProps> = ({ user }) => {
  const [integrations, setIntegrations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<AppDetails | null>(null);
  
  // Modal Input Values State
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  // Generate unique Webhook URL
  const webhookUrl = `https://quickkitai.com/api/webhook?client_id=${user.uid}`;

  useEffect(() => {
    const loadIntegrations = async () => {
      if (!db || Object.keys(db).length === 0 || !user.uid) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db as any, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.integrations) {
            setIntegrations(data.integrations);
          }
        }
      } catch (e) {
        console.error("Failed to load integrations:", e);
      }
      setLoading(false);
    };
    loadIntegrations();
  }, [user.uid]);

  const handleOpenConnect = (app: AppDetails) => {
    setActiveApp(app);
    // Pre-populate fields
    const initial: Record<string, string> = {};
    app.fields.forEach(f => {
      initial[f.name] = integrations[f.key] || '';
    });
    setInputValues(initial);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    setSaving(true);
    try {
      const updatedIntegrations = {
        ...integrations,
        ...inputValues
      };

      if (db && Object.keys(db).length > 0) {
        const docRef = doc(db as any, 'users', user.uid);
        await setDoc(docRef, { integrations: updatedIntegrations }, { merge: true });
      }

      setIntegrations(updatedIntegrations);
      setActiveApp(null);
      alert(`✅ ${activeApp.name} integration updated successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to save integration credentials.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to determine if an app has credentials stored
  const isConnected = (app: AppDetails) => {
    return app.fields.every(f => !!integrations[f.key]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 text-sm font-mono animate-pulse">Initializing Integrations Hub...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Integrations Marketplace</h1>
        <p className="text-slate-400 text-sm font-medium">Connect your external APIs and webhooks to sync leads and automate actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Marketplace cards */}
        {APPS.map((app) => {
          const AppIcon = app.icon;
          const connected = isConnected(app);
          return (
            <div key={app.id} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-[2rem] flex flex-col justify-between relative overflow-hidden group min-h-[250px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                    <AppIcon className="w-5 h-5" />
                  </div>
                  {connected ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                      Disconnected
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-base tracking-wide uppercase mb-1">{app.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{app.desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-900 mt-6">
                <button
                  onClick={() => handleOpenConnect(app)}
                  className="w-full py-3 bg-[#0B1120] hover:bg-slate-900 border border-[#1e293b] hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="w-4 h-4 text-blue-500" /> {connected ? 'Configure Keys' : 'Connect Node'}
                </button>
              </div>
            </div>
          );
        })}

        {/* SPECIAL CARD: Universal Webhook */}
        <div className="p-6 bg-gradient-to-br from-indigo-950/20 via-slate-950/40 to-slate-950/60 border border-blue-500/20 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group min-h-[250px] shadow-lg shadow-indigo-900/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                <Link className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                System Hook
              </span>
            </div>
            <h3 className="font-bold text-white text-base tracking-wide uppercase mb-1">Universal Webhook</h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">Push leads automatically from Shopify, ClickFunnels, or FB Ads to your CRM.</p>
          </div>

          <div className="pt-6 border-t border-[#1e293b]/40 mt-6">
            <button
              onClick={() => setShowWebhookModal(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-1.5"
            >
              <Link className="w-4 h-4" /> Get Webhook URL
            </button>
          </div>
        </div>
      </div>

      {/* App Keys Connector Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                <Lock className="w-3.5 h-3.5" /> Secure Credentials Vault
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Connect {activeApp.name}</h3>
              <p className="text-xs text-slate-500">API keys are stored directly in your Firebase sandbox.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {activeApp.fields.map(f => (
                <div key={f.name}>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={inputValues[f.name] || ''}
                    onChange={e => setInputValues({ ...inputValues, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/80">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="px-6 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {saving ? 'Saving Vault...' : 'Save Keys'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <button
              onClick={() => setShowWebhookModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                <Link className="w-3.5 h-3.5" /> API Webhook Generator
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Your Webhook URL</h3>
              <p className="text-xs text-slate-500">Automatically push external leads to your Kanban dashboard.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="bg-transparent border-none outline-none text-xs text-slate-300 w-full font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors border border-blue-500/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Integration Instructions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste this URL into **Shopify Webhooks**, **Facebook Ads Manager (Zapier/Make)**, or **ClickFunnels Webhook settings**. When external leads trigger this webhook, they will instantly populate as a card inside your Opportunities Kanban board!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="w-full py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Close Webhook panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple X Close Icon fallback if lucide-react imports X differently (safety first)
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
