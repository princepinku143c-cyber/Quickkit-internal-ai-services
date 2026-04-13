import React from 'react';
import { X, ShieldCheck, Scale, CreditCard } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'refund' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      text: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p><strong>1. Information Collection</strong><br/>We strictly collect only the information necessary to provide and manage our AI automation services, including contact details and business logic required for the Smart AI CRM.</p>
          <p><strong>2. Data Usage & Protection</strong><br/>Your data is processed using AES-256 encryption. We do not sell your personal or corporate data to third parties under any circumstances. Data routed through Nimoclaw and OpenClaw is sanitized and handled in encrypted sandboxes.</p>
          <p><strong>3. Third-Party Integrations</strong><br/>Our services integrate with authorized third parties (like Google Workspace or HubSpot). You are subject to their respective privacy policies regarding data stored natively within those applications.</p>
          <p><strong>4. Contact</strong><br/>For data removal or inquiries, contact privacy@quickkit.online.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: <Scale className="w-5 h-5 text-blue-400" />,
      text: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p><strong>1. Intellectual Property</strong><br/>QuickKit retains the architectural rights to the underlying Nimoclaw and OpenClaw logic engines. You retain full ownership of all data processed and workflows customized specifically for your workspace.</p>
          <p><strong>2. Account Usage</strong><br/>You are responsible for maintaining the security of your Smart AI CRM credentials. Unauthorized commercial reselling of your configured AI agent workspace without explicit written consent is prohibited.</p>
          <p><strong>3. Reliability and Uptime</strong><br/>While we guarantee 99.9% uptime on our infrastructure, we cannot be held liable for API outages from underlying model providers (e.g., OpenAI, Google Gemini).</p>
        </div>
      )
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      icon: <CreditCard className="w-5 h-5 text-amber-400" />,
      text: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
           <p className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 text-amber-200 font-medium">
             Our service delivery is based on a zero-friction, transparent model: Demo First, Payment Second. Because the heavy lifting happens before payment, our refund policy reflects the high setup costs of AI infrastructure.
           </p>
          <p><strong>1. Build & Demo Phase (No Risk)</strong><br/>We build your custom architecture and demonstrate the live system. If you are not satisfied with the demo, you owe nothing and we part ways.</p>
          <p><strong>2. Approval & Handover</strong><br/>Once you approve the system and complete the payment, we execute the formal handover of the Smart AI CRM and activate your 1-month free maintenance.</p>
          <p><strong>3. 7-Day Cancellation Policy</strong><br/>If you decide to cancel within 7 days of the official handover, you are entitled to a <strong>50% refund</strong>. The retained 50% strictly covers the complex, non-recoverable AI architecture build and deployment costs.</p>
          <p><strong>4. Monthly Maintenance</strong><br/>After the first free month, maintenance is billed monthly. You may cancel next month's retainer at any time with 7 days' notice prior to the billing cycle.</p>
        </div>
      )
    }
  };

  const activeContent = content[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0a0f1c]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800/50 rounded-lg">{activeContent.icon}</div>
             <h3 className="text-xl font-black text-white">{activeContent.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 group"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
          {activeContent.text}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-[#0a0f1c] flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
           >
             I Understand
           </button>
        </div>

      </div>
    </div>
  );
};
