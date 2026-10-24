import React, { useState } from 'react';
import {
  ArrowRight, BarChart3, CalendarCheck2, Check, ChevronRight, CircleCheck,
  Clock3, Crown, Database, Gauge, Globe2, LayoutDashboard, MessageCircle,
  Play, ShieldCheck, Sparkles, Star, Target, UsersRound, Wand2, X, Zap
} from 'lucide-react';
import { RAJA_COMMERCIAL_OFFER, WHATSAPP_DIRECT_URL } from '../constants';

interface PremiumLandingProps {
  onBookDemo: () => void;
}

const agents = [
  {
    no: '01',
    name: 'Speed-to-Lead Closer',
    tone: 'violet',
    icon: Zap,
    metric: 'Fast reply',
    subtitle: 'WhatsApp qualification + booking',
    bullets: ['Instant reply', 'Voice + text', 'Buyer qualification', 'Appointment booking'],
  },
  {
    no: '02',
    name: 'Lead Prospector',
    tone: 'cyan',
    icon: Target,
    metric: 'Daily research',
    subtitle: 'Prospecting + competitor intelligence',
    bullets: ['Targeted research', 'Public business data', 'Competitor monitoring', 'Daily lead reports'],
  },
  {
    no: '03',
    name: 'CRM Sentinel',
    tone: 'emerald',
    icon: CalendarCheck2,
    metric: 'Always-on',
    subtitle: 'Booking + no-show protection',
    bullets: ['Calendar lock', 'Location reminder', 'Travel link', 'Sales handoff'],
  },
  {
    no: '04',
    name: 'Dead Lead Reviver',
    tone: 'amber',
    icon: Wand2,
    metric: 'Measured uplift',
    subtitle: 'Dormant database reactivation',
    bullets: ['Old lead revival', 'Smart follow-up', 'Conversation hooks', 'Reactivation campaig¶»§q«^