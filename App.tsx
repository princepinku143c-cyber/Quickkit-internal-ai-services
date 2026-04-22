
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, ServiceItem, PlanTier, AIQuote } from './types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Landing Page Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { DemoBooking } from './components/DemoBooking';
import { ROICalculator } from './components/ROICalculator';
import { SystemArchitecture } from './components/SystemArchitecture';
import { Pricing } from './components/Pricing';
import { ServiceCatalog } from './components/ServiceCatalog';
import { AIAgents } from './components/AIAgents';
import { FloatingActions } from './components/FloatingActions';
import { SmartBot } from './components/SmartBot';
import { RoadmapModal } from './components/catalog/RoadmapModal';
import { LeadForm } from './components/LeadForm';
import { SocialProofBar } from './components/SocialProofBar';
import { BusinessImpact } from './components/BusinessImpact';
import { WhyQuickKit } from './components/WhyQuickKit';
import { Testimonials } from './components/Testimonials';

// Portals
import { Login } from './components/Login';
import { ClientPortal } from './components/ClientPortal';
import { AdminPortal } from './components/AdminPortal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { GlobalLoader } from './components/GlobalLoader';

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
    const unsubscribe = onAuthStateChanged(auth as any, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db as any, 'users', firebaseUser.uid);
        
        // 🚨 500 CREDIT ONBOARDING & RESET (FOR ALL USERS)
        const checkUserCredits = async () => {
          const snap = await getDoc(userRef);
          const data = snap.data();
          
          if (!snap.exists() || !data || data.credits === undefined || data.credits <= 0) {
             await setDoc(userRef, {
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               displayName: firebaseUser.displayName || 'Operator',
               credits: 500, // FORCE 500 FOR ALL ACCOUNTS TO TEST
               plan: 'free',
               role: data?.role || 'client',
               createdAt: data?.createdAt || new Date().toISOString()
             }, { merge: true });
          }
        };
        checkUserCredits();

        unSubMeta = onSnapshot(userRef, (snap) => {
          const data = snap.data();
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
        if (unSubMeta) unSubMeta();
        setUser(null);
        setIsAuthenticated(false);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unSubMeta) unSubMeta();
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
      <Navbar />
      <Hero lang={lang} onLaunchArchitect={handleLaunchArchitect} />
      <SocialProofBar />
      <Services lang={lang} />
      <Testimonials />
      <AIAgents onSelectAgent={handleCatalogSelect} />
      <ServiceCatalog onSelectItem={handleCatalogSelect} />
      <Pricing lang={lang} />
      <DemoBooking onBookDemo={() => setShowLeadForm(true)} />
      <SystemArchitecture />
      <ROICalculator lang={lang} />
      <BusinessImpact />
      <WhyQuickKit />
      <FloatingActions />
      <SmartBot onOpenArchitect={() => handleLaunchArchitect('Hi Kelly! I want to explore automation.', true)} />
      
      <footer className="bg-nexus-card border-t border-nexus-border py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Built with Advanced Agentic Architecture</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 text-sm">
            <span>Sales: sales@quickkitai.com</span>
            <span>Support: support@quickkitai.com</span>
          </div>
          <p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p>
        </div>
      </footer>

      {(architectPrompt || selectedCatalogItem) && (
        <RoadmapModal 
          customPrompt={architectPrompt || undefined} 
          item={selectedCatalogItem || undefined} 
          currency="USD"
          existingData={cachedRoadmap?.data}
          existingHistory={cachedRoadmap?.history}
          sessionRef={sessionRef}
          isWidget={isWidgetMode}
          onSaveState={(data, history) => setCachedRoadmap({ data, history })}
          onClose={() => { setArchitectPrompt(null); setSelectedCatalogItem(null); }}
          onBook={handleFinalBook}
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
    </div>
  );

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            user?.role === 'admin' ? <AdminPortal user={user!} onLogout={handleLogout} /> : <ClientPortal user={user!} onLogout={handleLogout} />
          ) : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
