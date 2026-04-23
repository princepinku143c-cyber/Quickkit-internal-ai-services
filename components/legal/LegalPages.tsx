
import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalLayout: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-blue-500/30">
    <div className="max-w-4xl mx-auto px-6 py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-400 transition-colors mb-12">
        <ChevronLeft className="w-4 h-4" /> Back to Nexus
      </Link>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">{title}</h1>
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 md:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400 leading-relaxed font-medium">
          {children}
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
        © 2026 QuickKit AI Global. All rights reserved.
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy">
    <p>Last Updated: April 23, 2026</p>
    <div>
      <h3 className="text-white text-xl font-black uppercase mb-4">Information We Collect</h3>
      <p>We may collect your name, email address, payment details, and project-related information when you use our services.</p>
    </div>
    <div>
      <h3 className="text-white text-xl font-black uppercase mb-4">How We Use Your Information</h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>To provide and deliver our services</li>
        <li>To process payments securely via encrypted channels</li>
        <li>To communicate regarding your specific architectural projects</li>
        <li>To improve our professional AI services</li>
      </ul>
    </div>
    <div>
      <h3 className="text-white text-xl font-black uppercase mb-4">Payment Security</h3>
      <p>All payments are processed securely through trusted payment providers like PayPal. We do not store your credit card details on our local servers.</p>
    </div>
    <div>
      <h3 className="text-white text-xl font-black uppercase mb-4">Data Protection</h3>
      <p>We take appropriate enterprise-grade security measures to protect your data from unauthorized access.</p>
    </div>
    <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Contact</h3>
        <p>Email: sales@quickkitai.com</p>
    </div>
  </LegalLayout>
);

export const TermsAndConditions: React.FC = () => (
    <LegalLayout title="Terms & Conditions">
      <p>Last Updated: April 23, 2026</p>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Services</h3>
        <p>We provide professional digital services focusing on AI Automation, Web Development, and Autonomous System Architectures.</p>
      </div>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Payments</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Full or partial (10%) advance payment is required before initiating development for any project.</li>
          <li>Payments are processed exclusively via secure platforms like PayPal and verified TRC20 wallets.</li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Project Delivery</h3>
        <p>Project timelines (typically 2-3 Days) will be communicated clearly. While we strive for immediate delivery, delays may occur due to technical complexity; we will inform you in advance.</p>
      </div>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Intellectual Property</h3>
        <p>Once full payment is completed, complete ownership of the final deployment and source code will be transferred to the client.</p>
      </div>
      <div>
          <h3 className="text-white text-xl font-black uppercase mb-4">Refund Policy</h3>
          <p>Please refer to our dedicated <Link to="/refund" className="text-blue-400 underline">Refund Policy</Link> for details regarding eligible cancellations.</p>
      </div>
    </LegalLayout>
);

export const RefundPolicy: React.FC = () => (
    <LegalLayout title="Refund Policy">
      <p>Last Updated: April 23, 2026</p>
      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
        <h3 className="text-white text-xl font-black uppercase mb-4">Refund Eligibility</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Clients are eligible for a refund within **3 days** of payment.</li>
          <li>If no development work has been started on the project, a **full refund** will be provided.</li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">Partial Refund</h3>
        <p>If the project has already reached the architecture or development phase, a partial refund may be issued based on the man-hours completed.</p>
      </div>
      <div>
        <h3 className="text-white text-xl font-black uppercase mb-4">No Refund Cases</h3>
        <ul className="list-disc pl-5 space-y-2">
           <li>After 3 days of payment.</li>
           <li>If the project is already completed and delivered.</li>
           <li>If delay is caused by the client (lack of response or missing critical details).</li>
        </ul>
      </div>
      <div>
          <h3 className="text-white text-xl font-black uppercase mb-4">How to Request</h3>
          <p>Contact: sales@quickkitai.com. We process eligible refunds within 5–7 business days.</p>
      </div>
    </LegalLayout>
);
