import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  Loader2, Link, Copy, Check, Mail, Phone, CreditCard, Sparkles, AlertCircle,
} from 'lucide-react';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
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
}

const APPS: AppDetails[] = [
  { id: 'stripe', name: 'Stripe / Razorpay', desc: 'Send invoices & collect payments directly from the CRM.', icon: CreditCard, color: 'from-blue-500 to-indigo-500 shadow-blue-500/20' },
  { id: 'twilio', name: 'Twilio Gateway', desc: 'Automate SMS and WhatsApp reminders directly to leads.', icon: Phone, color: 'from-red-500 to-rose-500 shadow-red-500/20' },
  { id: 'brevo', name: 'Brevo / SendGrid', desc: '2-way email synchronization for lead threads.', icon: Mail, color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20' },
  { id: 'openai', name: 'OpenAI / OpenRouter', desc: 'Activate the Neural AI Agent to auto-respond to leads.', icon: Sparkles, color: 'from-purple-500 to-pink-500 shadow-purple-500/20' },
];

export const IntegrationsView: React.FC<IntegrationsProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [testingHook, setTestingHook] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState('');

  // Generate unique Webhook URL
  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/webhook?client_id=${user.uid}`;
  const ensureWebhookSecret = async () => {
    if (webhookSecret) return webhookSecret;
    if (!db || !user.uid) throw new Error('Connect your account database before creating a webhook secret.');
    if (profileLoadFailed) {
      throw new Error('Your existing webhook secret could not be verified. Refresh the page before trying again.');
    }

    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const candidate = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const profileRef = doc(db as any, 'users', user.uid);
    const secret = await runTransaction(db as any, async (transaction) => {
      const profileSnap = await transaction.get(profileRef);
      if (!profileSnap.exists()) {
        throw new Error('Your account profile could not be found. Refresh the page or contact your administrator.');
      }

      const storedSecret = profileSnap.data()?.webhookSecret;
      if (storedSecret === undefined) {
        transaction.set(profileRef, { webhookSecret: candidate }, { merge: true });
        return candidate;
      }
      if (typeof storedSecret === 'string' && /^[a-f0-9]{64}$/.test(storedSecret)) {
        return storedSecret;
      }
      throw new Error('The stored webhook secret is invalid. It was not replaced; contact your administrator.');
    });

    setWebhookSecret(secret);
    return secret;
  };
  const handleOpenWebhook = async () => {
    try { await ensureWebhookSecret(); setShowWebhookModal(true); }
    catch (err: any) { alert(`Could not prepare a secure webhook: ${err?.message || err}`); }
  };
  const handleCopySecret = async () => {
    if (!webhookSecret) return;
    await navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleTriggerTestPayload = async () => {
    if (!/^[a-f0-9]{64}$/.test(webhookSecret) || profileLoadFailed) return;
    setTestingHook(true);
    try {
      const response = await fetch(`/api/webhook?uid=${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret
        },
        body: JSON.stringify({
          name: `Jane Doe (Test Lead ${Math.floor(Math.random() * 1000)})`,
          email: `test-${Math.floor(Math.random() * 10000)}@example.com`,
          phone: `+1-555-019${Math.floor(Math.random() * 9)}`,
          company: "Acme Webhook Test LLC",
          projectName: "E-Commerce Pipeline Setup",
          budget: 7500,
          custom_metadata: {
            customField_test: "Automated webhook tester injection",
            leadSource: "QuickKit Integrations Tester"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      alert("🚀 Webhook Triggered Successfully! A new card has been added to your Kanban board.");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Failed to trigger test payload: ${err.message || err}`);
    } finally {
      setTestingHook(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadedUserId('');
    setWebhookSecret('');
    setProfileLoadFailed(false);

    const loadIntegrations = async () => {
      try {
        if (!db || Object.keys(db).length === 0 || !user.uid) {
          throw new Error('Account database is not configured.');
        }
        const docRef = doc(db as any, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (!active) return;
        if (!docSnap.exists()) {
          setProfileLoadFailed(true);
          return;
        }

        const storedSecret = docSnap.data()?.webhookSecret;
        if (storedSecret === undefined) return;
        if (typeof storedSecret === 'string' && /^[a-f0-9]{64}$/.test(storedSecret)) {
          setWebhookSecret(storedSecret);
        } else {
          setProfileLoadFailed(true);
        }
      } catch {
        if (!active) return;
        setProfileLoadFailed(true);
        console.error("Failed to load integrations profile.");
      } finally {
        if (active) {
          setLoadedUserId(user.uid);
          setLoading(false);
        }
      }
    };

    void loadIntegrations();
    return () => {
      active = false;
    };
  }, [user.uid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div role="status" aria-live="polite" className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
        Third-party credentials must be configured server-side. This portal does not yet provide a tenant-isolated credential vault. Do not paste API keys here; ask an administrator to configure an approved server-side integration.
      </div>
      {profileLoadFailed && (
        <div role="alert" aria-live="assertive" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
          We could not verify this account's existing webhook secret. Webhook setup is paused to avoid replacing a working secret after a read failure. Refresh the page and try again; contact your administrator if the problem continues.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Marketplace cards */}
        {APPS.map((app) => {
          const AppIcon = app.icon;
          return (
            <div key={app.id} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-[2rem] flex flex-col justify-between relative overflow-hidden group min-h-[250px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                    <AppIcon className="w-5 h-5" />
                  </div>
                  <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Admin setup
                  </span>
                </div>
                <h3 className="font-bold text-white text-base tracking-wide uppercase mb-1">{app.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{app.desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  disabled
                  title="Third-party credentials are configured server-side, not stored in client Firestore."
                  className="w-full py-3 bg-[#0B1120] border border-[#1e293b] text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
                >
                  Server setup required
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

          <div className="pt-6 border-t border-[#1e293b]/40 mt-6 space-y-2.5">
            <button
              onClick={handleOpenWebhook}
              disabled={profileLoadFailed}
              title={profileLoadFailed ? "Refresh the page to verify the existing webhook secret before continuing." : undefined}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Link className="w-4 h-4" /> Get Webhook URL
            </button>
            <button
              onClick={handleTriggerTestPayload}
              disabled={testingHook || !webhookSecret || profileLoadFailed}
              className="w-full py-3 bg-[#0B1120] hover:bg-slate-900 border border-[#1e293b] hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testingHook ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Sending Payload...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-500" /> Trigger Test Payload
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Required HTTP header: X-Webhook-Secret</label>
                <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <input type="text" readOnly value={webhookSecret} className="bg-transparent border-none outline-none text-xs text-emerald-300 w-full font-mono" />
                  <button type="button" onClick={handleCopySecret} className="p-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg border border-emerald-500/20">
                    {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-300">Treat this as a password. Add it as an HTTP header in your external automation; never put it in the URL.</p>
              </div>
              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Integration Instructions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste this URL into your external automation and configure the HTTP header **X-Webhook-Secret** using the secret above. Keep the secret private. Requests without a valid account secret are rejected; successful requests create a lead card in your Opportunities Kanban board.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleTriggerTestPayload}
                  disabled={testingHook || !webhookSecret || profileLoadFailed}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {testingHook ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Test Payload...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Trigger Test Payload
                    </>
                  )}
                </button>
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
        </div>
      )}
    </div>
  );
};

// Simple X Close Icon fallback if lucide-react imports X differently (safety first)
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
