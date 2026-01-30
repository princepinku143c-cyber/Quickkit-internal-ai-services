
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface SmartBotProps {
  onOpenArchitect?: () => void;
}

// Now purely a Trigger Button for the Main AI
export const SmartBot: React.FC<SmartBotProps> = ({ onOpenArchitect }) => {
  
  const handleClick = () => {
    if (onOpenArchitect) {
        // Scroll to hero or open modal directly
        const heroInput = document.getElementById('architect-input');
        if (heroInput) {
            heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            heroInput.focus();
        }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
       <button 
         onClick={handleClick}
         className="bg-slate-800 hover:bg-blue-900/40 border border-blue-500/30 text-blue-400 p-4 rounded-full shadow-lg flex items-center gap-3 transition-all hover:scale-105 group relative overflow-hidden"
       >
         <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
         <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
         </div>
         <span className="font-bold text-sm hidden group-hover:block whitespace-nowrap text-white pr-2">
            Ask AI Architect
         </span>
       </button>
    </div>
  );
};
