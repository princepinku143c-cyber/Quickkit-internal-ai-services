import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, ServiceItem, AIQuote, PlanTier } from './types';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { QrCode, MessageCircle } from 'lucide-react';
import { IndustryProvider } from './lib/IndustryContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { IntegrationMarquee } from './components/IntegrationMarquee';
import { GlobalLoader } from './components/GlobalLoader';
import { LeadForm } from './components/LeadForm';
import { SystemWorkflow } from './components/SystemWorkflow';
import { WHATSAPP_DIRECT_URL, WHATSAPP_QR_ASSET, WHATSAPP_USERNAME } from './constants';

const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const WhyQuickKit = lazy(() => import('./components/WhyQuickKit').then(m => ({ default: m.WhyQuickKit })));
const WhoIsItFor = lazy(() => import('./components/WhoIsItFor').then(m => ({ default: m.WhoIsItFor })));
const AIAgents = lazy(() => import('./components/AIAgents').then(m => ({ default: m.AIAgents })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const DemoBooking = lazy(() => import('./components/DemoBooking').then(m => ({ default: m.DemoBooking })));
const BusinessImpact = lazy(() => import('./components/BusinessImpact').then(m => ({ default: m.BusinessImpact })));
const ROICalculator = lazy(() => import('./components/ROICalculator').then(m => ({ default: m.ROICalculator })));
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const ClientPortal = lazy(() => import('./components/ClientPortal').then(m => ({ default: m.ClientPortal })));
const AdminPortal = lazy(() => import('./components/AdminPortal').then(m => ({ default: m.AdminPortal })));
const LegalPages = lazy(() => import('./components/legal/LegalPages').then(m => ({ default: m.LegalPages })));
const PainSection = lazy(() => import('./components/PainSection').then(m => ({ default: m.PainSection })));
const SocialProofBar = lazy(() => import('./components/SocialProofBar').then(m => ({ default: m.SocialProofBar })));
const SmartBot = lazy(() => import('./components/SmartBot').then(m => ({ default: m.SmartBot })));
const Blog = lazy(() => import('./components/seo/Blog').then(m => ({ default: m.Blog })));
const SEOAudit = lazy(() => import('./components/seo/SEOAudit').then(m => ({ default: m.SEOAudit })));
const PublicNichePage = lazy(() => import('./components/PublicNichePage').then(m => ({ default: m.PublicNichePage })));
const RealEstateCapabilityMatrix = lazy(() => import('./components/RealEstateCapabilityMatrix').then(m => ({ default: m.RealEstateCapabilityMatrix })));
const RealEstateAIQuestions = lazy(() => import('./components/RealEstateAIQuestions').then(m => ({ default: m.RealEstateAIQuestions })));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  state = { hasError: false, error: null as any };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('GLOBAL ERROR:', error, info); }
  render() {
    if (this.state.hasError) return <div style={{color:'white',padding:20,backgroundColor:'#030712',height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><h2 style={{color:'#ef4444'}}>⚠️ App Crashed</h2><pre style={{backgroundColor:'#0f172a',padding:'1rem',borderRadius:'0.5rem',color:'#fca5a5'}}>{String(this.state.error)}</pre><button onClick={() => window.location.reload()} style={{marginTop:'1rem',padding:'0.5rem 1rem',backgroundColor:'#3b82f6',color:'white',borderRadius:'0.25rem',border:'none'}}>Reload</button></div>;
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [lang] = useState<Language>('en');
  const [architectPrompt, setArchitectPrompt] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceItem | null>(null);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [cachedRoadmap, setCachedRoadmap] = useState<{data:any,history:any[]} | null>(null);
  const [resumeArchitect, setResumeArchitect] = useState<{prompt?:string,item?:ServiceItem} | null>(null);
  const [sessionRef, setSessionRef] = useState<string>('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormNotes, setLeadFormNotes] = useState('');
  const [leadPlan, setLeadPlan] = useState<PlanTier>(PlanTier.STARTER);
  const [currentAIQuote, setCurrentAIQuote] = useState<AIQuote | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const metaListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let unSubMeta: any = null;
    let unsubscribe: any = () => {};
    const safetyTimer = setTimeout(() => { if (authLoading) { console.warn('Auth initialization timed out. Proceeding...'); setAuthLoading(false); } }, 5000);
    if (isFirebaseConfigured && auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          clearTimeout(safetyTimer);
          if (firebaseUser) {
            const userRef = doc(db as any, 'users', firebaseUser.uid);
            try { const snap = await getDoc(userRef); const data = snap.data(); if (!snap.exists() || !data || data.credits === undefined || data.credits <= 0) await setDoc(userRef, {uid:firebaseUser.uid,email:firebaseUser.email,displayName:firebaseUser.displayName || 'Operator',credits:500,plan:'free',role:data?.role || 'client',createdAt:data?.createdAt || new Date().toISOString()}, {merge:true}); } catch (e) { console.error('Failed to check/update user credits:', e); }
            unSubMeta = onSnapshot(userRef, async (snap) => { const data = snap.data(); try { localStorage.setItem('token', await firebaseUser.getIdToken()); } catch (e) {} setUser({uid:firebaseUser.uid,email:firebaseUser.email || '',displayName:firebaseUser.displayName || data?.displayName || 'User',role:data?.role || 'client',credits:data?.credits ?? 0,monthlyLimit:data?.monthlyLimit ?? 1000,tier:data?.tier ?? 'STARTER',industryType:data?.industryType || '',workspaceName:data?.workspaceName || '',operatorName:data?.operatorName || '',contactEmail:data?.contactEmail || '',crmInitialized:data?.crmInitialized || false,customFormSchema:data?.customFormSchema || []}); setIsAuthenticated(true); setAuthLoading(false); }, () => { setUser({uid:firebaseUser.uid,email:firebaseUser.email || '',displayName:'User',role:'client',credits:0,monthlyLimit:1000,tier:'FREE'}); setIsAuthenticated(true); setAuthLoading(false); });
            metaListenerRef.current = unSubMeta;
          } else { localStorage.removeItem('token'); if (unSubMeta) unSubMeta(); setUser(null); setIsAuthenticated(false); setAuthLoading(false); }
        });
      } catch (e) { console.error('Auth Listener Error:', e); setAuthLoading(false); }
    } else { setAuthLoading(false); clearTimeout(safetyTimer); }
    return () => { unsubscribe(); if (unSubMeta) unSubMeta(); clearTimeout(safetyTimer); };
  }, []);

  const handleLaunchArchitect = (prompt:string,isWidget=false) => { setIsWidgetMode(isWidget); if(prompt!==architectPrompt){setCachedRoadmap(null);setSessionRef(generateSessionId());} setArchitectPrompt(prompt); };
  const handleCatalogSelect = (item:ServiceItem) => { setIsWidgetMode(false);setCachedRoadmap(null);setSessionRef(generateSessionId());setSelectedCatalogItem(item); };
  const handleFinalBook = (quote:AIQuote,history:any[]) => { setResumeArchitect({prompt:architectPrompt || undefined,item:selectedCatalogItem || undefined});setArchitectPrompt(null);setSelectedCatalogItem(null);setCurrentAIQuote(quote);const historyText=history.map(h=>`${h.role==='user'?'CLIENT':'ARCHITECT'}: ${h.parts?.[0]?.text || '[Image]'} \n`).join('\n');setLeadFormNotes(`--- REF: ${sessionRef} ---\n\n--- ARCHITECT LOG ---\n${historyText}`);setLeadPlan(PlanTier.BUSINESS);setShowLeadForm(true); };
  const handleOpenLeadForm = (plan: PlanTier = leadPlan, notes = leadFormNotes) => { setLeadPlan(plan); setLeadFormNotes(notes); setShowLeadForm(true); };
  const handleCloseLeadForm = () => { setShowLeadForm(false); setCurrentAIQuote(undefined); setLeadFormNotes(''); };
  const handleLogout = async () => { try { if(metaListenerRef.current){metaListenerRef.current();metaListenerRef.current=null;} setIsAuthenticated(false);setUser(null);localStorage.removeItem('token');await signOut(auth as any); } catch(e){console.error('Logout error:',e);setIsAuthenticated(false);setUser(null);} };

  const renderLandingView = () => <div className="bg-[#030712] min-h-screen font-sans text-slate-100 selection:bg-blue-500/30">
    <Helmet>
      <title>Raja AI Systems | 5-Agent Autonomous AI Workforce | India</title>
      <meta name="description" content="Raja AI Systems builds and manages a five-member autonomous AI workforce for high-ticket real estate and healthcare: WhatsApp speed-to-lead, prospecting, no-show protection, dormant-lead revival and reputation workflows."/>
      <meta name="keywords" content="real estate AI workforce India, managed AI agents real estate, property lead qualification AI, WhatsApp AI for real estate, AI calling for real estate, site visit automation, real estate CRM automation, builder AI automation, broker AI automation, AI workforce for real estate, managed AI agents real estate"/>
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
      <link rel="canonical" href="https://quickkitai.com"/>
    </Helmet>

    <Navbar onContact={()=>handleOpenLeadForm()} isAuthenticated={isAuthenticated}/>
    <Hero lang={lang} onLaunchArchitect={handleLaunchArchitect}/>
    <IntegrationMarquee/>

    <Suspense fallback={<div className="h-40 flex items-center justify-center"><GlobalLoader message="Loading System..."/></div>}>
      <PainSection/>
      <SocialProofBar/>
      <SystemWorkflow/>
      <Pricing lang={lang} onSelectPlan={plan=>handleOpenLeadForm(PlanTier.BUSINESS, `I am interested in the ${plan} Raja AI Systems pilot.`)}/>
      <WhyQuickKit/>
      <WhoIsItFor onBookDemo={()=>handleOpenLeadForm()}/>
      <AIAgents onSelectAgent={handleCatalogSelect}/>
      <Testimonials/>
      <DemoBooking onBookDemo={()=>handleOpenLeadForm()}/>
      <BusinessImpact/>
      <ROICalculator lang={lang}/>
      <RealEstateCapabilityMatrix/>
      <SmartBot onOpenArchitect={()=>handleLaunchArchitect('Hi! I want to explore automation.',true)}/>
    </Suspense>

    {showLeadForm && <LeadForm lang={lang} close={handleCloseLeadForm} initialData={{bizType:'Real Estate',plan:leadPlan}} prefilledNotes={leadFormNotes} aiFinancials={currentAIQuote} onVerified={handleCloseLeadForm}/>} 

    <footer className="bg-slate-950 border-t border-white/6 py-14">
      <div className="container mx-auto px-5 md:px-8 text-center">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-blue-500/15 bg-gradient-to-r from-blue-500/5 via-slate-900/70 to-emerald-500/5 p-7 md:p-9 mb-10">
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {['Built around your workflow','5 core AI teammates','Managed infrastructure','Verification before live'].map(x=><span key={x} className="rounded-full border border-white/8 bg-black/15 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">{x}</span>)}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Ready to map your AI workforce?</h2>
          <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">Tell us the repetitive work, the systems you use and the outcome you want. We will scope the workflow before treating it as production-ready.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`${WHATSAPP_DIRECT_URL}?text=Hi%2C%20I%20want%20to%20discuss%20a%20managed%20AI%20workforce.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
            <a href={WHATSAPP_QR_ASSET} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"><QrCode className="w-4 h-4" /> Open QR</a>
          </div>
        </div>

        <p className="text-[10px] font-mono tracking-[.25em] uppercase mb-4 text-slate-700 font-black">Built · Deployed · Verified · Managed</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-7 text-[11px] font-black uppercase tracking-[.18em] text-slate-500">
          <a href="mailto:admin@quickkitai.com" className="hover:text-blue-300 transition-colors">admin@quickkitai.com</a>
          <a href="#workflow" className="hover:text-blue-300 transition-colors">How It Works</a>
          <a href="#ai-agents" className="hover:text-blue-300 transition-colors">AI Team</a>
          <a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a>
          <Link to="/blog" className="hover:text-blue-300 transition-colors">Blog</Link>
          <Link to="/seo-audit" className="hover:text-blue-300 transition-colors">SEO Audit</Link>
          <Link to="/about" className="hover:text-blue-300 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-300 transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-blue-300 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-blue-300 transition-colors">Terms</Link>
        </div>
        <p className="text-xs text-slate-700">Dussehra pilot: ₹35,000 setup + ₹1,20,000/month management; regular anchor ₹70,000 setup + ₹2,40,000/month. Up to 3 pilot clients; signed SLA conditions apply.</p>
        <p className="mt-4 text-xs text-slate-700">&copy; {new Date().getFullYear()} Raja AI Systems. All rights reserved.</p>
      </div>
    </footer>
  </div>;

  return <ErrorBoundary><IndustryProvider><Routes><Route path="/" element={renderLandingView()}/><Route path="/real-estate-ai-questions" element={<RealEstateAIQuestions/>}/><Route path="/about" element={<LegalPages/>}/><Route path="/contact" element={<LegalPages/>}/><Route path="/privacy" element={<LegalPages/>}/><Route path="/terms" element={<LegalPages/>}/><Route path="/login" element={<Login/>}/><Route path="/client" element={isAuthenticated?<ClientPortal user={user} onLogout={handleLogout}/>:<Navigate to="/login" replace/>}/><Route path="/admin" element={isAuthenticated&&user?.role==='admin'?<AdminPortal user={user} onLogout={handleLogout}/>:<Navigate to="/login" replace/>}/><Route path="/blog" element={<Blog/>}/><Route path="/services/:niche" element={<PublicNichePage/>}/><Route path="/seo-audit" element={<SEOAudit/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></IndustryProvider></ErrorBoundary>;
};

export default App;