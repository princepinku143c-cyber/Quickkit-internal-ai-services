
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
      {activeTab === 'settings' && <ClientSettings user={user} />}
    </Layout>
  );
};
