import React, { useState } from 'react';
import { Building2, Compass, ShoppingBag, Laptop, HeartPulse, HelpCircle, ArrowRight, Zap, Check } from 'lucide-react';
import { useIndustry } from '../lib/IndustryContext';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  user: UserProfile;
  onLogout: () => void;
}

const INDUSTRIES = [
  { id: 'Real Estate', name: 'Real Estate', icon: Building2, desc: 'Property listings, broker channels & buyer matching.', color: 'from-blue-500 to-cyan-500 shadow-blue-500/20' },
  { id: 'Agency', name: 'Digital Agency / Web', icon: Laptop, desc: 'Client onboarding, service proposals & lead tracking.', color: 'from-purple-500 to-indigo-500 shadow-purple-500/20' },
  { id: 'E-commerce', name: 'E-commerce', icon: ShoppingBag, desc: 'Checkout qualification, support logs & orders sync.', color: 'from-pink-500 to-rose-500 shadow-pink-500/20' },
  { id: 'Healthcare', name: 'Healthcare / Clinics', icon: HeartPulse, desc: 'Patient appointments, support desk & clinic CRM.', color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20' },
  { id: 'Travel', name: 'Travel & Tourism', icon: Compass, desc: 'Booking inquiries, tour packages & agent pipelines.', color: 'from-amber-500 to-orange-500 shadow-amber-500/20' },
  { id: 'Custom', name: 'Custom (Other)', icon: HelpCircle, desc: 'Configure custom fields for your unique business niche.', color: 'from-slate-500 to-slate-700 shadow-slate-500/20' }
];

export const Onboarding: React.FC<OnboardingProps> = ({ user, onLogout }) => {
  const { updateIndustryInFirebase } = useIndustry();
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await updateIndustryInFirebase(user.uid, selected);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-black tracking-widest text-blue-400 uppercase">
            <Zap className="w-3.5 h-3.5" /> QuickKit AI CRM Initialization
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Industry</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Choose your core industry niche. The CRM, Kanban opportunities, and automation pipelines will dynamically adapt their terminology and layout to your workspace.
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {INDUSTRIES.map((ind) => {
            const isSelected = selected === ind.id;
            const Icon = ind.icon;
            return (
              <div
                key={ind.id}
                onClick={() => setSelected(ind.id)}
                className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative group flex flex-col justify-between h-44 ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'bg-[#0f172a]/60 border-slate-800 hover:border-slate-700 hover:bg-[#0f172a]/80'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${ind.color} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700 group-hover:border-slate-500"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-wide mb-1 uppercase">{ind.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{ind.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors uppercase font-bold text-xs tracking-widest"
          >
            Sign Out
          </button>
          <button
            onClick={handleSave}
            disabled={!selected || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
              selected
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isSubmitting ? (
              'Initializing...'
            ) : (
              <>
                Confirm selection <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
