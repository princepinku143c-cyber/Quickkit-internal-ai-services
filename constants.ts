import { PlanTier } from './types';

export const APP_NAME = "Raja AI Systems";
export const APP_VERSION = "v5.0.0-PRO";
export const CONTACT_EMAIL = "admin@quickkitai.com";
export const SUPPORT_EMAIL = "admin@quickkitai.com";
export const WHATSAPP_NUMBER = "918260485230";
export const WHATSAPP_USERNAME = "QUICKKIT_AI";
export const WHATSAPP_DIRECT_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_QR_ASSET = "/quickkit-ai-whatsapp-qr.svg";

// Public commercial source of truth for the Raja AI Systems offer in the October 2026 master ledger.
export const RAJA_COMMERCIAL_OFFER = {
  agencyName: "Raja AI Systems",
  regularSetupINR: 70000,
  regularMonthlyINR: 240000,
  festiveSetupINR: 35000,
  festiveMonthlyINR: 120000,
  discountPercent: 50,
  lifetimeLock: true,
  pilotClientSlots: 3,
  realEstateSlaVisits: 10,
  healthcareSlaConsultations: 15,
  slaDays: 30,
  deploymentHours: 48,
} as const;

export const AI_API_USAGE_NOTE = "Third-party/model usage is governed by the selected workflow and provider. The published Raja AI Systems commercial offer should not be interpreted as including external provider charges unless the signed scope says so.";

// Legacy QuickKit pricing constants retained for internal backwards compatibility.
// Public Raja AI Systems marketing uses RAJA_COMMERCIAL_OFFER above.
export const MANAGED_SYSTEMS = {
  KVM4: { name: "KVM 4", setupINR: 19999, maintenanceINRPerMonthFromMonth2: 15000, firstMonthMaintenanceIncluded: true },
  KVM8: { name: "KVM 8", setupINR: 39999, maintenanceINRPerMonthFromMonth2: 30000, firstMonthMaintenanceIncluded: true },
} as const;

export const PLANS = {
  [PlanTier.STARTER]: { name: "KVM 4", bestFor: "Legacy internal tier", priceMonth: 15000, priceSetup: 19999, features: [] },
  [PlanTier.PRO]: { name: "KVM 8", bestFor: "Legacy internal tier", priceMonth: 30000, priceSetup: 39999, features: [] },
  [PlanTier.BUSINESS]: { name: "Raja AI Systems 5-Agent Suite", bestFor: "Public managed AI workforce", priceMonth: RAJA_COMMERCIAL_OFFER.festiveMonthlyINR, priceSetup: RAJA_COMMERCIAL_OFFER.festiveSetupINR, features: [] }
};