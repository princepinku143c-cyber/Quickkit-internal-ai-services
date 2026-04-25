
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'primary' | 'admin';
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '', showText = false, variant = 'primary' }) => {
  const gradientClass = variant === 'admin' ? 'from-red-500 to-orange-600' : 'from-blue-500 to-indigo-600';
  const glowColor = variant === 'admin' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Outer Glow Ring */}
        <div 
            className={`absolute inset-0 rounded-xl blur-xl animate-pulse ${variant === 'admin' ? 'bg-red-600/30' : 'bg-blue-600/30'}`} 
        />
        
        {/* Core Container */}
        <div 
          className={`relative w-full h-full rounded-xl bg-gradient-to-br flex items-center justify-center border border-white/20 ${gradientClass}`}
          style={{ boxShadow: `0 0 20px ${glowColor}` }}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
            style={{ width: size * 0.6, height: size * 0.6 }}
          >
            <path 
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
              fill="currentColor" 
              stroke="white" 
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {showText && (
        <span className="font-black text-white tracking-tighter uppercase" style={{ fontSize: size * 0.45 }}>
          QuickKit <span className="text-blue-500">AI</span>
        </span>
      )}
    </div>
  );
};
