
import React, { useState } from 'react';
import { Zap, Plus, AlertCircle, CreditCard, Loader2, Tag, Send } from 'lucide-react';
import { UserProfile } from '../types';
import { apiCall } from '../lib/api';

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
        alert(`ðŸš€ Success! ${data.amount} credits have been provisioned to your account.`);
    } catch (e: any) {
        setPromoError(e.message || '¶»§q«^