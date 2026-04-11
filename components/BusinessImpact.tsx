import React from 'react';

const ImpactCard = ({ value, title, desc, colorClass, ringColor, dashOffset }: any) => (
  <div className="glass-card rounded-2xl p-8 text-center group">
    <div className="flex justify-center mb-6">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={ringColor} 
            strokeWidth="8" 
            strokeDasharray="283" 
            strokeDashoffset={dashOffset} 
            strokeLinecap="round" 
            className="transition-all duration-1000 group-hover:stroke-blue-400 drop-shadow-md"
          />
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black font-mono text-white drop-shadow-md">
          {value}
        </span>
      </div>
    </div>
    <h3 className={`text-lg font-bold mb-3 ${colorClass}`}>{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }}></p>
  </div>
);

export const BusinessImpact: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Business Impact
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-4">
            What <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI Automation</span> Does For Your Business
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See exactly how intelligent automation transforms every aspect of your operations — error-free, 24/7, at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ImpactCard 
            value="10x" 
            title="Revenue Growth" 
            desc="AI agents work 24/7 capturing leads, following up, and closing deals while you sleep. Our clients see up to <strong class='text-white'>10x revenue growth</strong> within 6 months."
            colorClass="text-blue-400"
            ringColor="#60a5fa"
            dashOffset={28}
          />
          <ImpactCard 
            value="95%" 
            title="Error Elimination" 
            desc="Human errors cost businesses thousands. AI agents execute tasks with <strong class='text-white'>95% fewer errors</strong> — no typos, no missed follows-ups."
            colorClass="text-emerald-400"
            ringColor="#34d399"
            dashOffset={14}
          />
          <ImpactCard 
            value="85%" 
            title="Time Saved" 
            desc="Automate repetitive tasks like data entry, scheduling, emails, and reporting. Your team gets back <strong class='text-white'>85% of their time</strong>."
            colorClass="text-cyan-400"
            ringColor="#22d3ee"
            dashOffset={42}
          />
          <ImpactCard 
            value="24/7" 
            title="Non-Stop Operations" 
            desc="Your AI agents never sleep, take breaks, or call in sick. They handle customer queries and process orders <strong class='text-white'>around the clock</strong>."
            colorClass="text-amber-400"
            ringColor="#fbbf24"
            dashOffset={56}
          />
          <ImpactCard 
            value="75%" 
            title="Cost Reduction" 
            desc="Replace expensive manual labor with intelligent automation. Businesses cut operational costs by <strong class='text-white'>up to 75%</strong> while increasing quality."
            colorClass="text-pink-400"
            ringColor="#f472b6"
            dashOffset={70}
          />
          <ImpactCard 
            value="∞" 
            title="Infinite Scalability" 
            desc="Unlike hiring, AI scales instantly. Handle <strong class='text-white'>1 or 10,000 customers simultaneously</strong> without additional costs or delays."
            colorClass="text-purple-400"
            ringColor="#c084fc"
            dashOffset={0}
          />
        </div>
      </div>
    </section>
  );
};
