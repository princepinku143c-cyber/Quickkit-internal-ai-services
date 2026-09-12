import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SeoMeta } from './SeoMeta';
import { Zap, Sparkles, CheckCircle2, MapPin, Clock, ArrowRight, Bot, MessageCircle, PhoneCall, CalendarCheck, Database, UserCheck } from 'lucide-react';

interface NicheDetails {
  title: string;
  sub: string;
  description: string;
  keywords: string;
  features: string[];
}

const NICHE_DATA: Record<string, NicheDetails> = {
  'real-estate': {
    title: 'Real Estate AI Automation Agency in India',
    sub: 'Turn property enquiries into qualified conversations, follow-ups and site visits with managed AI agents built for builders, developers and brokerages.',
    description: 'QuickKit AI is a real estate AI automation agency in India. We build and manage AI agents for property lead generation, lead qualification, WhatsApp follow-ups, AI calling, site-visit booking and real estate CRM automation.',
    keywords: 'real estate AI automation agency India, real estate AI agents India, AI for real estate India, property lead generation AI, real estate lead qualification AI, WhatsApp AI for real estate, real estate WhatsApp automation, AI calling for real estate, real estate CRM automation, property enquiry automation, site visit booking automation, builder AI automation, broker AI automation, real estate sales automation India, AI workforce for real estate, managed AI agents real estate',
    features: ['Capture property enquiries from website, ads and WhatsApp', 'Qualify budget, location, property type, timeline and buying intent', 'Automate WhatsApp replies, reminders and long-tail follow-ups', 'AI voice calling for lead qualification and callback workflows', 'Book site visits and sales appointments automatically', 'Push qualified leads and activity into your CRM pipeline']
  },
  'e-commerce': {
    title: 'AI Agents for E-Commerce in India',
    sub: 'Automate customer support, order questions, product discovery and repetitive commerce workflows.',
    description: 'Managed AI agents for Indian e-commerce businesses covering customer support, product questions, order workflows and business automation.',
    keywords: 'ecommerce AI agents India, ecommerce AI automation India, AI customer support ecommerce, ecommerce workflow automation',
    features: ['Product and order question handling', 'Customer support automation', 'Lead and customer follow-up workflows', 'CRM and business system integrations']
  },
  'healthcare': {
    title: 'AI Agents for Healthcare Clinics in India',
    sub: 'Automate approved administrative workflows such as enquiries, intake and appointment coordination.',
    description: 'Managed AI automation for Indian healthcare businesses focused on approved administrative workflows, patient enquiries, intake and appointment coordination.',
    keywords: 'healthcare AI agents India, clinic AI automation India, appointment automation India, healthcare workflow automation',
    features: ['Administrative enquiry handling', 'Structured intake workflows', 'Appointment coordination', 'CRM and approved system integrations']
  },
  'agency': {
    title: 'AI Agents for Digital Agencies in India',
    sub: 'Automate lead intake, client onboarding, proposals and repetitive agency operations.',
    description: 'Managed AI agents for Indian digital and creative agencies covering lead qualification, onboarding, proposals, client communication and workflow automation.',
    keywords: 'agency AI agents India, digital agency AI automation, client onboarding AI, agency workflow automation India',
    features: ['Lead qualification and intake', 'Client onboarding automation', 'Proposal and follow-up workflows', 'CRM and project workflow automation']
  },
  'travel': {
    title: 'AI Agents for Travel Agencies in India',
    sub: 'Capture travel requirements, answer routine enquiries and automate approved follow-up workflows.',
    description: 'Managed AI automation for Indian travel businesses covering enquiry intake, itinerary workflows, customer support and follow-up automation.',
    keywords: 'travel AI agents India, travel agency AI automation, itinerary AI India, travel CRM automation',
    features: ['Destination and budget requirement capture', 'Travel enquiry automation', 'Itinerary workflow assistance', 'CRM and follow-up automation']
  }
};

const REAL_ESTATE_WORKFLOWS = [
  { icon: Bot, title: 'Property Lead Agent', text: 'Captures and responds to enquiries from ads, landing pages, websites and WhatsApp.' },
  { icon: UserCheck, title: 'Lead Qualification Agent', text: 'Collects budget, location, property preference, timeline and intent before routing the lead.' },
  { icon: MessageCircle, title: 'WhatsApp Follow-up Agent', text: 'Runs personalized follow-ups so interested buyers do not disappear after the first enquiry.' },
  { icon: PhoneCall, title: 'AI Calling Agent', text: 'Handles approved qualification and callback workflows and passes qualified conversations to sales.' },
  { icon: CalendarCheck, title: 'Site Visit Agent', text: 'Coordinates appointment requests, reminders and handoff to the sales team.' },
  { icon: Database, title: 'CRM Automation Agent', text: 'Keeps lead stages, notes, tasks and follow-up workflows synchronized.' }
];

export const PublicNichePage: React.FC = () => {
  const { niche } = useParams<{ niche: string }>();
  const data = NICHE_DATA[niche || ''] || NICHE_DATA['real-estate'];
  const isRealEstate = niche === 'real-estate' || !niche;

  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.title,
    description: data.description,
    provider: { '@type': 'Organization', name: 'QuickKit AI', url: 'https://quickkitai.com' },
    areaServed: { '@type': 'Country', name: 'India' },
    serviceType: isRealEstate ? 'Real estate AI automation and managed AI agents' : 'AI automation and managed AI agent deployment'
  };

  return (
    <div className="bg-[#030712] min-h-screen text-slate-300 font-sans flex flex-col">
      <SeoMeta title={`${data.title} | QuickKit AI`} description={data.description} keywords={data.keywords} schemaObj={schemaObj} />
      <header className="border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Zap className="text-white w-5 h-5" /></div><span className="font-bold text-white text-lg">QuickKit AI</span></Link>
          <Link to="/contact" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">Get a Real Estate AI Demo</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex-1">
        <div className="text-center">
          <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest inline-flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> {isRealEstate ? 'Real Estate AI Automation · India' : 'India Business AI'}</span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-5xl mx-auto leading-tight mt-8">{data.title}</h1>
          <p className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mt-7">{data.sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-9">
            <Link to="/" className="py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">Get Qualified Leads <ArrowRight className="w-4 h-4" /></Link>
            <a href="https://wa.me/918260485230?text=Hi%2C%20I%20want%20to%20automate%20my%20real%20estate%20sales%20process%20with%20AI." target="_blank" rel="noopener noreferrer" className="py-4 px-8 border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Automate WhatsApp Follow-ups</a>
          </div>
        </div>

        {isRealEstate && <>
          <section className="mt-16 grid md:grid-cols-3 gap-5">
            {REAL_ESTATE_WORKFLOWS.map(({ icon: Icon, title, text }) => <article key={title} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"><Icon className="w-6 h-6 text-blue-400 mb-4" /><h2 className="text-lg font-black text-white mb-2">{title}</h2><p className="text-sm text-slate-400 leading-relaxed">{text}</p></article>)}
          </section>
          <section className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white text-center">What your real estate AI workforce can handle</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">{data.features.map((feature) => <div key={feature} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /><span className="text-sm text-slate-300 font-semibold">{feature}</span></div>)}</div>
          </section>
          <section className="mt-16 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 md:p-12 text-center">
            <h2 className="text-3xl font-black text-white">Stop losing property leads after the first enquiry.</h2>
            <p className="max-w-2xl mx-auto mt-4 text-slate-400">QuickKit AI can design a managed workflow around your existing lead sources, WhatsApp, sales process and CRM — without forcing your team to rebuild everything.</p>
            <Link to="/" className="inline-flex mt-7 py-4 px-8 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest">Book Your Real Estate AI Demo</Link>
          </section>
        </>}

        {!isRealEstate && <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mt-14 text-left">{data.features.map((feature) => <div key={feature} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-slate-300 font-semibold">{feature}</span></div>)}</div>}
      </main>
      <footer className="border-t border-slate-800/60 py-8"><div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> India</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Managed AI operations</span><span>© {new Date().getFullYear()} QuickKit AI. All rights reserved.</span></div></footer>
    </div>
  );
};
