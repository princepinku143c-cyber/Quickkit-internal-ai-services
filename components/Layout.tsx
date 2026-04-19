
import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Database, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { CreditWallet } from './CreditWallet';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [bonusRefresh, setBonusRefresh] = React.useState(0);

  React.useEffect(() => {
    const handleStorage = () => setBonusRefresh(prev => prev + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // SECURITY: Settings tab is ADMIN-ONLY. Clients never see private API keys.
  const isAdmin = user.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'terminal', label: 'AI Agent', icon: Terminal },
    { id: 'workflows', label: 'Legacy Workflows', icon: Zap },
    { id: 'data', label: 'Data & Results', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    // Settings is only injected into the nav for admin users
    ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-nexus-dark text-slate-300 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-nexus-border bg-nexus-card/50 backdrop-blur-xl fixed h-full z-20">
        <div className="p-6 border-b border-nexus-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-white tracking-wide text-lg">Smart AI CRM</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'hover:bg-nexus-border/50 text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Credit Wallet Widget (Sidebar Position) */}
        <div className="px-4 pb-2">
            <CreditWallet user={user} />
        </div>

        <div className="p-4 border-t border-nexus-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-nexus-card border border-nexus-border mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
              {user.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.role.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="h-16 border-b border-nexus-border bg-nexus-dark/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <span className="font-bold text-white">Smart AI CRM</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-white capitalize">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Topbar Credit Badge (Simplified) */}
            <div className="hidden md:flex items-center gap-2 bg-nexus-card border border-nexus-border px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-sm font-bold text-white">{(user.credits + (Number(localStorage.getItem('bonusCredits')) || 0)).toLocaleString()}</span>
                <span className="text-xs text-slate-500">Credits</span>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="md:hidden fixed inset-0 z-50 bg-nexus-dark">
              <div className="p-6 flex justify-between items-center border-b border-nexus-border">
                 <span className="font-bold text-white text-xl">Smart AI CRM</span>
                 <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-white" /></button>
              </div>
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${activeTab === item.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400'}`}
                  >
                    <item.icon className="w-6 h-6" /> {item.label}
                  </button>
                ))}
                
                {/* Mobile Credit Display */}
                <div className="px-4 py-4">
                    <p className="text-slate-400 mb-2">Credits: <span className="text-white font-bold">{(user.credits + (Number(localStorage.getItem('bonusCredits')) || 0)).toLocaleString()}</span> / {user.monthlyLimit}</p>
                </div>

                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 text-red-400 mt-8">
                   <LogOut className="w-6 h-6" /> Sign Out
                </button>
              </div>
           </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
