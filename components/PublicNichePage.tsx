import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SeoMeta } from './SeoMeta';
import { Zap, Sparkles, CheckCircle2, MapPin, Clock, ArrowRight, Bot, MessageCircle, CalendarCheck, UserCheck, RefreshCw, ShieldCheck, Tag } from 'lucide-react';

interface NicheDetails {
  title: string;
  sub: string;
  description: string;
  keywords: string;
  features: string[];
}

const NICHE_DATA: Record<string, NicheDetails> = {
  'real-estate': {
    title: 'Raja AI Systems â€” Autonomous AI Workforce for Luxury Real Estate in India',
    sub: 'Turn property enquiries into qualified conversations, follow-ups and site visits with managed AI agents built for builders, developers and brokerages.',
    description: 'Raja AI Systems helps Indian real estate teams automate property lead qualification, WhatsApp follow-ups, site-visit coordination and CRM workflows. Healthcare automation is available as a secondary service; integrations are configured and verified per deployment.',
    keywords: 'real estate AI automation agency India, real estate AI agents India, AI for real estate India, property lead generation AI, real estate lead qualification AI, WhatsApp AI for real estate, real estate WhatsApp automation, AI calling for real estate, real estate CRM automation, property enquiry automation, site visit booking automation, builder AI automation, broker AI automation, real estate sales automation India, AI workforce for real estate, managed AI agen¶»§q«^