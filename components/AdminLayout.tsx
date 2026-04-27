
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Menu,
  X,
  FileText,
  CreditCard
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // ADMIN SPECIFIC NAVIGATION
  const navItems = [
    { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-leads', label: 'Leads Engine', icon: Users },
    { id: 'admin-projects', label: 'Build Queue', icon: FileText },
    { id: 'admin-payments', label: 'Revenue Ledger', icon: CreditCard },
    { id: 'admin-settings', label: 'System Control', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 font-sans">
      
      {/* Sidebar - Desktop (Red/Orange Accent for Admin) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Logo size={32} variant="admin" />
          <span className="font-bold text-white tracking-wide text-lg">Admin Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-orange-400' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Master Admin</p>
              <p className="text-xs text-slate-500 truncate">Super User</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>

        {/* ADMIN COMPLIANCE */}
        <div className="p-6 mt-auto border-t border-slate-800">
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                <a href="#/privacy" className="text-[10px] font-bold text-slate-600 hover:text-orange-400">Legal</a>
                <a href="#/terms" className="text-[10px] font-bold text-slate-600 hover:text-orange-400">Policy</a>
            </div>
            <p className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">System Architecture v2.4.0</p>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <span className="font-bold text-white">Admin Panel</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {activeTab.replace('admin-', '').replace('-', ' ')}
            </h2>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="md:hidden fixed inset-0 z-50 bg-slate-950">
              <div className="p-6 flex justify-between items-center border-b border-slate-800">
                 <span className="font-bold text-white text-xl">Admin Panel</span>
                 <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-white" /></button>
              </div>
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${activeTab === item.id ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400'}`}
                  >
                    <item.icon className="w-6 h-6" /> {item.label}
                  </button>
                ))}
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 text-red-400 mt-8">
                   <LogOut className="w-6 h-6" /> Exit Admin
                </button>
              </div>
           </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden bg-slate-950">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
