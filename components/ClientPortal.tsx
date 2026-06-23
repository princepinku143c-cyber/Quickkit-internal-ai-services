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

  const isClient = user.role === 'client';

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={onLogout}
    >
      {activeTab === 'dashboard' && <Dashboard user={user} />}
      {!isClient && activeTab === 'leads' && <LeadsView user={user} />}
      {!isClient && activeTab === 'accounts' && <AccountsView user={user} />}
      {activeTab === 'opportunities' && <OpportunitiesView user={user} />}
      {!isClient && activeTab === 'contacts' && <ContactsView user={user} />}
      {activeTab === 'calendar' && <CalendarView user={user} />}
      {activeTab === 'reports' && <ReportsView user={user} />}
      {!isClient && activeTab === 'integrations' && <IntegrationsView user={user} />}
      {!isClient && activeTab === 'settings' && <ClientSettings user={user} />}
    </Layout>
  );
};
