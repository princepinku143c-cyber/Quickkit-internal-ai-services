
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, Bell, Slack, Mail } from 'lucide-react';

interface ClientSettingsProps {
  user: UserProfile;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    contactEmail: user.settings?.contactEmail || user.email,
    slackWebhook: user.settings?.slackWebhook || '',
    notificationPhone: user.settings?.notificationPhone || ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would update Firestore: users/{uid}
    // Here we just simulate a save
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Update local user state if possible, but for this demo we just visual confirm
    console.log("Saving Global Config:", formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Global Configuration</h1>
        <p className="text-slate-400">Manage variables used across all your automation workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Variables */}
        <div className="glass-panel p-6 rounded-xl border border-nexus-border">
          <div className="flex items-center gap-2 mb-6 border-b border-nexus-border pb-4">
             <Bell className="w-5 h-5 text-blue-400" />
             <h3 className="text-lg font-bold text-white">Notification Routes</h3>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" /> Default Email
                </label>
                <input 
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Slack className="w-4 h-4 text-slate-500" /> Slack Webhook URL
                </label>
                <input 
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={formData.slackWebhook}
                  onChange={e => setFormData({...formData, slackWebhook: e.target.value})}
                  className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono text-xs"
                />
             </div>
          </div>
        </div>

        {/* API Keys & Secrets (Placeholder) */}
        <div className="glass-panel p-6 rounded-xl border border-nexus-border opacity-75">
           <div className="flex items-center gap-2 mb-6 border-b border-nexus-border pb-4">
             <ShieldAlertIcon className="w-5 h-5 text-emerald-400" />
             <h3 className="text-lg font-bold text-white">Connected Integrations</h3>
          </div>
          <div className="space-y-4 text-center py-8">
             <p className="text-slate-500">Google Sheets: <span className="text-emerald-400 font-bold">Connected</span></p>
             <p className="text-slate-500">OpenAI API: <span className="text-emerald-400 font-bold">Connected</span></p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
         <button 
           onClick={handleSave}
           className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
         >
           {saved ? 'Saved Successfully!' : <><Save className="w-4 h-4" /> Save Changes</>}
         </button>
      </div>
    </div>
  );
};

const ShieldAlertIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
