
import React, { useState, useEffect } from 'react';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, TriggerRequest, ExecutionLog, Currency, ServiceItem, PlanTier, AIQuote } from './types';

// Landing Page Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { DemoPreview } from './components/DemoPreview';
import { ROICalculator } from './components/ROICalculator';
import { Pricing } from './components/Pricing';
import { ServiceCatalog } from './components/ServiceCatalog';
import { FloatingActions } from './components/FloatingActions';
import { SmartBot } from './components/SmartBot';
import { RoadmapModal } from './components/catalog/RoadmapModal';
import { LeadForm } from './components/LeadForm';

// Portals
import { Login } from './components/Login';
import { ClientPortal } from './components/ClientPortal';
import { AdminPortal } from './components/AdminPortal';
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'landing' | 'crm'>('landing');
  const [lang, setLang] = useState<Language>('en');

  // AI Architect Modal State
  const [architectPrompt, setArchitectPrompt] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceItem | null>(null);
  
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

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleLaunchArchitect = (prompt: string) => {
    // Only clear cache if it's a completely NEW request from the Hero input
    if (prompt !== architectPrompt) {
        setCachedRoadmap(null);
        setSessionRef(generateSessionId()); // Generate new ID for new session
    }
    setArchitectPrompt(prompt);
  };

  const handleCatalogSelect = (item: ServiceItem) => {
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

  const handleLogin = () => {
    setUser({
        uid: 'admin-master',
        email: 'admin@autoflow.ai',
        displayName: 'System Admin',
        role: 'admin',
        credits: 4250,
        monthlyLimit: 5000,
        tier: 'BUSINESS'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setView('landing'); 
  };

  if (view === 'crm') {
    if (!isAuthenticated || !user) {
      return (
        <div className="relative">
          <button 
            onClick={() => setView('landing')}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors backdrop-blur-sm border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <Login onLogin={handleLogin} />
        </div>
      );
    }
    if (user.role === 'admin') return <AdminPortal user={user} onLogout={handleLogout} />;
    return <ClientPortal user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="bg-nexus-dark min-h-screen font-sans text-slate-100">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        isAdmin={false} 
        onLoginClick={() => setView('crm')} 
      />
      
      <Hero lang={lang} onLaunchArchitect={handleLaunchArchitect} />
      
      <Services lang={lang} />
      <DemoPreview lang={lang} />
      <ROICalculator lang={lang} />
      <Pricing lang={lang} />
      <ServiceCatalog onSelectItem={handleCatalogSelect} />
      
      <FloatingActions />
      <SmartBot onOpenArchitect={() => handleLaunchArchitect('')} />
      
      {/* Footer */}
      <footer className="bg-nexus-card border-t border-nexus-border py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="text-sm font-mono tracking-widest uppercase mb-4 text-slate-600 font-black">Powered by Zapier AI Engines</p>
          <p>&copy; {new Date().getFullYear()} QuickKit Global AI. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Architect Modals */}
      {(architectPrompt || selectedCatalogItem) && (
        <RoadmapModal 
           customPrompt={architectPrompt || undefined}
           item={selectedCatalogItem || undefined}
           currency="USD"
           // Pass cached data if available
           existingData={cachedRoadmap?.data}
           existingHistory={cachedRoadmap?.history}
           sessionRef={sessionRef} // NEW PROP
           // Save data back to App state
           onSaveState={(data, history) => setCachedRoadmap({ data, history })}
           onClose={() => { 
             // Just close the modal, state remains in 'cachedRoadmap'
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
            setCurrentAIQuote(undefined); // Clear quote on close
            setLeadFormNotes('');
          }} 
          onBack={resumeArchitect ? handleBackFromForm : undefined}
          initialData={{ 
            bizType: currentAIQuote ? 'AI Architect Custom Build' : '', 
            plan: PlanTier.STARTER 
          }}
          prefilledNotes={leadFormNotes}
          // Pass the locked quote to the form
          aiFinancials={currentAIQuote}
        />
      )}
    </div>
  );
};

export default App;
