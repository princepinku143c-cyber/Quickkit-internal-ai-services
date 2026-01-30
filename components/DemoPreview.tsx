
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { MessageCircle, Calendar, Bell } from 'lucide-react';

interface DemoPreviewProps {
  lang: Language;
}

const DEMOS = [
  { 
      id: 'reply', 
      label: 'Auto Reply', 
      icon: MessageCircle,
      messages: [
          { sender: 'user', text: "Do you have pricing for salons?" },
          { sender: 'bot', text: "Thinking..." },
          { sender: 'bot', text: "Yes! Our salon package starts at $99/mo including appointment reminders. Would you like to see a demo?" },
          { sender: 'user', text: "Yes please." },
          { sender: 'system', text: "Lead Captured: Salon Interest" }
      ]
  },
  { 
      id: 'book', 
      label: 'Instant Booking', 
      icon: Calendar,
      messages: [
          { sender: 'user', text: "I need an appointment for Tuesday." },
          { sender: 'bot', text: "Checking calendar..." },
          { sender: 'bot', text: "I have 2:00 PM and 4:30 PM available on Tuesday. Which works for you?" },
          { sender: 'user', text: "4:30 is good." },
          { sender: 'system', text: "✓ Appointment Confirmed & Synced to GCal" }
      ]
  },
];

export const DemoPreview: React.FC<DemoPreviewProps> = ({ lang }) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  // Animation Loop
  useEffect(() => {
    setMsgIndex(0); // Reset when demo changes
    const interval = setInterval(() => {
        setMsgIndex(prev => {
            if (prev < DEMOS[activeDemo].messages.length) return prev + 1;
            return prev; // Stay at end
        });
    }, 1500); // New message every 1.5s
    return () => clearInterval(interval);
  }, [activeDemo]);

  return (
    <section id="demo" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">See It In Action</h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {DEMOS.map((demo, idx) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(idx)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeDemo === idx 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <demo.icon className="w-4 h-4" />
                {demo.label}
              </button>
            ))}
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden h-[500px] flex flex-col">
              {/* Phone Header */}
              <div className="bg-slate-800 p-4 pt-8 flex items-center gap-3 border-b border-slate-700/50">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <h4 className="text-white text-sm font-bold">Nexus Bot</h4>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">● Online</span>
                 </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#0B0F19] relative">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 
                 {DEMOS[activeDemo].messages.slice(0, msgIndex).map((msg, i) => (
                    <div key={i} className={`flex w-full animate-fade-in ${
                        msg.sender === 'user' ? 'justify-end' : 
                        msg.sender === 'system' ? 'justify-center' : 'justify-start'
                    }`}>
                        {msg.sender === 'system' ? (
                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 mt-2">
                                {msg.text}
                            </div>
                        ) : (
                            <div className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}>
                                {msg.text === 'Thinking...' ? (
                                    <div className="flex gap-1 h-5 items-center px-1">
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                ) : msg.text}
                            </div>
                        )}
                    </div>
                 ))}
                 {/* Typing Indicator if not finished */}
                 {msgIndex < DEMOS[activeDemo].messages.length && (
                     <div className="flex justify-start animate-pulse">
                         <div className="text-[10px] text-slate-600 pl-2">Bot is typing...</div>
                     </div>
                 )}
              </div>

              {/* Fake Input */}
              <div className="p-4 bg-slate-800/50 border-t border-slate-800">
                  <div className="h-10 bg-slate-900 rounded-full border border-slate-700 w-full flex items-center px-4 text-xs text-slate-500">
                      Type a message...
                  </div>
              </div>
            </div>
            
            <p className="mt-8 text-slate-500 text-sm">
                * Actual bot response time is <span className="text-emerald-400 font-bold">under 1 second</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
