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
import { AdCampaignSection } from './components/AdCampaignSection';
import { PremiumLanding } from './components/PremiumLanding';
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

  const renderLandingView = () => <div className="min-h-screen bg-[#050608] font-sans text-slate-100 selection:bg-amber-200/20">
    <Helmet>
      <title>Raja AI Systems | 5-Agent Autonomous AI Workforce | India</title>
      <meta name="description" content="Raja AI Systems builds and manages a five-member autonomous AI workforce for high-ticket real estate and healthcare: WhatsApp speed-to-lead, prospecting, no-show protection, dormant-lead revival and reputation workflows."/>
      <meta name="keywords" content="Raja AI Systems, real estate AI workforce India, managed AI agents real estate, WhatsApp AI, site visit automation, healthcare AI automation, lead qualification AI"/>
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
      <link rel="canonical" href="https://quickkitai.com"/>
    </Helmet>

    <PremiumLanding onBookDemo={() => handleOpenLeadForm(PlanTier.BUSINESS, 'I want to book the Raja AI Systems 5-Agent Workforce demo and review the Dussehra pilot.')} />

    {showLeadForm && (
      <LeadForm
        lang={lang}
        close={handleCloseLeadForm}
        initialData={{bizType:'Real Estate',plan:leadPlan}}
        prefilledNotes={leadFormNotes}
        aiFinancials={currentAIQuote}
        onVerified={handleCloseLeadForm}
      />
    )}
  </div>;

  return <ErrorBoundary><IndustryProvider><Routes><Route path="/" element={renderLandingView()}/><Route path="/real-estate-ai-questions" element={<RealEstateAIQuestions/>}/><Route path="/about" element={<LegalPages/>}/><Route path="/contact" element={<LegalPages/>}/><Route path="/privacy" element={<LegalPages/>}/><Route path="/terms" element={<LegalPages/>}/><Route path="/login" element={<Login/>}/><Route path="/client" element={isAuthenticated?<ClientPortal user={user} onLogout={handleLogout}/>:<Navigate to="/login" replace/>}/><Route path="/admin" element={isAuthenticated&&user?.role==='admin'?<AdminPortal user={user} onLogout={handleLogout}/>:<Navigate to="/login" replace/>}/><Route path="/blog" element={<Blog/>}/><Route path="/services/:niche" element={<PublicNichePage/>}/><Route path="/seo-audit" element={<SEOAudit/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></IndustryProvider></ErrorBoundary>;
};

export default App;