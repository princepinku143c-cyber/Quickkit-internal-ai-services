
import React from 'react';

export const LegalPages = () => {
    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 py-32 px-6">
            <div className="max-w-4xl mx-auto space-y-20">
                
                {/* Privacy Policy */}
                <section id="privacy" className="space-y-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
                    <div className="space-y-4 leading-relaxed">
                        <p>At QuickKit AI, we respect your privacy and are committed to protecting your personal information. This policy outlines how we handle your data.</p>
                        <h3 className="text-xl font-bold text-white mt-6">1. Data Collection</h3>
                        <p>We collect only essential information required to deliver our automation services, including your name, email, and business requirements. All data is processed securely via Firebase.</p>
                        <h3 className="text-xl font-bold text-white mt-6">2. Data Security</h3>
                        <p>Your transaction details and project data are encrypted using industry-standard protocols. We do not store your credit card information; all payments are handled securely by PayPal.</p>
                        <h3 className="text-xl font-bold text-white mt-6">3. Third-Party Services</h3>
                        <p>We may share necessary data with trusted partners like PayPal or AI model providers solely for the purpose of executing your automation workflows.</p>
                    </div>
                </section>

                <hr className="border-slate-800" />

                {/* Terms of Service */}
                <section id="terms" className="space-y-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Terms of Service</h1>
                    <div className="space-y-4 leading-relaxed">
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong>10% Advance Requirement:</strong> A non-refundable 10% advance is required to initiate any custom development project.</li>
                            <li><strong>Delivery Timeline:</strong> We aim for a 2–3 day delivery window for standard automation units, subject to technical complexity.</li>
                            <li><strong>Demo & Approval:</strong> A live demo will be provided for your review. Final payment is required before full system access is granted.</li>
                            <li><strong>Customization:</strong> Any feature requests outside the initial scope will be billed as a separate expansion package.</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-slate-800" />

                {/* Refund Policy */}
                <section id="refund" className="space-y-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Refund Policy</h1>
                    <div className="space-y-6 leading-relaxed">
                        <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl">
                            <ul className="space-y-4 font-medium text-slate-200">
                                <li className="flex gap-3">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>Advance payments are refundable <strong>within 3 days only</strong> if no development work has been started.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>Once development has begun, advance payments become non-refundable.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>Full refunds are applicable only if we fail to deliver the agreed project within the promised timeline.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>Refund requests must be submitted via email within 3 days of payment.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};
