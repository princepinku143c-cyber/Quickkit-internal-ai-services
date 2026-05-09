
import React, { useState } from 'react';
import { Zap, Plus, AlertCircle, CreditCard, Loader2, Tag, Send } from 'lucide-react';
import { UserProfile } from '../types';
import { apiCall } from '../lib/api';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CreditWalletProps {
  user: UserProfile;
}

export const CreditWallet: React.FC<CreditWalletProps> = ({ user }) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  
  if (!user) return null;
  const currentCredits = user.credits ?? 0;
  
  const percentage = Math.min((currentCredits / (user.monthlyLimit || 1000)) * 100, 100);
  
  let colorClass = 'bg-emerald-500';
  let textColorClass = 'text-emerald-400';
  
  if (currentCredits <= 0) {
    colorClass = 'bg-red-500';
    textColorClass = 'text-red-400';
  } else if (percentage < 20) {
    colorClass = 'bg-amber-500';
    textColorClass = 'text-amber-400';
  }

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
        const data = await apiCall('/api/system?action=redeem-code', { code: promoCode });
        setPromoCode('');
        alert(`🚀 Success! ${data.amount} credits have been provisioned to your account.`);
    } catch (e: any) {
        setPromoError(e.message || 'Invalid code');
    } finally {
        setPromoLoading(false);
    }
  };

  const handleManualRequest = async (amount: number, price: number) => {
    setPromoLoading(true);
    try {
        await apiCall('/api/system?action=trigger', {
            type: 'PAYMENT_REQUEST',
            payload: {
                userId: user.uid,
                userEmail: user.email,
                credits: amount,
                price: price,
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        });
        await addDoc(collection(db as any, 'payment_requests'), {
            userId: user.uid,
            userEmail: user.email,
            credits: amount,
            price: price,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        setRequestStatus("Request Sent! Admin will contact you.");
        setTimeout(() => setRequestStatus(null), 5000);
    } catch (e) {
        alert("Failed to send request. Please email support@quickkitai.com");
    } finally {
        setPromoLoading(false);
    }
  };

  const handleTopUp = (amount: number, price: number) => {
    if (confirm(`You are requesting ${amount} Credits for $${price}. Send manual payment request to Admin?`)) {
        handleManualRequest(amount, price);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><CreditCard className="w-16 h-16 text-white" /></div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Neural Balance</h3>
        <Zap className={`w-4 h-4 ${textColorClass} animate-pulse`} />
      </div>

      <div className="mb-6">
         <div className="flex items-baseline gap-1">
             <span className="text-4xl font-black text-white tracking-tighter">{currentCredits.toLocaleString()}</span>
             <span className="text-xs text-slate-500 font-bold">/ {(user.monthlyLimit || 1000).toLocaleString()}</span>
         </div>
         {currentCredits === 0 && (
             <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase mt-2">
                 <AlertCircle className="w-3 h-3" /> System Halted: Add Credits
             </div>
         )}
      </div>

      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-8">
         <div 
            className={`h-full transition-all duration-1000 ease-out ${colorClass}`} 
            style={{ width: `${percentage}%` }}
         ></div>
      </div>

      <div className="space-y-4">
        {requestStatus ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
                {requestStatus}
            </div>
        ) : (
            <button 
                onClick={() => setShowTopUp(!showTopUp)}
                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <Plus className="w-4 h-4" /> {showTopUp ? "Close Provisioning" : "Provision Credits"}
            </button>
        )}

        {showTopUp && (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-3">
              {[
                { c: 1000, p: 5 },
                { c: 10000, p: 40 }
              ].map(tier => (
                <button 
                  key={tier.c}
                  onClick={() => handleTopUp(tier.c, tier.p)}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all text-left group"
                >
                  <p className="text-xs font-black text-white group-hover:text-blue-400">{tier.c.toLocaleString()} Cr</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${tier.p} USD</p>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-3 text-center">Custom Package Request</p>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="ENTER AMOUNT" 
                        id="custom-credits-input"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-mono outline-none focus:border-blue-500" 
                    />
                    <button 
                        onClick={() => {
                            const val = (document.getElementById('custom-credits-input') as HTMLInputElement).value;
                            if(val) handleTopUp(Number(val), Math.ceil(Number(val) * 0.01));
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                        Request
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-3 text-center">Neural Promo / Request Code</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="ENTER CODE" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-mono outline-none focus:border-blue-500" 
                    />
                    <button 
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50"
                    >
                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                {promoError && <p className="text-[9px] text-red-500 mt-2 text-center uppercase font-bold">{promoError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
