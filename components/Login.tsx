
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { Zap, ArrowRight, Lock, ShieldCheck, Mail, Loader2, Home } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Basic Title sync
    document.title = isLogin ? "Login | QuickKit AI" : "Signup | QuickKit AI";
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
        setError("System is running in demo mode. Authentication is disabled because Firebase credentials are not configured.");
        return;
    }
    if (!auth || Object.keys(auth).length === 0) {
        setError("Authentication system is initializing. Please retry.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
        if (isLogin) {
            const userCredential = await signInWithEmailAndPassword(auth as any, email, password);
            // 🚀 AUTOMATIC ADMIN PROMOTION for authorized emails
            const targetEmails = ["admin@quickkitai.com", "support@quickkitai.com", "princepinku143c@gmail.com"];
            if (targetEmails.includes(email.toLowerCase())) {
                try {
                    const token = await userCredential.user.getIdToken();
                    await fetch(`${window.location.origin}/api/system?action=setup-admin`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) {
                    console.error("Admin promotion node bypassed:", e);
                }
            }
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth as any, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            // Sync with Firestore
            if (Object.keys(db).length > 0) {
                await setDoc(doc(db as any, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: name,
                    role: 'client',
                    createdAt: new Date().toISOString()
                });
            }
        }
    } catch (error: any) {
        setError(error.message || "Authentication failed. Please check your credentials.");
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
        setError("System is running in demo mode. Authentication is disabled because Firebase credentials are not configured.");
        return;
    }
    if (!auth || Object.keys(auth).length === 0) {
        setError("Authentication system is initializing. Please retry.");
        return;
    }
    setLoading(true);
    try {
        const result = await signInWithPopup(auth as any, googleProvider as any);
        const user = result.user;

        // 🚀 AUTOMATIC ADMIN PROMOTION for authorized emails
        const targetEmails = ["admin@quickkitai.com", "support@quickkitai.com", "princepinku143c@gmail.com"];
        if (user.email && targetEmails.includes(user.email.toLowerCase())) {
            try {
                const token = await user.getIdToken();
                await fetch(`${window.location.origin}/api/system?action=setup-admin`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.error("Admin promotion node bypassed:", e);
            }
        }
        
        // Ensure user document exists in firestore
        if (Object.keys(db).length > 0) {
            const userRef = doc(db as any, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role: 'client',
                    createdAt: new Date().toISOString()
                });
            }
        }
    } catch (error: any) {
        setError(error.message || "Google sign-in failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Zap className="text-white w-7 h-7 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Smart AI CRM</h1>
            <p className="text-slate-500 mt-2">{isLogin ? 'Sign in to your client portal' : 'Create your operator account'}</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-nexus-border shadow-2xl">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium animate-pulse">
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                    <div className="animate-fade-in-up">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <input 
                            required
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="admin@quickkitai.com"
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
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Authenticating...</> : (
                        <>{isLogin ? 'Sign In with Email' : 'Create Account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
                
                <div className="flex items-center gap-4 py-2">
                   <div className="flex-1 h-px bg-slate-800"></div>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">or</span>
                   <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                   <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                   Continue with Google
                </button>

                {/* Bypass removed for production */}
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500 space-y-4">
                <p>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-blue-400 cursor-pointer ml-1 font-bold hover:underline"
                    >
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </span>
                </p>
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck className="w-3 h-3" />
                    <p>Enterprise Grade Encryption Active</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
