import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  fullScreen?: boolean;
  message?: string;
}

export const GlobalLoader: React.FC<Props> = ({ fullScreen = true, message = "Initializing Nexus Core..." }) => {
  const [show, setShow] = useState(false);

  // Prevent flash of loading screen for very fast connections
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
       <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/30 animate-pulse"></div>
          
          {/* Inner futuristic spinner container */}
          <div className="w-24 h-24 relative flex items-center justify-center">
              <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeDasharray="70 200" />
              </svg>
              
              <svg className="w-16 h-16 absolute animate-[spin_4s_ease-in-out_infinite_reverse]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 200" />
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                      <span className="text-white font-black text-xs">AI</span>
                   </div>
              </div>
          </div>
       </div>

       <div className="text-center">
           <h3 className="text-slate-200 font-bold tracking-widest uppercase text-sm mb-1">{message}</h3>
           <div className="flex justify-center gap-1">
               <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
               <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
               <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
           </div>
       </div>
    </div>
  );

  if (fullScreen) {
      return (
          <div className="fixed inset-0 z-[100] bg-[#030712] flex items-center justify-center">
              {content}
          </div>
      );
  }

  return (
      <div className="w-full h-64 flex items-center justify-center">
          {content}
      </div>
  );
};
