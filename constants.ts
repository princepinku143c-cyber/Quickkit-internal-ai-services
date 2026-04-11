import { PlanTier } from './types';

export const APP_NAME = "QuickKit Global";
export const APP_VERSION = "v5.0.0-PRO";
export const CONTACT_EMAIL = "sales@quickkit.online";
export const SUPPORT_EMAIL = "support@quickkit.online";
export const WHATSAPP_NUMBER = "918260485230";

// Agency Delivery Promises - Speed Optimized
export const DELIVERY_STANDARD = "3 Days";
export const DELIVERY_COMPLEX = "5 Days Max";

// Global Maintenance Logic
export const BASE_MAINTENANCE = 100;

export const PLANS = {
  [PlanTier.STARTER]: {
    name: "Starter Bridge",
    bestFor: "Small Businesses & Startups",
    priceMonth: 100,
    priceSetup: 799,
    features: [
      "AI Architect Roadmap Build",
      "Basic Zapier Monitoring",
      "3-Day Rapid Deployment",
      "Official Email Support",
      "Excludes Third-party API keys"
    ]
  },
  [PlanTier.PRO]: {
    name: "Pro Automation Suite",
    bestFor: "Scaling Teams",
    priceMonth: 199, 
    priceSetup: 1599,
    features: [
      "Standard Zapier Monitoring",
      "Unlimited Small Script Fixes",
      "Quarterly Strategy Report",
      "3-Day Delivery Guarantee",
      "Priority Email Support (24hr)"
    ]
  },
  [PlanTier.BUSINESS]: {
    name: "Nexus Enterprise OS",
    bestFor: "Full Infrastructure Ownership",
    priceMonth: 299, 
    priceSetup: 3499,
    features: [
      "Full Premium Optimization",
      "Managed Zapier/Make Hub",
      "Unlimited Internal AI Tools",
      "5-Day Max Full-Scale Build",
      "Weekly Efficiency Audits"
    ]
  }
};
