
import { PlanTier } from './types';

export const APP_NAME = "NexusStream";
export const APP_VERSION = "OS 3.0.4";
export const CONTACT_EMAIL = "hq@nexusstream.io";
export const WHATSAPP_NUMBER = "15550123456"; 
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-nexus-stream-deployment/exec";

// Agency Delivery Promises - Speed Optimized
export const DELIVERY_STANDARD = "3 Days";
export const DELIVERY_COMPLEX = "5 Days Max";

// Global Maintenance Logic (Refined)
export const BASE_MAINTENANCE = 100;
export const VARIABLE_MAINTENANCE_THRESHOLD = 1100; // From $1100 onwards, 10% rule applies
export const VARIABLE_MAINTENANCE_RATE = 0.10;

export const PLANS = {
  [PlanTier.STARTER]: {
    name: "Starter Bridge",
    bestFor: "Small Businesses & Startups",
    priceMonth: 100,
    priceSetup: 500,
    features: [
      "AI Architect Roadmap Build",
      "Account Efficiency+ Monitoring",
      "3-Day Rapid Deployment",
      "Updates & Maintenance Included",
      "Excludes Third-party API keys"
    ]
  },
  [PlanTier.PRO]: {
    name: "Pro Automation Suite",
    bestFor: "Scaling Teams",
    priceMonth: 150, 
    priceSetup: 1500,
    features: [
      "Complex Multi-app Workflows",
      "Dedicated Solution Architect",
      "Priority Account Efficiency+",
      "3-Day Delivery Guarantee",
      "24/7 Security Patching"
    ]
  },
  [PlanTier.BUSINESS]: {
    name: "Nexus Enterprise OS",
    bestFor: "Full Infrastructure Ownership",
    priceMonth: 2000, 
    priceSetup: 0,
    features: [
      "Private n8n Infrastructure",
      "Unlimited Internal AI Tools",
      "5-Day Max Full-Scale Build",
      "Zero Setup Fee (Subscription)",
      "Weekly Efficiency Audits"
    ]
  }
};
