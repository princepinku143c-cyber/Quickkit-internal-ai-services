
import { CatalogCategory } from '../types';

export const MASTER_CATALOG: CatalogCategory[] = [
  {
    id: 'L',
    title: 'Lead & Revenue AI',
    items: [
      { id: 1, name: "Omni-Lead Capture (FB/Web/Gmail)", setupUSD: 799, monthlyUSD: 100, description: "Capture, sort, and auto-reply to leads across all channels." },
      { id: 2, name: "WhatsApp & Gmail Sales Closer Agent", setupUSD: 1599, monthlyUSD: 199, description: "Advanced AI that handles objections and closes deals 24/7." },
      { id: 3, name: "LinkedIn Executive Outreach Engine", setupUSD: 1599, monthlyUSD: 199, description: "Hyper-personalized messaging for high-ticket B2B scale." },
      { id: 8, name: "A-Z Revenue Operations Pipeline", setupUSD: 3499, monthlyUSD: 299, description: "Full lead-to-cash automation with Zapier & CRM sync." },
    ]
  },
  {
    id: 'Z',
    title: 'Operational Ghost Sync (Zapier)',
    items: [
      { id: 101, name: "Cross-Platform CRM Sync (Zapier Hub)", setupUSD: 1599, monthlyUSD: 199, description: "Connect Slack, Gmail, and CRM into one automated brain." },
      { id: 102, name: "Automated Invoicing & Multi-Currency Billing", setupUSD: 799, monthlyUSD: 100, description: "Stripe/Crypto billing sync with auto-followups." },
      { id: 103, name: "Team Velocity & Task Auto-Scheduler", setupUSD: 1599, monthlyUSD: 199, description: "AI-driven task assignment based on live project triggers." },
    ]
  },
  {
    id: 'E',
    title: 'Executive AI Infrastructure',
    items: [
      { id: 201, name: "Proprietary AI Knowledge Base / Chat", setupUSD: 3499, monthlyUSD: 299, description: "AI that knows your company docs and serves clients instantly." },
      { id: 202, name: "AI Content Architect (Auto-Social)", setupUSD: 1599, monthlyUSD: 199, description: "Generated and post high-quality viral content on autopilot." },
      { id: 203, name: "Custom White-Label Portal foundation", setupUSD: 7999, monthlyUSD: 499, description: "Complete custom cloud portal for your internal team." },
    ]
  }
];
