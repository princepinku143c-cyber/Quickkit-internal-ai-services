
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface SmartBotProps {
  onOpenArchitect?: () => void;
}

// Now triggers the Live Chat Widget
export const SmartBot: React.FC<SmartBotProps> = ({ onOpenArchitect }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
       <button 
         onClick={onOpenArchitect}
         className="bg-slate-800 hover:bg-blue-900/40 border border-blue-500/30 text-blue-400 p-4 rounded-full shadow-lg flex items-center gap-3 transition-all hover:scale-105 group relative overflow-hidden"
       >
         <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
         <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
         </div>
         <span className="font-bold text-sm max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap text-white pr-2">
            Chat with Kelly
         </span>
       </button>
    </div>
  );
};
