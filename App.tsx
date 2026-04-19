
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, TriggerRequest, ExecutionLog, Currency, ServiceItem, PlanTier, AIQuote } from './types';

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

// NEW BLOCKS
import { SocialProofBar } from './components/SocialProofBar';
import { BusinessImpact } from './components/BusinessImpact';
import { WhyQuickKit } from './components/WhyQuickKit';
import { Testimonials } from './components/Testimonials';


// Portals
import { Login } from './components/Login';
import { ClientPortal } from './components/ClientPortal';
import { AdminPortal } from './components/AdminPortal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GlobalLoader } from './components/GlobalLoader';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');

  // AI Architect Modal State
  const [architectPrompt, setArchitectPrompt] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceItem | null>(null);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  
  // STATE LIFTING: Persist roadmap data until refresh
  const [cachedRoadmap, setCachedRoadmap] = useState<{data: any, history: any[]} | null>(null);
  // NEW: Store previous state to allow "Back" navigation
  const [resumeArchitect, setResumeArchitect] = useState<{prompt?: string, item?: ServiceItem} | null>(null);
  // NEW: Store a unique session reference for this blueprint interaction
  const [sessionRef, setSessionRef] = useState<string>('');

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormNotes, setLeadFormNotes] = useState('');
  // NEW: State to hold locked AI Quote
  const [currentAIQuote, setCurrentAIQuote] = useState<AIQuote | undefined>(undefined);
  // NEW: State for Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Handle Real Firebase Auth State
  useEffect(() => {
    if (Object.keys(auth).length === 0) {
       setAuthLoading(false); // Firebase not initialized
       return;
    }
    const unsubscribe = onAuthStateChanged(auth as any, async (firebaseUser) => {
        if (firebaseUser) {
            let role: 'admin' | 'client' = 'client';
            
            // Try to fetch custom role from Firestore
            if (Object.keys(db).length > 0) {
                const userDoc = await getDoc(doc(db as any, 'users', firebaseUser.uid));
                if (userDoc.exists() && userDoc.data().role) {
                    role = userDoc.data().role as 'admin' | 'client';
                }
            }

            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                role,
                credits: 500,
                monthlyLimit: 5000,
                tier: 'STARTER'
            });
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLaunchArchitect = (prompt: string, isWidget: boolean = false) => {
    setIsWidgetMode(isWidget);
    // Only clear cache if it's a completely NEW request from the Hero input
    if (prompt !== architectPrompt) {
        setCachedRoadmap(null);
        setSessionRef(generateSessionId()); // Generate new ID for new session
    }
    setArchitectPrompt(prompt);
  };

  const handleCatalogSelect = (item: ServiceItem) => {
      setIsWidgetMode(false); // Catalog items always open full screen
      // Clear cache for new catalog item selection
      setCachedRoadmap(null);
      setSessionRef(generateSessionId()); // Generate new ID for new session
      setSelectedCatalogItem(item);
  }

  // UPDATED: Now receives a structured quote object
  const handleFinalBook = (quote: AIQuote, history: any[]) => {
    // Capture current architect state before closing so we can go back
    setResumeArchitect({
        prompt: architectPrompt || undefined,
        item: selectedCatalogItem || undefined
    });

    setArchitectPrompt(null);
    setSelectedCatalogItem(null);
    setCurrentAIQuote(quote); // Store the locked quote
    
    // Stringify history for the notes field so the admin/team can see the whole conversation
    const historyText = history.map(h => `${h.role === 'user' ? 'CLIENT' : 'ARCHITECT'}: ${h.parts[0]?.text || '[Image]'} \n`).join('\n');
    setLeadFormNotes(`--- REF: ${sessionRef} ---\n\n--- ARCHITECT LOG ---\n${historyText}`);
    setShowLeadForm(true);
  };

  const handleBackFromForm = () => {
    setShowLeadForm(false);
    // Restore the modal state without clearing cache
    if (resumeArchitect?.prompt) {
        setArchitectPrompt(resumeArchitect.prompt);
    } else if (resumeArchitect?.item) {
        setSelectedCatalogItem(resumeArchitect.item);
    }
  };

  // Production: No demo bypass. Auth handled entirely by Firebase onAuthStateChanged.

  const handleLogout = async () => {
    if (Object.keys(auth).length > 0) {
        await signOut(auth as any);
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  // Helper component to redirect unauthenticated users
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (authLoading) return <GlobalLoader message="Authenticating Secure Session..." />;
    
    if (!isAuthenticated || !user) {
      return (
        <div className="relative">
          <a 
            href="/"
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors backdrop-blur-sm border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </a>
          <Login />
        </div>
      );
    }
    return children;
  };

  // Landing Page Block
  const LandingView = () => (
    <div className="bg-[#030712] min-h-screen font-sans text-slate-100">
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
      
      {/* Footer */}
      <footer className="bg-nexus-card border-t border-nexus-border py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="text-sm font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Built with Advanced Agentic Architecture</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 text-sm">
            <a href="mailto:sales@quickkit.online" className="hover:text-blue-400 transition-colors">Sales: sales@quickkit.online</a>
            <a href="mailto:support@quickkit.online" className="hover:text-emerald-400 transition-colors">Support: support@quickkit.online</a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 text-xs font-bold text-slate-600 uppercase tracking-wider">
             <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
             <span className="hidden sm:inline w-1 h-1 bg-slate-700 rounded-full"></span>
             <button onClick={() => setActiveLegalModal('terms')} className="hover:text-blue-400 transition-colors">Terms of Service</button>
             <span className="hidden sm:inline w-1 h-1 bg-slate-700 rounded-full"></span>
             <button onClick={() => setActiveLegalModal('refund')} className="hover:text-amber-400 transition-colors">Refund Policy</button>
          </div>
          
          <div className="text-xs text-slate-700 max-w-2xl mx-auto mb-6 leading-relaxed">
             QuickKit AI operates globally via a remote network of AI engineers. We do not maintain a physical storefront to ensure overhead remains low and savings are passed to our Enterprise clients.
          </div>
          <p>&copy; {new Date().getFullYear()} QuickKit AI. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Architect Modals */}
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
           onClose={() => { 
             setArchitectPrompt(null); 
             setSelectedCatalogItem(null); 
           }}
           onBook={handleFinalBook}
        />
      )}

      {/* Booking Form */}
      {showLeadForm && (
        <LeadForm 
          lang={lang} 
          close={() => {
            setShowLeadForm(false);
            setCurrentAIQuote(undefined);
            setLeadFormNotes('');
          }} 
          onBack={resumeArchitect ? handleBackFromForm : undefined}
          initialData={{ 
            bizType: currentAIQuote ? 'AI Architect Custom Build' : '', 
            plan: PlanTier.STARTER 
          }}
          prefilledNotes={leadFormNotes}
          aiFinancials={currentAIQuote}
        />
      )}

      {/* Legal Modal */}
      <LegalModal 
        type={activeLegalModal} 
        onClose={() => setActiveLegalModal(null)} 
      />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/login" element={
         isAuthenticated ? <Navigate to="/dashboard" /> : <ProtectedRoute><div /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
         <ProtectedRoute>
            {user?.role === 'admin' ? <AdminPortal user={user!} onLogout={handleLogout} /> : <ClientPortal user={user!} onLogout={handleLogout} />}
         </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
