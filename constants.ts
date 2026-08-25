import { PlanTier } from './types';

export const APP_NAME = "QuickKit AI";
export const APP_VERSION = "v5.0.0-PRO";
export const CONTACT_EMAIL = "admin@quickkitai.com";
export const SUPPORT_EMAIL = "admin@quickkitai.com";
export const WHATSAPP_NUMBER = "918260485230";

// Public managed-system pricing source of truth.
export const MANAGED_SYSTEMS = {
  KVM4: {
    name: "KVM 4",
    setupINR: 19999,
    maintenanceINRPerMonthFromMonth2: 15000,
    firstMonthMaintenanceIncluded: true,
  },
  KVM8: {
    name: "KVM 8",
    setupINR: 39999,
    maintenanceINRPerMonthFromMonth2: 30000,
    firstMonthMaintenanceIncluded: true,
  },
} as const;

export const AI_API_USAGE_NOTE = "AI model and third-party API usage is billed separately according to actual usage and connected services.";

// Legacy plan constants retained only for backwards-compatible internal type references.
// They are not used for public pricing or payment amounts.
export const PLANS = {
  [PlanTier.STARTER]: { name: "KVM 4", bestFor: "Lighter managed AI workloads", priceMonth: 15000, priceSetup: 19999, features: [] },
  [PlanTier.PRO]: { name: "KVM 8", bestFor: "Higher-capacity managed AI workloads", priceMonth: 30000, priceSetup: 39999, features: [] },
  [PlanTier.BUSINESS]: { name: "Custom Managed System", bestFor: "Custom requirements", priceMonth: 0, priceSetup: 0, features: [] }
};
