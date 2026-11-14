import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is QuickKit AI?",
    answer: "QuickKit AI is a platform that designs and deploys custom AI agents and virtual employees to automate sales, marketing, support, and business workflows globally."
  },
  {
    question: "Is QuickKit AI free to start?",
    answer: "Yes. QuickKit AI is free to start with no credit card required. You can see your AI automation system live before paying anything."
  },
  {
    question: "How do QuickKit AI agents work?",
    answer: "Our AI agents run on autonomous virtual servers, executing complex workflows like lead generation, customer outreach, and database integrations hands-free."
  },
  {
    question: "How do AI agents automate workflows?",
    answer: "Unlike simple trigger-action rules, our AI agents use advanced decision-making intelligence to understand context, route information, and update systems automatically."
  },
  {
    question: "What automation does QuickKit AI support?",
    answer: "QuickKit AI supports CRM automation, lead generation, bulk email campaigns, social media AI, voice agents, customer support bots, and multi-agent orchestration workflows."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#030712] relative overflow-hidden border-t border-nexus-border">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 mb-6 uppercase tracking-[0.2em] font-black">
            <HelpCircle className="w-3 h-3" /> Frequently Asked Questions
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Everything You Need To Know
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Clear answers about deploying autonomous AI agents, enterprise integrations, and our zero-risk delivery promise.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/60 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                    : 'bg-nexus-card border-nexus-border hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full px-6 md:px-8 py-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base md:text-lg focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-blue-400">0{index + 1}</span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 md:px-8 pb-6 pt-2 text-slate-300 text-sm md:text-base leading-relaxed border-t border-slate-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
