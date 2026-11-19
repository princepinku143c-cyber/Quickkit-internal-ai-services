import { isPlainObject, payloadTooLarge, safeText } from "./input.js";

const MAX_PROPOSAL_BYTES = 16 * 1024;
const MAX_FEATURES = 30;

function boundedText(value, maxLength) {
  if (!["string", "number", "boolean"].includes(typeof value)) return null;
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  const raw = String(value).trim();
  if (!raw || raw.length > maxLength) return null;
  return safeText(value, maxLength);
}

/**
 * Validate and bound admin proposal email data without changing price policy.
 * Price remains display text because the admin workflow owns its meaning.
 */
export function normalizeProposalInput(value) {
  if (!isPlainObject(value) || payloadTooLarge(value, MAX_PROPOSAL_BYTES)) return null;

  const { email: rawEmail, name: rawName, price: rawPrice, features: rawFeatures } = value;
  if (!rawEmail || !rawName || !rawPrice || !Array.isArray(rawFeatures)) return null;
  if (typeof rawEmail !== "string") return null;

  const email = boundedText(rawEmail, 254);
  const name = boundedText(rawName, 120);
  const price = boundedText(rawPrice, 80);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !price) return null;
  if (rawFeatures.length > MAX_FEATURES) return null;

  const features = [];
  for (const feature of rawFeatures) {
    const normalized = boundedText(feature, 300);
    if (!normalized) return null;
    features.push(normalized);
  }

  return { email, name, price, features };
}
