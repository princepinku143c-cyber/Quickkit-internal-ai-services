import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { LeadsView } from './LeadsView';
import { AccountsView } from './AccountsView';
import { OpportunitiesView } from './OpportunitiesView';
import { ContactsView } from './ContactsView';
import { CalendarView } from './CalendarView';
import { ReportsView } from './ReportsView';
import { IntegrationsView } from './IntegrationsView';
import { ClientSettings } from './ClientSettings';

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
      {activeTab === 'leads' && <LeadsView user={user} />}
      {activeTab === 'accounts' && <AccountsView user={user} />}
      {activeTab === 'opportunities' && <OpportunitiesView user={user} />}
      {activeTab === 'contacts' && <ContactsView user={user} />}
      {activeTab === 'calendar' && <CalendarView user={user} />}
      {activeTab === 'reports' && <ReportsView user={user} />}
      {activeTab === 'integrations' && <IntegrationsView user={user} />}
      {activeTab === 'settings' && <ClientSettings user={user} />}
    </Layout>
  );
};
