import { isIP } from "node:net";

export function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
export function safeText(value, maxLength = 500) {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return "";
  if (typeof value === "number" && !Number.isFinite(value)) return "";
  return String(value).trim().slice(0, maxLength);
}
export function safeNumber(value, fallback = 0, maxAbs = 1_000_000_000) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && Math.abs(number) <= maxAbs ? number : fallback;
}

/** Validate an admin credit adjustment before changing a user's balance. */
export function normalizeCreditAdjustment(targetUserIdValue, amountValue) {
  if (typeof targetUserIdValue !== "string") return null;
  const targetUserId = targetUserIdValue.trim();
  if (!targetUserId || targetUserId.length > 128 || targetUserId.includes("/")) return null;
  if (typeof amountValue !== "number" && typeof amountValue !== "string") return null;
  if (typeof amountValue === "string" && !amountValue.trim()) return null;

  const amount = Number(amountValue);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 1_000_000_000) return null;
  return { targetUserId, amount };
}

export function normalizeCreditPackage(creditsValue, priceValue) {
  const parsePositiveInteger = (value) => {
    if (typeof value !== "number" && typeof value !== "string") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 1_000_000_000
      ? parsed
      : null;
  };

  const credits = parsePositiveInteger(creditsValue);
  const price = parsePositiveInteger(priceValue);
  if (credits === null || price === null) return null;

  const isPresetPackage =
    (credits === 1000 && price === 5) ||
    (credits === 10000 && price === 40);
  const customPrice = Math.ceil(credits * 0.01);

  if (!isPresetPackage && price !== customPrice) return null;
  return { credits, price };
}
export function normalizeFirestoreDocumentId(value, maxLength = 128) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized || value.length > maxLength || normalized.includes("/")) return "";
  return normalized;
}

export function safeMetadata(value, maxEntries = 30) {
  if (!isPlainObject(value)) return {};
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value).slice(0, maxEntries)) {
    const key = safeText(rawKey, 80);
    if (!key || !/^[a-zA-Z0-9_.-]+$/.test(key) || ["__proto__", "prototype", "constructor"].includes(key)) continue;
    if (typeof rawValue === "string") result[key] = rawValue.trim().slice(0, 500);
    else if (typeof rawValue === "boolean") result[key] = rawValue;
    else if (typeof rawValue === "number" && Number.isFinite(rawValue)) result[key] = rawValue;
  }
  return result;
}
/** Remove reserved idempotency-key aliases before persisting webhook metadata. */
export function stripWebhookIdempotencyMetadata(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([rawKey]) => !/^idempotency[-_]?key$/i.test(rawKey)),
  );
}

export function payloadTooLarge(value, maxBytes = 32 * 1024) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8") > maxBytes; }
  catch { return true; }
}
function normalizeClientIp(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  return isIP(candidate) ? candidate.toLowerCase() : "";
}

export function getClientIp(req) {
  const headers = req?.headers || {};
  const realIp = normalizeClientIp(headers["x-real-ip"]);
  if (realIp) return realIp;

  const forwarded = typeof headers["x-forwarded-for"] === "string"
    ? headers["x-forwarded-for"].split(",")[0].trim()
    : "";
  const forwardedIp = normalizeClientIp(forwarded);
  if (forwardedIp) return forwardedIp;

  return normalizeClientIp(req?.socket?.remoteAddress) || "unknown";
}
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}
