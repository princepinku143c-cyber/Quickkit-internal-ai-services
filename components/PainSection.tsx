import React from 'react';
import { ArrowDown, CalendarX2, Clock3, DatabaseZap, MessageSquare, UserRoundX } from 'lucide-react';

export const PainSection: React.FC = () => {
  const pains = [
    { icon: MessageSquare, title: 'Slow first response', text: 'Fresh property enquiries wait while the sales team is busy with calls, meetings and follow-ups.', color:'text-red-300', bg:'bg-red-500/10' },
    { icon: UserRoundX, title: 'Leads fall through', text: 'Without a consistent qualification and routing process, good prospects can get lost between people and tools.', color:'text-orange-300', bg:'bg-orange-500/10' },
    { icon: Clock3, title: 'Follow-up becomes a job', text: 'Salespeople spend hours repeating the same reminders, status checks and customer replies.', color:'text-amber-300', bg:'bg-amber-500/10' },
    { icon: CalendarX2, title: 'Site visits go cold', text: 'Scheduling, confirmation, rescheduling and reminders can become fragmented across the team.', color:'text-pink-300', bg:'bg-pink-500/10' },
    { icon: DatabaseZap, title: 'CRM hygiene suffers', text: 'Important context can stay inside chats or spreadsheets instead of reaching the system your team uses to sell.', color:'text-purple-300', bg:'bg-purple-500/10' },
  ];

  return (
    <section className="py-28 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(239,68,68,.055),transparent_45%)] pointer-events-none" />
      <div className="container mx-auto px-5 md:px-8 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-[.22em] text-red-300"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> The manual-work tax</div>
          <h2 className="mt-7 text-4xl md:text-6xl font-black text-white tracking-[-.045em]">Your sales team should sell.<br /><span className="text-slate-500">The system should carry the repetitive work.</span></h2>
          <p className="mt-5 text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">The goal is not to remove people. It is to give them a connected operating layer that handles approved repeatable work and escalates the conversations that need a human.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pains.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={`rounded-[1.6rem] border border-white/7 bg-slate-950/65 p-6 md:p-7 flex items-start gap-4 ${i===4 ? 'md:col-span-2 md:max-w-[720px] md:mx-auto md:w-full' : ''}`}>
                <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${p.bg}`}><Icon className={`w-6 h-6 ${p.color}`} /></div>
                <div><h3 className="text-base md:text-lg font-black text-white">{p.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p></div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col items-center">
          <ArrowDown className="w-7 h-7 text-blue-300 animate-bounce mb-4" />
          <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 px-6 py-4 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[.22em] text-blue-300">The shift</p>
            <p className="mt-1 text-base md:text-lg font-black text-white">Automate the repeatable work. Keep humans in control.</p>
          </div>
        </div>
      </div>
    </section>
  );
};