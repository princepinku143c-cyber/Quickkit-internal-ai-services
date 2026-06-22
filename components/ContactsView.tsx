import React from 'react';
import { UserProfile } from '../types';
import { Contact, Search, Plus, Mail, Phone, Building2, MapPin } from 'lucide-react';

interface ContactsProps {
  user: UserProfile;
}

export const ContactsView: React.FC<ContactsProps> = ({ user }) => {
  const mockContacts = [
    { id: 1, name: 'Alice Smith', role: 'Head of Acquisition', company: 'Acme Development', email: 'alice@acme.com', phone: '+1 (555) 124-5678', location: 'New York, US' },
    { id: 2, name: 'David Jones', role: 'Chief Broker', company: 'Vanguard Realty Group', email: 'david@vanguardrealty.co', phone: '+44 20 7946 0958', location: 'London, UK' },
    { id: 3, name: 'Elena Rostova', role: 'Operations Partner', company: 'Nexus Holdings LLC', email: 'elena@nexusholdings.io', phone: '+1 (555) 987-6543', location: 'San Francisco, US' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Contacts Directory</h1>
          <p className="text-slate-400 text-sm font-medium">Keep track of individual decision makers and operational leads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockContacts.map((c) => (
          <div key={c.id} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-wide uppercase">{c.name}</h3>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{c.role}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400">
              <div className="flex items-center gap-3.5">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-300">{c.company}</span>
              </div>
              <div className="flex items-center gap-3.5">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="font-mono">{c.email}</span>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="w-4 h-4 text-slate-600" />
                <span className="font-mono">{c.phone}</span>
              </div>
              <div className="flex items-center gap-3.5">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>{c.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
