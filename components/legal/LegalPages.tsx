
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Scale, CreditCard, ArrowLeft } from 'lucide-react';

export const LegalPages = () => {
    const location = useLocation();
    
    useEffect(() => {
        // Handle scrolling to sections if hash is present
        const sectionId = location.pathname.split('/').pop();
        if (sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
            {/* Minimal Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Studio
                    </Link>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Link to="/privacy" className={`hover:text-white transition-colors ${location.pathname === '/privacy' ? 'text-blue-400' : ''}`}>Privacy</Link>
                        <Link to="/terms" className={`hover:text-white transition-colors ${location.pathname === '/terms' ? 'text-blue-400' : ''}`}>Terms</Link>
                        <Link to="/refund" className={`hover:text-white transition-colors ${location.pathname === '/refund' ? 'text-blue-400' : ''}`}>Refunds</Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto py-32 px-6 space-y-32">
                
                {/* Privacy Policy */}
                <section id="privacy" className={`space-y-8 transition-opacity duration-700 ${location.pathname !== '/privacy' && 'opacity-40 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4 text-blue-500 mb-2">
                        <Shield className="w-8 h-8" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Guardian Protocol v1.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Privacy Policy</h1>
                    <div className="space-y-6 leading-relaxed text-lg">
                        <p>At QuickKit AI, we respect your privacy and are committed to protecting your personal information. This policy outlines how we handle your data in the context of high-performance AI operations.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white border-l-2 border-blue-500 pl-4 uppercase tracking-tight">1. Data Minimization</h3>
                                <p className="text-sm text-slate-400">We collect only essential information required to deliver our automation services, including your name, email, and business requirements. No unused data is stored.</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white border-l-2 border-blue-500 pl-4 uppercase tracking-tight">2. Secure Processing</h3>
                                <p className="text-sm text-slate-400">Your transaction details and project data are encrypted using industry-standard AES-256 protocols. We do not store credit card information; all payments are handled by PayPal.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Terms of Service */}
                <section id="terms" className={`space-y-8 transition-opacity duration-700 ${location.pathname !== '/terms' && 'opacity-40 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4 text-indigo-500 mb-2">
                        <Scale className="w-8 h-8" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Operational Framework</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Terms of Service</h1>
                    <div className="space-y-8 leading-relaxed text-lg pt-8">
                        <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-6">
                            <div className="flex gap-6">
                                <div className="text-blue-500 font-black text-2xl font-mono">01.</div>
                                <div>
                                    <h4 className="text-white font-bold uppercase mb-2">Advance Requirement</h4>
                                    <p className="text-sm text-slate-400">A 10% non-refundable advance payment is mandatory to activate our elite engineering team and initiate custom architecture build-outs.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-blue-500 font-black text-2xl font-mono">02.</div>
                                <div>
                                    <h4 className="text-white font-bold uppercase mb-2">Project Handover</h4>
                                    <p className="text-sm text-slate-400">Final system access and deployment credentials are provided strictly after 100% of the agreed build fee is captured via PayPal.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-blue-500 font-black text-2xl font-mono">03.</div>
                                <div>
                                    <h4 className="text-white font-bold uppercase mb-2">Intellectual Property</h4>
                                    <p className="text-sm text-slate-400">QuickKit AI retains the rights to base automation logic. You retain full ownership of all custom business data and workflow definitions processed by the system.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Refund Policy */}
                <section id="refund" className={`space-y-8 transition-opacity duration-700 ${location.pathname !== '/refund' && 'opacity-40 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4 text-amber-500 mb-2">
                        <CreditCard className="w-8 h-8" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Merchant Protection</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Refund Policy</h1>
                    <div className="space-y-6 leading-relaxed text-lg pt-8">
                        <div className="bg-amber-500/5 border border-amber-500/10 p-10 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard className="w-32 h-32" /></div>
                            <h3 className="text-2xl font-black text-white mb-8">The 3-Day Rule</h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">✓</div>
                                    <p className="text-sm text-slate-300">Advance payments are refundable <strong>within 3 days only</strong> if no engineering development has been initialized.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-1">✕</div>
                                    <p className="text-sm text-slate-300">Once development begins (Blueprint Phase), advance payments become non-refundable to cover non-recoverable architect hours.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">!</div>
                                    <p className="text-sm text-slate-300">Full refunds are granted <strong>only</strong> if we fail to deliver the project demo within the contractually agreed timeline.</p>
                                </li>
                            </ul>
                            <div className="mt-12 pt-8 border-t border-amber-500/10 text-xs font-bold text-amber-500 uppercase tracking-widest text-center">
                                Submit refund requests to: accounts@quickkitai.com
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* Simple Footer */}
            <footer className="py-20 border-t border-slate-900 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QuickKit AI Industrial Standard Compliance</p>
            </footer>
        </div>
    );
};
