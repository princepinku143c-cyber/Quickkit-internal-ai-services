import React from 'react';
import { UserProfile } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video } from 'lucide-react';
import { useIndustry } from '../lib/IndustryContext';

interface CalendarProps {
  user: UserProfile;
}

export const CalendarView: React.FC<CalendarProps> = ({ user }) => {
  const { industryType } = useIndustry();

  const getEventName = () => {
    if (industryType === 'Real Estate') return 'Property Viewing Schedule';
    if (industryType === 'E-commerce') return 'Store Operations Review';
    if (industryType === 'Healthcare') return 'Patient Consultations Agenda';
    if (industryType === 'Travel') return 'Booking Consultation Calendar';
    return 'CRM Team Calendar';
  };

  const mockEvents = [
    { id: 1, title: 'Introductory Discovery Call', type: 'Virtual', time: '10:00 AM - 10:30 AM', date: 'June 23, 2026', host: 'Alice Smith' },
    { id: 2, title: industryType === 'Real Estate' ? 'Site Viewing: 25 Broad St' : 'Proposal Pitch & Integration Review', type: 'On-Site', time: '02:00 PM - 03:00 PM', date: 'June 24, 2026', host: 'David Jones' },
    { id: 3, title: 'Contract Signature Alignment', type: 'Virtual', time: '11:00 AM - 11:45 AM', date: 'June 26, 2026', host: 'Elena Rostova' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">{getEventName()}</h1>
          <p className="text-slate-400 text-sm font-medium">Track your upcoming appointments, viewings, and negotiations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Mock Calendar Widget Grid */}
        <div className="lg:col-span-2 bg-[#0f172a]/60 border border-[#1e293b] p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">June 2026</h3>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-slate-500 font-bold uppercase tracking-wider pb-2">{d}</div>
            ))}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 22;
              const hasEvent = [23, 24, 26].includes(day);
              return (
                <div
                  key={day}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-between h-14 transition-colors ${
                    isToday
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-lg shadow-blue-600/30'
                      : hasEvent
                      ? 'bg-blue-500/5 border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500/10'
                      : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Agenda List */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Upcoming Agenda</h3>
          <div className="space-y-4">
            {mockEvents.map((evt) => (
              <div key={evt.id} className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-4 hover:border-slate-800 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-sm uppercase leading-snug">{evt.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    {evt.type === 'Virtual' ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <MapPin className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{evt.type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-900/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-mono text-[10px]">{evt.time}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{evt.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
