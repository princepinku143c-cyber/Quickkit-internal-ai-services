import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Kelly, your AI Business Consultant. How can I help you automate your sales, support, or database pipelines today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capturedEmails, setCapturedEmails] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Silent Email & Lead Capture helper
  const detectAndRouteEmail = async (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    if (match) {
      const email = match[0];
      // Only capture if we haven't already processed it in this session
      if (!capturedEmails.includes(email)) {
        setCapturedEmails(prev => [...prev, email]);
        try {
          // Asynchronous background fire-and-forget call
          fetch('/api/system?action=lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Global Chat Visitor',
              email: email,
              requirement: 'Lead captured via Kelly AI Widget',
              projectName: 'Chatbot Inquiry'
            })
          });
          console.log(`🤖 Silent Lead Routing triggered for: ${email}`);
        } catch (e) {
          console.error("Silent Lead Routing failed:", e);
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to state
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);

    // Silent background capture check
    detectAndRouteEmail(userMessage);

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai?action=kelly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('AI Node Connection Error');
      }

      const data = await response.json();
      const reply = data.reply || "Sorry, I'm experiencing a brief connection drop. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "I encountered a neural link failure. Please check your credentials or network and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] mb-4 bg-[#0f172a]/90 backdrop-blur-xl border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in z-[9999]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg text-white">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
                  Kelly - Global AI Consultant
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#050810]/40">
            {messages.map((msg, idx) => {
              const isKelly = msg.role === 'model';
              return (
                <div 
                  key={idx} 
                  className={`flex ${isKelly ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isKelly 
                        ? 'bg-[#1e293b]/70 text-slate-200 border border-[#1e293b] rounded-tl-sm' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {/* Loading / Typing State */}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[#1e293b]/70 border border-[#1e293b] text-slate-400 rounded-2xl rounded-tl-sm px-4 py-2 text-xs flex items-center gap-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>Typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSendMessage} 
            className="p-3 bg-slate-950/90 border-t border-[#1e293b]/40 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Kelly about pricing, CRM setups..."
              className="flex-1 bg-[#050810] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white disabled:text-slate-500 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:scale-105 transition-all shadow-blue-600/30 flex items-center justify-center relative group z-[9999] border border-blue-400/20"
        title="Consult Kelly"
      >
        <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping group-hover:scale-125"></span>
        {isOpen ? <X className="w-6 h-6 animate-fade-in" /> : <Bot className="w-6 h-6 text-blue-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
      </button>
    </div>
  );
};
