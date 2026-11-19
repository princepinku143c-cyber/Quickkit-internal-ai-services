/**
 * Design Intelligence Tokens & System (Inspired by nextlevelbuilder/ui-ux-pro-max-skill)
 * Curated Luxury Design Profiles for High-Converting Web & Agent Interfaces.
 */

export const LUXURY_DESIGN_SYSTEM = {
  theme: 'Dark Luxury Obsidian',
  fonts: {
    heading: 'font-black tracking-[-0.045em]',
    subheading: 'font-bold tracking-tight',
    mono: 'font-mono uppercase tracking-[0.2em] text-[10px]',
    body: 'text-sm md:text-base leading-relaxed text-slate-400',
  },
  palettes: {
    obsidian: {
      bgDark: '#050608',
      surfaceDark: '#090b10',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      glowAmber: 'rgba(245, 158, 11, 0.15)',
      glowCyan: 'rgba(6, 182, 212, 0.12)',
    },
    amberGold: {
      primary: 'from-amber-200 via-amber-300 to-yellow-500',
      border: 'border-amber-400/40',
      bgPill: 'bg-amber-400/10',
      text: 'text-amber-300',
      shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    },
    emeraldTrust: {
      border: 'border-emerald-400/30',
      bgPill: 'bg-emerald-400/10',
      text: 'text-emerald-300',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
    cyanTech: {
      border: 'border-cyan-400/30',
      bgPill: 'bg-cyan-400/10',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    }
  },
  components: {
    glassCard: 'rounded-[2rem] border border-white/[0.08] bg-[#090b10]/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.4)]',
    spotlightCard: 'relative overflow-hidden rounded-[2.5rem] border-2 border-amber-400/30 bg-gradient-to-br from-[#0c0f17] via-[#08090d] to-[#040507] p-6 shadow-[0_30px_90px_rgba(245,158,11,0.15)] backdrop-blur-2xl',
    primaryButton: 'rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-6 text-xs font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(245,158,11,0.25)] transition hover:opacity-95',
    secondaryButton: 'rounded-xl border border-white/10 bg-white/[0.045] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/[0.08]',
    trustBadge: 'inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3.5 py-1.5 text-xs font-bold text-emerald-200'
  }
};
