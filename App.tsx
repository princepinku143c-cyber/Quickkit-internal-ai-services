import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, ServiceItem, PlanTier, AIQuote } from './types';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { LegalDocType } from './components/LegalModal';

// Core Components (Static)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GlobalLoader } from './components/GlobalLoader';

// Lazy Loaded Components
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
const LegalModal = lazy(() => import('./components/LegalModal').then(m => ({ default: m.LegalModal })));

// 🚨 STEP 1 — GLOBAL CRASH STOP (MUST APPLY)
class ErrorBoundary extends React.Component<any, any> {
  constructor(props:any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error:any) {
    return { hasError: true, error };
  }
  componentDidCatch(error:any, info:any) {
    console.error("GLOBAL ERROR:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: "white", padding: 20, backgroundColor: "#030712", height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ App Crashed</h2>
          <pre style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', color: '#fca5a5' }}>{String(this.state.error)}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.25rem', border: 'none' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [architectPrompt, setArchitectPrompt] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceItem | null>(null);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [cachedRoadmap, setCachedRoadmap] = useState<{data: any, history: any[]} | null>(null);
  const [resumeArchitect, setResumeArchitect] = useState<{prompt?: string, item?: ServiceItem} | null>(null);
  const [sessionRef, setSessionRef] = useState<string>('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormNotes, setLeadFormNotes] = useState('');
  const [currentAIQuote, setCurrentAIQuote] = useState<AIQuote | undefined>(undefined);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unSubMeta: any = null;
    let unsubscribe: any = () => {};

    // 🛡️ SAFETY TIMEOUT: Don't hang forever if Firebase fails
    const safetyTimer = setTimeout(() => {
      if (authLoading) {
        console.warn("⏳ Auth initialization timed out. Proceeding...");
        setAuthLoading(false);
      }
    }, 5000);

    // Check if it's the real Firebase Auth (it has specific internal properties)
    // isFirebaseConfigured is imported at the top

    if (isFirebaseConfigured && auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          clearTimeout(safetyTimer);
          if (firebaseUser) {
            const userRef = doc(db as any, 'users', firebaseUser.uid);
            
            const checkUserCredits = async () => {
              if (!db || typeof db.getFirestore !== 'function') return;
              try {
                const snap = await getDoc(userRef);
                const data = snap.data();
                
                if (!snap.exists() || !data || data.credits === undefined || data.credits <= 0) {
                   await setDoc(userRef, {
                     uid: firebaseUser.uid,
                     email: firebaseUser.email,
                     displayName: firebaseUser.displayName || 'Operator',
                     credits: 500,
                     plan: 'free',
                     role: data?.role || 'client',
                     createdAt: data?.createdAt || new Date().toISOString()
                   }, { merge: true });
                }
              } catch (e) {
                console.error("Failed to check/update user credits:", e);
              }
            };
            checkUserCredits();

            unSubMeta = onSnapshot(userRef, async (snap) => {
              const data = snap.data();
              try {
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('token', token);
              } catch (e) {}
              
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || data?.displayName || 'User',
                role: data?.role || 'client',
                credits: data?.credits ?? 0,
                monthlyLimit: data?.monthlyLimit ?? 1000,
                tier: data?.tier ?? 'STARTER'
              });
              setIsAuthenticated(true);
              setAuthLoading(false);
            }, (err) => {
              console.error("User metadata sync failed:", err);
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: 'User', role: 'client', credits: 0, monthlyLimit: 1000, tier: 'FREE' });
              setIsAuthenticated(true);
              setAuthLoading(false);
            });
          } else {
            localStorage.removeItem('token');
            if (unSubMeta) unSubMeta();
            setUser(null);
            setIsAuthenticated(false);
            setAuthLoading(false);
          }
        });
      } catch (e) {
        console.error("Auth Listener Error:", e);
        setAuthLoading(false);
      }
    } else {
      console.warn("Auth initialization skipped: Using guest mode.");
      setAuthLoading(false);
      clearTimeout(safetyTimer);
    }

    return () => {
      unsubscribe();
      if (unSubMeta) unSubMeta();
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleLaunchArchitect = (prompt: string, isWidget: boolean = false) => {
    setIsWidgetMode(isWidget);
    if (prompt !== architectPrompt) {
      setCachedRoadmap(null);
      setSessionRef(generateSessionId());
    }
    setArchitectPrompt(prompt);
  };

  const handleCatalogSelect = (item: ServiceItem) => {
    setIsWidgetMode(false);
    setCachedRoadmap(null);
    setSessionRef(generateSessionId());
    setSelectedCatalogItem(item);
  };

  const handleFinalBook = (quote: AIQuote, history: any[]) => {
    setResumeArchitect({ prompt: architectPrompt || undefined, item: selectedCatalogItem || undefined });
    setArchitectPrompt(null);
    setSelectedCatalogItem(null);
    setCurrentAIQuote(quote);
    const historyText = history.map(h => `${h.role === 'user' ? 'CLIENT' : 'ARCHITECT'}: ${h.parts[0]?.text || '[Image]'} \n`).join('\n');
    setLeadFormNotes(`--- REF: ${sessionRef} ---\n\n--- ARCHITECT LOG ---\n${historyText}`);
    setShowLeadForm(true);
  };

  const handleBackFromForm = () => {
    setShowLeadForm(false);
    if (resumeArchitect?.prompt) setArchitectPrompt(resumeArchitect.prompt);
    else if (resumeArchitect?.item) setSelectedCatalogItem(resumeArchitect.item);
  };

  const handleLogout = async () => {
    await signOut(auth as any);
    setIsAuthenticated(false);
    setUser(null);
  };

  if (authLoading) return <GlobalLoader message="Waking Up Architecture..." />;

  const LandingView = () => (
    <div className="bg-[#030712] min-h-screen font-sans text-slate-100 selection:bg-blue-500/30">
      <Helmet>
        <title>QuickKit AI | Automate Your Sales, Leads & Support with AI</title>
        <meta name="description" content="QuickKit AI builds custom AI automation systems for businesses — chatbots, lead generation, sales automation, and 24/7 operations. See your system live before you pay." />
        <meta name="keywords" content="AI automation, lead generation AI, sales automation, chatbot, business AI, AI agent, QuickKit AI" />
        <link rel="canonical" href="https://quickkitai.com" />
      </Helmet>
      <Navbar onContact={() => setShowLeadForm(true)} isAuthenticated={isAuthenticated} />
      
      <Hero lang={lang} onLaunchArchitect={handleLaunchArchitect} />
      
      <Suspense fallback={<div className="h-40 flex items-center justify-center"><GlobalLoader message="Loading System..." /></div>}>
        <PainSection />
        <SocialProofBar />
        <Pricing
          lang={lang}
          onSelectPlan={(plan) => {
            setLeadFormNotes(`I am interested in the ${plan} plan.`);
            setShowLeadForm(true);
          }}
        />
        <WhyQuickKit />
        <WhoIsItFor onBookDemo={() => setShowLeadForm(true)} />
        <AIAgents onSelectAgent={handleCatalogSelect} />
        <Testimonials />
        <DemoBooking onBookDemo={() => setShowLeadForm(true)} />
        <BusinessImpact />
        <ROICalculator lang={lang} />
        <FloatingActions />
        <SmartBot onOpenArchitect={() => handleLaunchArchitect('Hi Kelly! I want to explore automation.', true)} />
      </Suspense>
      
      <footer className="bg-nexus-card border-t border-nexus-border py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Built with Advanced Agentic Architecture</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 text-sm">
            <span>Sales: sales@quickkitai.com</span>
            <span>Support: support@quickkitai.com</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#ai-agents" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">AI Agents</a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Pricing</a>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Terms of Service</Link>
            <Link to="/refund" className="hover:text-blue-400 transition-colors border-b border-transparent hover:border-blue-400/30 pb-0.5">Refund Policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p>
        </div>
      </footer>

      <Suspense fallback={null}>
        {(architectPrompt || selectedCatalogItem) && (
          <RoadmapModal 
            item={selectedCatalogItem || undefined} 
            currency="USD"
            onClose={() => { setArchitectPrompt(null); setSelectedCatalogItem(null); }}
            sessionRef={sessionRef}
            onSaveState={(data, history) => setCachedRoadmap({ data, history })}
            onBook={handleFinalBook}
            existingData={cachedRoadmap?.data}
            existingHistory={cachedRoadmap?.history}
          />
        )}

        {showLeadForm && (
          <LeadForm 
            lang={lang} 
            close={() => { setShowLeadForm(false); setCurrentAIQuote(undefined); setLeadFormNotes(''); }} 
            onBack={resumeArchitect ? handleBackFromForm : undefined}
            initialData={{ bizType: currentAIQuote ? 'AI Architect Custom Build' : '', plan: PlanTier.STARTER }}
            prefilledNotes={leadFormNotes}
            aiFinancials={currentAIQuote}
          />
        )}

        <LegalModal type={activeLegalModal} onClose={() => setActiveLegalModal(null)} />
      </Suspense>
    </div>
  );

  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb" }}>
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoader message="Waking Up Architecture..." />}>
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/pricing" element={<LandingView />} />
            <Route path="/ai-agents" element={<LandingView />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={
              isAuthenticated ? (
                user?.role === 'admin' ? <AdminPortal user={user!} onLogout={handleLogout} /> : <ClientPortal user={user!} onLogout={handleLogout} />
              ) : <Navigate to="/login" />
            } />
            <Route path="/privacy" element={<LegalPages />} />
            <Route path="/terms" element={<LegalPages />} />
            <Route path="/refund" element={<LegalPages />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </PayPalScriptProvider>
  );
};

export default App;
