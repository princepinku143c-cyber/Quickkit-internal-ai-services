import React from 'react';
import { Calendar, CheckCircle2, Video, BarChart4, Lightbulb, ShieldCheck } from 'lucide-react';
import { InlineWidget } from 'react-calendly';

interface DemoBookingProps {
  onBookDemo: () => void;
}

export const DemoBooking: React.FC<DemoBookingProps> = ({ onBookDemo }) => {
  return (
    <section id="demo" data-page="demo" className="py-24 bg-[#0a0f1c] relative border-t border-slate-800">
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-6 uppercase tracking-widest font-black">
              <Video className="w-4 h-4" /> Live AI Demonstration
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
             See Our AI Agents Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Live</span>
           </h2>
           <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
             In just 15 minutes, we'll show you exactly how our system automatically captures leads, handles support, and updates your CRM. No pressure, just a transparent breakdown of your potential ROI.
           </p>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-8">
          
          {/* Left: What You Will Get */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Lightbulb className="w-64 h-64" /></div>
            
            <div className="relative z-10">
               <h3 className="text-2xl font-black text-white mb-8 border-b border-slate-700/50 pb-4">What to Expect on the Call</h3>
               
               <ul className="space-y-6 mb-12">
                 <li className="flex items-start gap-4">
                   <div className="p-2.5 bg-blue-500/10 rounded-xl shrink-0 border border-blue-500/20">
                     <CheckCircle2 className="w-5 h-5 text-blue-400" />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Live Backend Walkthrough</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">Watch as <span className="text-white font-bold">Nimoclaw</span> assigns tasks and <span className="text-white font-bold">OpenClaw</span> executes them inside <span className="text-white font-bold">Smart AI CRM</span>.</p>
                   </div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0 border border-emerald-500/20">
                     <BarChart4 className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Custom ROI Breakdown</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">We'll calculate the exact hours saved and projected revenue boost based on your current lead flow.</p>
                   </div>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="p-2.5 bg-purple-500/10 rounded-xl shrink-0 border border-purple-500/20">
                     <ShieldCheck className="w-5 h-5 text-purple-400" />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Risk-Free Blueprint</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">Even if we don't work together, you'll walk away with a clear roadmap of what's possible for your business.</p>
                   </div>
                 </li>
               </ul>
            </div>

            <div className="relative z-10 bg-nexus-dark/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-3">
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-sm text-white font-bold uppercase tracking-widest">Simple Transparent Pricing</p>
               </div>
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <p className="text-sm text-white font-bold uppercase tracking-widest">No Hidden Charges</p>
               </div>
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <p className="text-sm text-white font-bold uppercase tracking-widest">Risk-Free Guarantee</p>
               </div>
            </div>
          </div>

          {/* Right: Live Calendly Embed */}
          <div className="w-full lg:w-[500px] bg-white rounded-[2.5rem] p-2 md:p-4 shadow-2xl relative flex flex-col min-h-[500px] lg:h-[700px]">
             <div className="w-full h-full rounded-[2rem] overflow-hidden">
                <InlineWidget 
                  url="https://calendly.com/princepinku143c/30min" 
                  styles={{ height: '100%', width: '100%' }}
                />
             </div>
             <div className="text-center mt-4 mb-2">
                <a 
                  href="https://calendly.com/princepinku143c/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest font-bold"
                >
                  Can't see the calendar? Open in new tab →
                </a>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};
