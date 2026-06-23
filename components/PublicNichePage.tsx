import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SeoMeta } from './SeoMeta';
import { 
  Zap, Sparkles, Shield, ArrowRight, CheckCircle2, 
  MapPin, Clock, MessageSquare, DollarSign, Bot 
} from 'lucide-react';

interface NicheDetails {
  title: string;
  sub: string;
  description: string;
  keywords: string;
  features: string[];
  metricLabel: string;
  metricValue: string;
  useCase: string;
}

const NICHE_DATA: Record<string, NicheDetails> = {
  'real-estate': {
    title: 'AI Agents for Real Estate in USA & India',
    sub: 'Auto-qualify property buyers, scope client requirements, and sync leads to your Odoo CRM 24/7.',
    description: 'Transform property sales with autonomous Real Estate AI Agents. Mapped custom property sizes, pricing, and geo-targeted alerts. Designed for brokerage teams in USA, India, and globally.',
    keywords: 'Real estate AI agent, autonomous property leads, real estate automation USA, property CRM India, Odoo real estate integration',
    features: [
      'Interactive Property Intake Scoping',
      'Dynamic Budget & Niche Terminology Customization',
      'Automated SMS & WhatsApp Buyer Reminders',
      'Fault-Tolerant CRM & Odoo Integration Pipeline'
    ],
    metricLabel: 'Lead Conversion Boost',
    metricValue: '+42%',
    useCase: 'Auto-responder drafts a welcome scoping proposal within 2 minutes of webhook lead capture.'
  },
  'e-commerce': {
    title: 'AI Agents for E-Commerce in USA & India',
    sub: 'Recover abandoned carts, automate customer checkout workflows, and sync order history in real-time.',
    description: 'Maximize online retail conversions with autonomous E-Commerce AI Agents. Automated support assistant handles product scoping, discount code delivery, and inventory synchronization.',
    keywords: 'E-commerce AI chatbot, cart recovery automation, Shopify AI agent USA, online store CRM India, e-commerce auto-responder',
    features: [
      'Interactive Cart Abandonment Recovery',
      'Live Order History & Tracking Sync',
      'Intelligent Product Recommendation Agents',
      'Global Multi-Currency Payment Integrations'
    ],
    metricLabel: 'Cart Recovery Increase',
    metricValue: '+31%',
    useCase: 'AI auto-drafts targeted checkout reminders when webhook notifies cart abandonment.'
  },
  'healthcare': {
    title: 'AI Agents for Healthcare Clinics',
    sub: 'Secure patient intake, auto-qualify treatment requirements, and automate appointment bookings.',
    description: 'Optimize medical workflow velocity with compliant Healthcare AI Agents. Scope patient requirements securely and automate calendar bookings across USA and India clinics.',
    keywords: 'Healthcare AI scheduling, medical intake automation, patient support chatbot, HIPAA compliant CRM, clinic automation India',
    features: [
      'Autonomous Appointment Slot Scheduling',
      'Secure Symptom Scoping intake forms',
      'Dynamic Patient Terminology adaptation',
      'Seamless Calendar & EHR Syncing'
    ],
    metricLabel: 'Admin Burden Reduction',
    metricValue: '-58%',
    useCase: 'Intake bot pre-scopres consultation notes before the first visit is scheduled.'
  },
  'agency': {
    title: 'AI Agents for Digital & Creative Agencies',
    sub: 'Scale client onboarding, deliver instant payment proposals, and automate project status updates.',
    description: 'Scale agency operations using custom AI Agents. Automate scoping questionnaires, project invoices, and client status synchronization across global delivery nodes.',
    keywords: 'Agency AI assistant, automated client onboarding, invoice proposal triggers, digital agency automation, agency CRM',
    features: [
      'Automated Scoping Proposal Generator',
      'Drag-and-Drop Invoicing Trigger system',
      'Client White-Label Portal Isolation',
      'Secure Client Key & Integrations Vault'
    ],
    metricLabel: 'Proposal Acceptance Velocity',
    metricValue: '2.4x',
    useCase: 'Payment proposal is generated and emailed immediately as lead hits Negotiation stage.'
  },
  'travel': {
    title: 'AI Agents for Travel & Tourism Agencies',
    sub: 'Scope tour requirements, generate dynamic itineraries, and resolve client bookings 24/7.',
    description: 'Bespoke Travel AI Automation. Scope budgets, destination locations, group size, and auto-draft customizable trip proposals dynamically for travel agencies.',
    keywords: 'Travel agency AI chatbot, automated travel booking, itinerary builder AI, travel CRM USA India, tourist auto-responder',
    features: [
      'Destination & Group Size Scoping',
      'Dynamic Itinerary Builder Integrations',
      '24/7 Multilingual Tour Booking Agents',
      'Master CRM Sync for Global Travel Operators'
    ],
    metricLabel: 'Booking Rate Velocity',
    metricValue: '+35%',
    useCase: 'AI Agent designs a 3-sentence welcome trip summary and drafts pricing options instantly.'
  }
};

export const PublicNichePage: React.FC = () => {
  const { niche } = useParams<{ niche: string }>();
  
  // Fallback to general AI Automation details if niche is custom/undefined
  const data = NICHE_DATA[niche || ''] || {
    title: `AI Agents for ${niche ? niche.replace('-', ' ') : 'Enterprise'} Automation`,
    sub: 'Scope complex client workflows, synchronize databases, and automate system follow-ups.',
    description: 'Deploy bespoke QuickKit AI Agents to automate enterprise workflows. High-converting custom pipelines for global markets including the USA, India, and worldwide teams.',
    keywords: 'Custom AI agent, enterprise automation, workflow AI, system integration, database sync',
    features: [
      'Custom Database & API Key Integration Vault',
      'Adaptive Kanban Pipeline terminology',
      'Automatic Welcome Proposals and Proposals drafting',
      'Secure isolated multi-tenant system design'
    ],
    metricLabel: 'Operational Efficiency',
    metricValue: '+60%',
    useCase: 'Dynamic system automatically triggers next-best-action alerts across integrated endpoints.'
  };

  // Structured AEO Schema Markup (JSON-LD)
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.title,
    "description": data.description,
    "provider": {
      "@type": "Organization",
      "name": "QuickKit AI",
      "url": "https://quickkitai.com",
      "sameAs": [
        "https://www.linkedin.com/company/quickkitai"
      ]
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "United States"
      },
      {
        "@type": "Country",
        "name": "India"
      }
    ],
    "serviceType": "AI Automation & AI Agents",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "199.00",
      "description": "Starter AI Assistant setup"
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen text-slate-300 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-purple-500/30">
      <SeoMeta 
        title={`${data.title} | QuickKit AI`} 
        description={data.description} 
        keywords={data.keywords} 
        schemaObj={schemaObj} 
      />

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header/Nav */}
      <header className="border-b border-[#1e293b]/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-white tracking-wide text-lg group-hover:text-blue-400 transition-colors">QuickKit AI</span>
          </Link>

          <Link 
            to="/login" 
            className="px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* Hero / Main Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32 flex-1 flex flex-col items-center text-center relative z-10 space-y-12">
        <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest inline-flex items-center gap-2">
          <Bot className="w-3.5 h-3.5" /> Niche Solutions Node
        </span>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl leading-tight">
          {data.title}
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed font-medium">
          {data.sub}
        </p>

        {/* Feature Grid & Big Metric */}
        <div className="grid md:grid-cols-3 gap-6 w-full pt-10 text-left">
          {/* Features Column */}
          <div className="md:col-span-2 p-8 bg-[#0f172a]/40 border border-[#1e293b]/60 rounded-[2rem] space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sparkles className="w-4 h-4 text-blue-400" /> Platform Integration Features
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.features.map((feat, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 font-bold leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Box */}
          <div className="p-8 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-purple-500/20 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">{data.metricLabel}</p>
              <h2 className="text-5xl font-black text-white tracking-tight">{data.metricValue}</h2>
            </div>
            <div className="pt-6 border-t border-[#1e293b]/40 mt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Deployment Logic:</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{data.useCase}</p>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-10 justify-center w-full max-w-md">
          <Link 
            to="/login"
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 group"
          >
            Deploy AI Agent <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/"
            className="flex-1 py-4 bg-[#0B1120] hover:bg-slate-900 border border-[#1e293b] hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            Explore Platform
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b]/40 py-8 bg-[#030712]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> USA & India Targets</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Instant Delivery</span>
          </div>
          <span>&copy; {new Date().getFullYear()} QuickKit AI Operations. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
