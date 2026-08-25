import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, ServiceItem, PlanTier, AIQuote } from './types';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { LegalDocType } from './components/LegalModal';
import { IndustryProvider } from './lib/IndustryContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GlobalLoader } from './components/GlobalLoader';

const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const WhyQuickKit = lazy(() => import('./components/WhyQuickKit').then(m => ({ default: m.WhyQuickKit })));
const WhoIsItFor = lazy(() => import('./components/WhoIsItFor').then(m => ({ default: m.WhoIsItFor })));
const AIAgents = lazy(() => import('./components/AIAgents').then(m => ({ default: m.AIAgents })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const DemoBooking = lazy(() => import('./components/DemoBooking').then(m => ({ default: m.DemoBooking })));
const BusinessImpact = lazy(() => import('./components/BusinessImpact').then(m => ({ default: m.BusinessImpact })));
const ROICalculator = lazy(() => import('./components/ROICalculator').then(m => ({ default: m.ROICalculator })));
const RoadmapModal = lazy(() => import('./components/catalog/RoadmapModal').then(m => ({ default: m.RoadmapModal })));
const LeadForm = lazy(() => import('./components/LeadForm').then(m => ({ default: m.LeadForm })));
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const ClientPortal = lazy(() => import('./components/ClientPortal').then(m => ({ default: m.ClientPortal })));
const AdminPortal = lazy(() => import('./components/AdminPortal').then(m => ({ default: m.AdminPortal })));
const LegalPages = lazy(() => import('./components/legal/LegalPages').then(m => ({ default: m.LegalPages })));
const PainSection = lazy(() => import('./components/PainSection').then(m => ({ default: m.PainSection })));
const SocialProofBar = lazy(() => import('./components/SocialProofBar').then(m => ({ default: m.SocialProofBar })));
const SmartBot = lazy(() => import('./components/SmartBot').then(m => ({ default: m.SmartBot })));
const FloatingActions = lazy(() => import('./components/FloatingActions').then(m => ({ default: m.FloatingActions })));
const Blog = lazy(() => import('./components/seo/Blog').then(m => ({ default: m.Blog })));
const SEOAudit = lazy(() => import('./components/seo/SEOAudit').then(m => ({ default: m.SEOAudit })));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  props!: { children: React.ReactNode };
  state = { hasError: false, error: null as any };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('GLOBAL ERROR:', error, info); }
  render() {
    if (this.state.hasError) return <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6"><h2 className="text-red-400 font-black text-2xl">Something went wrong</h2><button onClick={() => window.location.reload()} className="mt-4 px-5 py-3 rounded-xl bg-blue-600 font-bold">Reload</button></div>;
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [lang] = useState<Language>('en');
  const [architectPrompt, setArchitectPrompt] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceItem | null>(null);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [cachedRoadmap, setCachedRoadmap] = useState<{data: any, history: any[]} | null>(null);
  const [resumeArchitect, setResumeArchitect] = useState<{prompt?: string, item?: ServiceItem} | null>(null);
  const [sessionRef, setSessionRef] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormNotes, setLeadFormNotes] = useState('');
  const [currentAIQuote, setCurrentAIQuote] = useState<AIQuote | undefined>();
  const [activeLegalModal] = useState<LegalDocType>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const metaListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let unSubMeta: (() => void) | null = null;
    let unsubscribe: (() => void) | null = null;
    const safetyTimer = setTimeout(() => setAuthLoading(false), 5000);
    if (isFirebaseConfigured && auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          clearTimeout(safetyTimer);
          if (!firebaseUser) {
            localStorage.removeItem('token');
            unSubMeta?.(); unSubMeta = null;
            setUser(null); setIsAuthenticated(false); setAuthLoading(false); return;
          }
          const userRef = doc(db as any, 'users', firebaseUser.uid);
          try {
            const snap = await getDoc(userRef);
            const data = snap.data();
            if (!snap.exists() || !data || data.credits === undefined || data.credits <= 0) await setDoc(userRef, { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName || 'Operator', credits: 500, plan: 'free', role: data?.role || 'client', createdAt: data?.createdAt || new Date().toISOString() }, { merge: true });
          } catch (e) { console.error('Failed to initialize user metadata:', e); }
          unSubMeta = onSnapshot(userRef, async (snap) => {
            const data = snap.data();
            try { localStorage.setItem('token', await firebaseUser.getIdToken()); } catch {}
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: firebaseUser.displayName || data?.displayName || 'User', role: data?.role || 'client', credits: data?.credits ?? 0, monthlyLimit: data?.monthlyLimit ?? 1000, tier: data?.tier ?? 'STARTER', industryType: data?.industryType || '', workspaceName: data?.workspaceName || '', operatorName: data?.operatorName || '', contactEmail: data?.contactEmail || '', crmInitialized: data?.crmInitialized || false, customFormSchema: data?.customFormSchema || [] });
            setIsAuthenticated(true); setAuthLoading(false);
          }, (err) => { console.error('User metadata sync failed:', err); setIsAuthenticated(true); setAuthLoading(false); });
          metaListenerRef.current = unSubMeta;
        });
      } catch (e) { console.error('Auth listener error:', e); setAuthLoading(false); }
    } else { clearTimeout(safetyTimer); setAuthLoading(false); }
    return () => { unsubscribe?.(); unSubMeta?.(); clearTimeout(safetyTimer); };
  }, []);

  const handleLaunchArchitect = (prompt: string, isWidget = false) => { setIsWidgetMode(isWidget); if (prompt !== architectPrompt) { setCachedRoadmap(null); setSessionRef(generateSessionId()); } setArchitectPrompt(prompt); };
  const handleCatalogSelect = (item: ServiceItem) => { setIsWidgetMode(false); setCachedRoadmap(null); setSessionRef(generateSessionId()); setSelectedCatalogItem(item); };
  const handleFinalBook = (quote: AIQuote, history: any[]) => {
    setResumeArchitect({ prompt: architectPrompt || undefined, item: selectedCatalogItem || undefined }); setArchitectPrompt(null); setSelectedCatalogItem(null); setCurrentAIQuote(quote);
    const historyText = history.map(h => `${h.role === 'user' ? 'CLIENT' : 'ARCHITECT'}: ${h.parts?.[0]?.text || '[Image]'}\n`).join('\n');
    setLeadFormNotes(`--- REF: ${sessionRef} ---\n\n--- ARCHITECT LOG ---\n${historyText}`); setShowLeadForm(true);
  };
  const handleBackFromForm = () => { setShowLeadForm(false); if (resumeArchitect?.prompt) setArchitectPrompt(resumeArchitect.prompt); else if (resumeArchitect?.item) setSelectedCatalogItem(resumeArchitect.item); };
  const handleLogout = async () => { try { metaListenerRef.current?.(); metaListenerRef.current = null; await signOut(auth as any); } catch (e) { console.error('Logout error:', e); } finally { setIsAuthenticated(false); setUser(null); localStorage.removeItem('token'); } };

  const renderLandingView = () => <div className="bg-[#030712] min-h-screen font-sans text-slate-100 selection:bg-blue-500/30">
    <Helmet><title>QuickKit AI | Managed AI Agents for Indian Businesses</title><meta name="description" content="QuickKit AI builds, deploys, operates and maintains managed AI agent systems for Indian businesses across sales, support, CRM, WhatsApp, voice and business workflows." /><meta name="keywords" content="managed AI agents India, AI automation India, business AI agents, WhatsApp AI automation, CRM AI, AI workforce, Hermes AI agents" /><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" /><link rel="canonical" href="https://quickkitai.com/" /></Helmet>
    <Navbar onContact={() => setShowLeadForm(true)} isAuthenticated={isAuthenticated} />
    <Hero lang={lang} onLaunchArchitect={handleLaunchArchitect} />
    <Suspense fallback={<div className="h-40 flex items-center justify-center"><GlobalLoader message="Loading QuickKit AI..." /></div>}>
      <PainSection /><SocialProofBar /><Pricing lang={lang} onSelectPlan={(plan) => { setLeadFormNotes(`I am interested in the ${plan} plan.`); setShowLeadForm(true); }} /><WhyQuickKit /><WhoIsItFor onBookDemo={() => setShowLeadForm(true)} /><AIAgents onSelectAgent={handleCatalogSelect} /><Testimonials /><DemoBooking onBookDemo={() => setShowLeadForm(true)} /><BusinessImpact /><ROICalculator lang={lang} /><FloatingActions /><SmartBot onOpenArchitect={() => handleLaunchArchitect('Hi! I want to explore automation.', true)} />
    </Suspense>
    <footer className="bg-nexus-card border-t border-nexus-border py-12"><div className="container mx-auto px-6 text-center text-slate-500"><p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Built with Advanced Agentic Architecture</p><div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 text-sm"><a href="mailto:admin@quickkitai.com" className="hover:text-blue-400 transition-colors">admin@quickkitai.com</a></div><div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400"><a href="#ai-agents" className="hover:text-blue-400 transition-colors">AI Agents</a><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a><Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link><Link to="/seo-audit" className="hover:text-blue-400 transition-colors">SEO Audit</Link><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></div><p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p></div></footer>
  </div>;

  if (authLoading) return <GlobalLoader message="Loading QuickKit AI..." />;
  return <ErrorBoundary><IndustryProvider><Routes><Route path="/" element={renderLandingView()} /><Route path="/blog" element={<Blog />} /><Route path="/seo-audit" element={<SEOAudit />} /><Route path="/about" element={<LegalPages />} /><Route path="/contact" element={<LegalPages />} /><Route path="/privacy" element={<LegalPages />} /><Route path="/terms" element={<LegalPages />} /><Route path="/login" element={<Login />} /><Route path="/client" element={isAuthenticated ? <ClientPortal user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} /><Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <AdminPortal user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}<Route path="*" element={<Navigate to="/" replace />} /></Routes>{architectPrompt && <RoadmapModal customPrompt={architectPrompt} item={selectedCatalogItem || undefined} currency="INR" existingData={cachedRoadmap?.data} existingHistory={cachedRoadmap?.history} onSaveState={(data, history) => setCachedRoadmap({ data, history })} onClose={() => { setArchitectPrompt(null); setSelectedCatalogItem(null); }} onBook={handleFinalBook} sessionRef={sessionRef} />}{showLeadForm && <LeadForm lang={lang} close={() => setShowLeadForm(false)} onBack={handleBackFromForm} initialData={{ bizType: '', plan: PlanTier.STARTER }} prefilledNotes={leadFormNotes} aiFinancials={currentAIQuote} />}{activeLegalModal && null}</IndustryProvider></ErrorBoundary>;
};

export default App;
