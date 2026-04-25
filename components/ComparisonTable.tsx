
import React from 'react';
import { Check, X, Shield, Zap, Target, HeartHandshake } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
    const data = [
        { feature: 'Setup & Implementation', quickkit: 'Done-for-you (3 Days)', others: 'You do everything', highlight: true },
        { feature: 'Core AI Agents', quickkit: 'Native Neural Agents', others: 'Basic API Scripts', highlight: false },
        { feature: 'Maintenance Cost', quickkit: 'Flat 90% Cheaper', others: 'Per-task pricing (Expensive)', highlight: true },
        { feature: 'Custom Logic Integration', quickkit: 'Infinite (Private VPS)', others: 'Limited by platform', highlight: false },
        { feature: 'Dedicated Support', quickkit: 'Architect Support', others: 'Ticket bot', highlight: false },
    ];

    return (
        <section id="comparison" className="py-24 bg-nexus-dark relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Superior Engineering</h2>
                    <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Why high-growth teams <br/>
                        choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">QuickKit</span>
                    </h3>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-3 bg-slate-900/40 border border-slate-800 rounded-t-[2rem] overflow-hidden">
                        <div className="p-8 border-b border-slate-800 flex items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Feature</span>
                        </div>
                        <div className="p-8 border-b border-l border-slate-800 bg-blue-600/10 text-center flex flex-col items-center justify-center gap-2">
                             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <Zap className="w-4 h-4 text-white fill-current" />
                             </div>
                             <span className="text-sm font-black text-white uppercase tracking-tighter">QuickKit AI</span>
                        </div>
                        <div className="p-8 border-b border-l border-slate-800 text-center flex flex-col items-center justify-center gap-2 opacity-50">
                             <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Legacy Platforms (Zapier/Make)</span>
                        </div>
                    </div>

                    {data.map((row, idx) => (
                        <div key={idx} className={`grid grid-cols-3 border-x border-b border-slate-800 transition-colors hover:bg-white/[0.02] ${row.highlight ? 'bg-blue-600/5' : ''}`}>
                            <div className="p-8 flex items-center">
                                <span className={`text-sm font-bold uppercase tracking-wide ${row.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                                    {row.feature}
                                </span>
                            </div>
                            <div className="p-8 border-l border-slate-800 flex items-center justify-center gap-3">
                                <div className="w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[4]" />
                                </div>
                                <span className="text-sm font-black text-white text-center uppercase tracking-tight">{row.quickkit}</span>
                            </div>
                            <div className="p-8 border-l border-slate-800 flex items-center justify-center gap-3 opacity-30">
                                <div className="w-5 h-5 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
                                    <X className="w-3 h-3 stroke-[4]" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 text-center uppercase tracking-tight">{row.others}</span>
                            </div>
                        </div>
                    ))}

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center gap-4">
                            <Shield className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">Secure Node</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Private VPS Infrastructure</p>
                            </div>
                         </div>
                         <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center gap-4">
                            <Target className="w-8 h-8 text-emerald-500" />
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">US Targeted</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Optimized for Enterprise</p>
                            </div>
                         </div>
                         <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center gap-4">
                            <HeartHandshake className="w-8 h-8 text-amber-500" />
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">24/7 Support</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Human-in-the-loop audit</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
