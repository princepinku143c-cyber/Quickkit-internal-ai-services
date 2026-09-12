import React, { useEffect, useState } from 'react';
interface Props { fullScreen?: boolean; message?: string; }
export const GlobalLoader: React.FC<Props> = ({ fullScreen = true, message = 'Preparing QuickKit AI...' }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setShow(true), 120); return () => clearTimeout(timer); }, []);
  if (!show) return null;
  const content = <div className="flex flex-col items-center justify-center" role="status" aria-live="polite"><div className="relative w-32 h-20 flex items-center justify-center"><div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" /><div className="absolute w-20 h-20 rounded-full bg-blue-500/10 blur-2xl animate-pulse" /><div className="relative flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" /><span className="w-12 h-px bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400" /><span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse [animation-delay:180ms]" /></div></div><div className="mt-1 text-center"><div className="text-white font-black tracking-[0.25em] uppercase text-xs">QuickKit AI</div><div className="mt-2 text-slate-500 text-[10px] font-mono tracking-widest uppercase">{message}</div></div></div>;
  return fullScreen ? <div className="fixed inset-0 z-[100] bg-[#030712] flex items-center justify-center">{content}</div> : <div className="w-full h-64 flex items-center justify-center">{content}</div>;
};
