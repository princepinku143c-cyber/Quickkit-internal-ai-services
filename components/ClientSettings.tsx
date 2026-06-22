import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, Mail, User, Shield, Lock, Laptop, ShoppingBag, Compass, HelpCircle, CheckCircle2, Building2, HeartPulse } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useIndustry } from '../lib/IndustryContext';

interface ClientSettingsProps {
  user: UserProfile;
}

const INDUSTRIES = [
  { id: 'Real Estate', name: 'Real Estate', icon: Building2, desc: 'Property listings, broker channels & buyer matching.' },
  { id: 'Agency', name: 'Digital Agency / Web', icon: Laptop, desc: 'Client onboarding, service proposals & lead tracking.' },
  { id: 'E-commerce', name: 'E-commerce', icon: ShoppingBag, desc: 'Checkout qualification, support logs & orders sync.' },
  { id: 'Healthcare', name: 'Healthcare / Clinics', icon: HeartPulse, desc: 'Patient appointments, support desk & clinic CRM.' },
  { id: 'Travel', name: 'Travel & Tourism', icon: Compass, desc: 'Booking inquiries, tour packages & agent pipelines.' },
  { id: 'Custom', name: 'Custom (Other)', icon: HelpCircle, desc: 'Configure custom fields for your unique business niche.' }
];

export const ClientSettings: React.FC<ClientSettingsProps> = ({ user }) => {
  const { setIndustryTypeState } = useIndustry();
  const [selectedIndustry, setSelectedIndustry] = useState<string>(user.industryType || 'Real Estate');
  const [formData, setFormData] = useState({
    workspaceName: user.workspaceName || '',
    operatorName: user.operatorName || user.displayName || '',
    contactEmail: user.contactEmail || user.email || '',
  });

  const [crmInitialized, setCrmInitialized] = useState<boolean>(user.crmInitialized || false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      if (!db || Object.keys(db).length === 0 || !user.uid) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db as any, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.industryType) setSelectedIndustry(data.industryType);
          setFormData({
            workspaceName: data.workspaceName || '',
            operatorName: data.operatorName || data.displayName || '',
            contactEmail: data.contactEmail || data.email || '',
          });
          if (data.crmInitialized !== undefined) setCrmInitialized(data.crmInitialized);
        }
      } catch (e) {
        console.error("Failed to load user config:", e);
      }
      setLoading(false);
    };
    loadConfig();
  }, [user.uid]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!formData.workspaceName.trim()) {
      setErrorMsg("Workspace Name is required.");
      return;
    }
    if (!formData.operatorName.trim()) {
      setErrorMsg("Operator Name is required.");
      return;
    }

    try {
      if (db && Object.keys(db).length > 0) {
        const updates = {
          industryType: selectedIndustry,
          workspaceName: formData.workspaceName,
          operatorName: formData.operatorName,
          contactEmail: formData.contactEmail,
          crmInitialized: crmInitialized,
          updated_at: new Date().toISOString()
        };

        const docRef = doc(db as any, 'users', user.uid);
        await setDoc(docRef, updates, { merge: true });
      }
      setIndustryTypeState(selectedIndustry);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save config failed:", e);
      setErrorMsg("Failed to save. Check internet or Firebase rules.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm animate-pulse">Loading your dashboard settings...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Settings</h1>
        <p className="text-slate-400">Configure your dynamic Odoo CRM workspace and industry niche mappings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Industry Selector Card Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-6 border-b border-[#1e293b] pb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Select Your Industry</h3>
                <p className="text-[10px] text-slate-500">Adapts terminology across your entire workspace.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INDUSTRIES.map((ind) => {
                const isSelected = selectedIndustry === ind.id;
                const IconComponent = ind.icon;
                return (
                  <div
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between h-36 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                        : 'bg-[#0B1120] border-[#1e293b] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-900 text-slate-500'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">{ind.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ind.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Odoo CRM Connection Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0f172a]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1e293b] shadow-xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 border-b border-[#1e293b] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Smart CRM Link</h3>
                  <p className="text-[10px] text-slate-500">Initialize and connect to Master Odoo pipeline.</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={formData.workspaceName}
                  onChange={e => setFormData({ ...formData, workspaceName: e.target.value })}
                  placeholder="e.g. My Agency Hub"
                  className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Operator Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={e => setFormData({ ...formData, operatorName: e.target.value })}
                    placeholder="e.g. Prince Kaada"
                    className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                  />
                  <div className="absolute left-3 top-3 text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="operator@company.com"
                    className="w-full bg-[#0B1120] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500 transition-colors pl-10"
                  />
                  <div className="absolute left-3 top-3 text-slate-600">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e293b] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCrmInitialized(prev => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    crmInitialized
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {crmInitialized ? 'crm initialized' : 'initialize crm'}
                </button>
                <div className="text-xs font-mono">
                  Status: <span className={crmInitialized ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {crmInitialized ? 'Connected ✓' : 'Offline'}
                  </span>
                </div>
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
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>
      {errorMsg && <p className="text-xs text-red-500 text-right font-bold mt-2">{errorMsg}</p>}
    </form>
  );
};
