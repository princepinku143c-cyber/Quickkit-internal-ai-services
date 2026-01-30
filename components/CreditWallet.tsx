
import React, { useState } from 'react';
import { Zap, Plus, AlertCircle, CreditCard } from 'lucide-react';
import { UserProfile } from '../types';

interface CreditWalletProps {
  user: UserProfile;
}

export const CreditWallet: React.FC<CreditWalletProps> = ({ user }) => {
  const [showTopUp, setShowTopUp] = useState(false);
  
  // Logic: Calculate Percentage
  const percentage = Math.min((user.credits / user.monthlyLimit) * 100, 100);
  
  // Logic: Color Determination
  let colorClass = 'bg-emerald-500';
  let textColorClass = 'text-emerald-400';
  
  if (user.credits === 0) {
    colorClass = 'bg-red-500';
    textColorClass = 'text-red-400';
  } else if (percentage < 20) {
    colorClass = 'bg-amber-500';
    textColorClass = 'text-amber-400';
  }

  const handleTopUp = (amount: number, price: number) => {
    // In real app: Redirect to Stripe Checkout
    alert(`Redirecting to payment gateway for $${price} (${amount} Credits)...`);
    setShowTopUp(false);
  };

  return (
    <div className="bg-nexus-dark/50 border border-nexus-border rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Wallet</span>
        <Zap className={`w-4 h-4 ${textColorClass}`} />
      </div>

      {/* Balance Display */}
      <div className="mb-3">
         <div className="flex items-baseline gap-1">
             <span className="text-2xl font-bold text-white">{user.credits.toLocaleString()}</span>
             <span className="text-xs text-slate-500">/ {user.monthlyLimit.toLocaleString()}</span>
         </div>
         {user.credits === 0 && (
             <div className="flex items-center gap-1 text-red-400 text-xs font-bold mt-1">
                 <AlertCircle className="w-3 h-3" /> Workflow Paused
             </div>
         )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-nexus-card rounded-full overflow-hidden mb-4">
         <div 
            className={`h-full transition-all duration-500 ${colorClass}`} 
            style={{ width: `${percentage}%` }}
         ></div>
      </div>

      {/* Actions */}
      {!showTopUp ? (
        <button 
            onClick={() => setShowTopUp(true)}
            className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <Plus className="w-3 h-3" /> Add Credits
        </button>
      ) : (
        <div className="space-y-2 animate-fade-in">
            <p className="text-xs text-slate-400 text-center mb-1">Select Pack:</p>
            <button 
                onClick={() => handleTopUp(1000, 5)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs rounded-lg flex justify-between px-3"
            >
                <span>1,000 Cr</span>
                <span className="font-bold text-emerald-400">$5</span>
            </button>
            <button 
                onClick={() => handleTopUp(10000, 40)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-lg flex justify-between px-3 relative overflow-hidden"
            >
                <span className="relative z-10">10,000 Cr</span>
                <span className="font-bold text-white relative z-10">$40</span>
                <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            </button>
            <button 
                onClick={() => setShowTopUp(false)}
                className="w-full text-[10px] text-slate-500 hover:text-slate-300 mt-1"
            >
                Cancel
            </button>
        </div>
      )}
    </div>
  );
};
