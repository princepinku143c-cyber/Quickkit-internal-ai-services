import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Contact, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContactsProps {
  user: UserProfile;
}

export const ContactsView: React.FC<ContactsProps> = ({ user }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || Object.keys(db).length === 0) {
      setLoading(false);
      return;
    }
    const q = query(collection(db as any, 'leads'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Contacts Directory</h1>
          <p className="text-slate-400 text-sm font-medium">Keep track of individual decision makers and operational leads.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-500 animate-pulse text-sm font-mono">Syncing contacts pipeline...</div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="border border-dashed border-[#1e293b] rounded-3xl p-16 text-center">
          <Contact className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-white uppercase mb-1">No Data Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">Add a Lead to Begin populating the contacts list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((c, index) => (
            <div key={c.id || index} className="p-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">
                  {c.name ? c.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-wide uppercase truncate max-w-[180px]">{c.name || 'Unknown User'}</h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Opportunity Lead</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex items-center gap-3.5">
                  <Building2 className="w-4 h-4 text-slate-600 animate-pulse" />
                  <span className="font-medium text-slate-300">{c.businessName || 'No Company Mapped'}</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span className="font-mono text-slate-300 truncate">{c.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span className="font-mono text-slate-300">{c.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span>Remote Location</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
