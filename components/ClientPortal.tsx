
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { Workflows } from './Workflows';
import { DataView } from './DataView';
import { Billing } from './Billing';
import { ClientSettings } from './ClientSettings';
import { AITerminal } from './AITerminal';

interface ClientPortalProps {
  user: UserProfile;
  onLogout: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={onLogout}
    >
      {activeTab === 'dashboard' && <Dashboard user={user} />}
      {activeTab === 'terminal' && <AITerminal user={user} />}
      {activeTab === 'workflows' && <Workflows user={user} />}
      {activeTab === 'data' && <DataView user={user} />}
      {activeTab === 'billing' && <Billing user={user} />}
      {activeTab === 'settings' && user.role === 'admin' && <ClientSettings user={user} />}
      {activeTab === 'settings' && user.role !== 'admin' && (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
          <div className="text-5xl">🔒</div>
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm">This section is only accessible to workspace administrators. Contact your admin for assistance.</p>
        </div>
      )}
    </Layout>
  );
};
