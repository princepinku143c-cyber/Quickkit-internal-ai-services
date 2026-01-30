
import React, { useState } from 'react';
import { Zap, ArrowRight, Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Auth
    setTimeout(() => {
        onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Zap className="text-white w-7 h-7 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">NexusStream</h1>
            <p className="text-slate-500 mt-2">Sign in to your client portal</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-nexus-border shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="admin@nexusstream.io"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 group"
                >
                    {loading ? 'Authenticating...' : (
                        <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>

                {/* BYPASS BUTTON */}
                <button 
                    type="button"
                    onClick={onLogin}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500/50"
                >
                    <ShieldCheck className="w-4 h-4" /> Fast Login (Admin Bypass)
                </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500">
                <p>Protected by Enterprise Grade Encryption</p>
            </div>
        </div>

      </div>
    </div>
  );
};
