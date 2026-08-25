import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Scale, ArrowLeft } from 'lucide-react';

export const LegalPages = () => {
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.pathname.split('/').pop();
    if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, [location]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-32 px-6 space-y-32">
        <section id="about" className="space-y-8">
          <div className="flex items-center gap-4 text-emerald-500"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Company</span></div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">About Us</h1>
          <div className="space-y-6 leading-relaxed text-lg pt-8">
            <p>QuickKit AI builds, deploys, operates and maintains managed AI agent systems for businesses. We focus on practical automation across sales, support, CRM, messaging, voice and internal workflows.</p>
            <p>Our systems are configured around each customer's approved business processes, connected tools and operational requirements.</p>
          </div>
        </section>

        <section id="contact" className="space-y-8">
          <div className="flex items-center gap-4 text-purple-500 mb-2"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Get In Touch</span></div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Contact Us</h1>
          <div className="space-y-4 leading-relaxed text-lg pt-8">
            <p>Have a question or need support? Our team is ready to assist you.</p>
            <p className="text-slate-400"><strong className="text-white">General:</strong> admin@quickkitai.com</p>
            <p className="text-slate-400"><strong className="text-white">Sales:</strong> sales@quickkitai.com</p>
            <p className="text-slate-400"><strong className="text-white">Support:</strong> support@quickkitai.com</p>
          </div>
        </section>

        <section id="privacy" className="space-y-8">
          <div className="flex items-center gap-4 text-blue-500 mb-2"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Privacy</span></div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Privacy Policy</h1>
          <div className="space-y-6 leading-relaxed text-lg">
            <p>QuickKit AI collects only information reasonably required to provide, configure and support its services, such as contact details, business requirements and information explicitly supplied for connected workflows.</p>
            <p>We use appropriate technical and organizational safeguards to protect customer information. We do not sell customer data.</p>
            <p>When customers connect third-party services, data may also be processed under those providers' own terms and privacy policies. Customers remain responsible for granting only the permissions required for their configured workflows.</p>
            <p>AI model and third-party API providers may process data required to perform an enabled workflow. Customers should avoid sending sensitive information unless the relevant provider and configuration have been approved for that use.</p>
            <p>For privacy or data-removal requests, contact <span className="text-blue-400">admin@quickkitai.com</span>.</p>
          </div>
        </section>

        <section id="terms" className="space-y-8">
          <div className="flex items-center gap-4 text-indigo-500 mb-2"><Scale className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Service Terms</span></div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Terms of Service</h1>
          <div className="space-y-8 leading-relaxed text-lg pt-8">
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-7">
              <div><h4 className="text-white font-bold uppercase mb-2">01. Setup & Scope</h4><p className="text-sm text-slate-400">KVM 4 setup is ₹19,999 and KVM 8 setup is ₹39,999. The selected setup covers the agreed managed AI system configuration and initial deployment scope. Custom work outside the agreed scope may be quoted separately.</p></div>
              <div><h4 className="text-white font-bold uppercase mb-2">02. Managed Operation</h4><p className="text-sm text-slate-400">The first month of managed operation is included with the setup. From month 2, maintenance is ₹15,000/month for KVM 4 or ₹30,000/month for KVM 8 unless a different written plan is agreed.</p></div>
              <div><h4 className="text-white font-bold uppercase mb-2">03. AI & API Usage</h4><p className="text-sm text-slate-400">AI model usage and third-party API charges are separate from setup and maintenance and depend on actual usage and connected providers.</p></div>
              <div><h4 className="text-white font-bold uppercase mb-2">04. Third-Party Services</h4><p className="text-sm text-slate-400">Availability and pricing of external services, models, WhatsApp providers, voice providers, CRMs and APIs are controlled by their respective providers and are outside QuickKit AI's direct control.</p></div>
              <div><h4 className="text-white font-bold uppercase mb-2">05. Customer Responsibility</h4><p className="text-sm text-slate-400">Customers are responsible for providing accurate business requirements, approving automated actions, maintaining authorized accounts and ensuring their workflows comply with applicable laws and third-party platform rules.</p></div>
              <div><h4 className="text-white font-bold uppercase mb-2">06. Intellectual Property</h4><p className="text-sm text-slate-400">QuickKit AI retains rights to its reusable platform, architecture and underlying automation components. Customers retain ownership of their supplied business data and customer-specific content, subject to third-party rights.</p></div>
            </div>
          </div>
        </section>
      </div>

      <footer className="py-20 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QuickKit AI</p>
      </footer>
    </div>
  );
};
