import React from 'react';
import { Quote, Star, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-32 bg-[#030712] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 mb-8 uppercase tracking-[0.2em] font-black">
            <CheckCircle2 className="w-3 h-3" /> Verified Client Outcomes
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Real Impact on Operations
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            See how forward-thinking businesses are leveraging our AI engines to replace manual overhead and scale effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Testimonial 1 */}
          <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl relative group hover:border-blue-500/50 transition-colors">
            <div className="absolute -top-5 -left-5 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Quote className="w-4 h-4 text-white fill-current" />
            </div>
            
            <div className="flex gap-1 mb-6 text-blue-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
              "QuickKit transformed our daily operations. What used to take 3 hours of manual coordination now happens in 20 minutes. The AI agents handle scheduling and follow-ups so efficiently that we reduced our outsourced support team by 4 headcount while handling 2x the volume."
            </p>
            
            <div className="border-t border-nexus-border pt-6 flex justify-between items-end">
              <div>
                <p className="text-white font-bold mb-1">Operations Director</p>
                <p className="text-xs text-slate-500 font-mono">Midwest Distribution Co.</p>
                <div className="flex items-center gap-2 mt-2">
                   <img src="https://flagcdn.com/w20/us.png" alt="USA" className="w-4 h-auto opacity-70" />
                   <span className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">50-200 Employees</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" /> ROI Verified
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl relative group hover:border-purple-500/50 transition-colors mt-8 md:mt-0">
            <div className="absolute -top-5 -left-5 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Quote className="w-4 h-4 text-white fill-current" />
            </div>
            
            <div className="flex gap-1 mb-6 text-purple-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
              "As a growing regional broker, I was drowning in paperwork. The custom dashboard gave me visibility I never had. We completely automated our invoicing and lead sorting. It effectively replaced a full-time admin role from day one, improving our dispatch efficiency by 40%."
            </p>
            
            <div className="border-t border-nexus-border pt-6 flex justify-between items-end">
              <div>
                <p className="text-white font-bold mb-1">Founder & CEO</p>
                <p className="text-xs text-slate-500 font-mono">Regional Freight Solutions</p>
                <div className="flex items-center gap-2 mt-2">
                   <img src="https://flagcdn.com/w20/us.png" alt="USA" className="w-4 h-auto opacity-70" />
                   <span className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">Texas, USA (Team of 12)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-nexus-card border border-nexus-border p-8 rounded-3xl relative group hover:border-amber-500/50 transition-colors md:-translate-y-4">
            <div className="absolute -top-5 -left-5 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Quote className="w-4 h-4 text-white fill-current" />
            </div>
            
            <div className="flex gap-1 mb-6 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
              "We tested 4 different platforms before finding this. The Nimoclaw logic engine integration was seamless, and the tech team actually understands complex data workflows. This allowed us to reallocate 6 data entry clerks into higher-value analyst roles. A massive game changer."
            </p>
            
            <div className="border-t border-nexus-border pt-6 flex justify-between items-end">
              <div>
                <p className="text-white font-bold mb-1">VP of Technology</p>
                <p className="text-xs text-slate-500 font-mono">East Coast Logistics Partner</p>
                <div className="flex items-center gap-2 mt-2">
                   <img src="https://flagcdn.com/w20/us.png" alt="USA" className="w-4 h-auto opacity-70" />
                   <span className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">Enterprise (500+ Emp)</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" /> ROI Verified
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
