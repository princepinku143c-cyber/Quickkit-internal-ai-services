import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Scale, ArrowLeft } from 'lucide-react';
import { EditorialMetaBar, PublicRouteFooter, SeoMeta } from '../SeoMeta';

type LegalRouteKey = 'about' | 'contact' | 'privacy' | 'terms';

const LEGAL_META: Record<LegalRouteKey, { title: string; description: string; keywords: string; canonical: string; label: string }> = {
  about: {
    title: 'About Raja AI Systems | Managed AI India',
    description: 'About Raja AI Systems (QuickKitAI), led by Prince (Raja), building managed AI automation and AEO/GEO systems for Indian real estate teams.',
    keywords: 'Raja AI Systems, Prince Raja, QuickKitAI founder, managed AI agency India, real estate AI workforce',
    canonical: 'https://quickkitai.com/about',
    label: 'About Us',
  },
  contact: {
    title: 'Contact Raja AI Systems | Start an AI Pilot',
    description: 'Contact Raja AI Systems at admin@quickkitai.com to schedule an AEO visibility audit or discuss a managed AI workflow pilot in India.',
    keywords: 'contact Raja AI Systems, QuickKitAI contact, admin@quickkitai.com, AEO audit India, AI pilot enquiry',
    canonical: 'https://quickkitai.com/contact',
    label: 'Contact Us',
  },
  privacy: {
    title: 'Privacy Policy | Raja AI Systems QuickKitAI',
    description: 'Privacy Policy for Raja AI Systems and QuickKitAI detailing data collection, safeguards, third-party API handling, and removal requests.',
    keywords: 'Raja AI Systems privacy policy, QuickKitAI privacy, AI workflow data protection India',
    canonical: 'https://quickkitai.com/privacy',
    label: 'Privacy Policy',
  },
  terms: {
    title: 'Terms of Service | Raja AI Systems India',
    description: 'Terms of Service for Raja AI Systems covering setup scope, managed retainer terms, third-party API usage, customer duties, and IP ownership.',
    keywords: 'Raja AI Systems terms of service, QuickKitAI terms, AI automation SLA India',
    canonical: 'https://quickkitai.com/terms',
    label: 'Terms of Service',
  },
};

export const LegalPages = () => {
  const location = useLocation();
  const slug = location.pathname.split('/').filter(Boolean).pop() || 'about';
  const activeKey: LegalRouteKey =
    slug === 'contact' || slug === 'privacy' || slug === 'terms' ? slug : 'about';
  const meta = LEGAL_META[activeKey];

  useEffect(() => {
    document.getElementById(activeKey)?.scrollIntoView({ behavior: 'smooth' });
  }, [activeKey]);

  const headingClass = 'text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans">
      <SeoMeta
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        canonical={meta.canonical}
        ogType="article"
        breadcrumbs={[
          { name: 'Home', url: 'https://quickkitai.com/' },
          { name: meta.label, url: meta.canonical },
        ]}
      />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black uppercase tracking-tighter hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </Link>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/about" className={activeKey === 'about' ? 'text-white' : 'hover:text-white transition-colors'}>About</Link>
            <Link to="/contact" className={activeKey === 'contact' ? 'text-white' : 'hover:text-white transition-colors'}>Contact</Link>
            <Link to="/privacy" className={activeKey === 'privacy' ? 'text-white' : 'hover:text-white transition-colors'}>Privacy</Link>
            <Link to="/terms" className={activeKey === 'terms' ? 'text-white' : 'hover:text-white transition-colors'}>Terms</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-32 px-6 space-y-24">
        <EditorialMetaBar />

        <section id="about" className="space-y-8">
          <div className="flex items-center gap-4 text-emerald-500"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Company</span></div>
          {activeKey === 'about' ? <h1 className={headingClass}>About Us</h1> : <h2 className={headingClass}>About Us</h2>}
          <div className="space-y-6 leading-relaxed text-lg pt-4">
            <p>Raja AI Systems (QuickKitAI), founded and led by Prince (Raja), builds, deploys, operates and maintains managed AI workforce systems and AEO/GEO visibility infrastructure for Indian real estate and healthcare workflows.</p>
            <p>The five-member workforce is configured around the customer's approved workflow, business rules and connected systems. AEO Tier 01 foundation implementations are structured at ₹15,000 one-time pay after live verified result (₹0 advance), and commercial/SLA terms are governed by the signed agreement.</p>
          </div>
        </section>

        <section id="contact" className="space-y-8">
          <div className="flex items-center gap-4 text-purple-500 mb-2"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Get In Touch</span></div>
          {activeKey === 'contact' ? <h1 className={headingClass}>Contact Us</h1> : <h2 className={headingClass}>Contact Us</h2>}
          <div className="space-y-4 leading-relaxed text-lg pt-4">
            <p>Have a question, sales enquiry, AEO audit request, or support request? Contact our team directly:</p>
            <p className="text-slate-400"><strong className="text-white">Email:</strong> admin@quickkitai.com</p>
            <p className="text-slate-400"><strong className="text-white">Explore AEO Plans:</strong> <Link to="/ai-visibility" className="text-amber-300 underline">View Tier 01 &amp; Tier 02 pricing</Link></p>
          </div>
        </section>

        <section id="privacy" className="space-y-8">
          <div className="flex items-center gap-4 text-blue-500 mb-2"><Shield className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Privacy</span></div>
          {activeKey === 'privacy' ? <h1 className={headingClass}>Privacy Policy</h1> : <h2 className={headingClass}>Privacy Policy</h2>}
          <div className="space-y-6 leading-relaxed text-lg">
            <p>Raja AI Systems collects only information reasonably required to provide, configure and support its services, such as contact details, business requirements and information explicitly supplied for connected workflows.</p>
            <p>We use appropriate technical and organizational safeguards to protect customer information. We do not sell customer data.</p>
            <p>When customers connect third-party services, data may also be processed under those providers' own terms and privacy policies. Customers remain responsible for granting only the permissions required for their configured workflows.</p>
            <p>AI model and third-party API providers may process data required to perform an enabled workflow. Customers should avoid sending sensitive information unless the relevant provider and configuration have been approved for that use.</p>
            <p>For privacy or data-removal requests, contact <span className="text-blue-400">admin@quickkitai.com</span>.</p>
          </div>
        </section>

        <section id="terms" className="space-y-8">
          <div className="flex items-center gap-4 text-indigo-500 mb-2"><Scale className="w-8 h-8" /><span className="text-xs font-black uppercase tracking-[0.3em]">Service Terms</span></div>
          {activeKey === 'terms' ? <h1 className={headingClass}>Terms of Service</h1> : <h2 className={headingClass}>Terms of Service</h2>}
          <div className="space-y-8 leading-relaxed text-lg pt-4">
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-7">
              <div><h3 className="text-white font-bold uppercase mb-2">01. Setup &amp; Scope</h3><p className="text-sm text-slate-400">Workforce pilot offer is ₹35,000 implementation setup (regular anchor ₹70,000) for up to 3 pilot clients, subject to availability and the signed agreement. AEO Tier 01 is ₹15,000 one-time, pay after live verified result (₹0 advance); Tier 02 is ₹25,000/month + ₹20,000 setup.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">02. Managed Operation</h3><p className="text-sm text-slate-400">The pilot monthly workforce management retainer is ₹1,20,000/month. Any billing start date, pilot target, or activation term applies only as expressly stated in the signed agreement.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">03. AI &amp; API Usage</h3><p className="text-sm text-slate-400">AI model usage and third-party API charges are separate from setup and maintenance and depend on actual usage and connected providers.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">04. Payments</h3><p className="text-sm text-slate-400">Payment method and activation are controlled by the commercial agreement and the confirmed payment process used for the pilot.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">05. Third-Party Services</h3><p className="text-sm text-slate-400">Availability and pricing of external services, models, WhatsApp providers, voice providers, CRMs and APIs are controlled by their respective providers and are outside Raja AI Systems's direct control.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">06. Customer Responsibility</h3><p className="text-sm text-slate-400">Customers are responsible for providing accurate business requirements, approving automated actions, maintaining authorized accounts and ensuring their workflows comply with applicable laws and third-party platform rules.</p></div>
              <div><h3 className="text-white font-bold uppercase mb-2">07. Intellectual Property</h3><p className="text-sm text-slate-400">Client lead and customer data belongs to the client, while Raja AI Systems retains proprietary rights to reusable AI workflows, prompt architecture, backend server configuration and underlying templates. Exact rights are governed by the signed agreement.</p></div>
            </div>
          </div>
        </section>
      </main>

      <PublicRouteFooter />
    </div>
  );
};
