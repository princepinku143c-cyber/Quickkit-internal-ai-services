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
export function payloadTooLarge(value, maxBytes = 32 * 1024) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8") > maxBytes; }
  catch { return true; }
}
export function getClientIp(req) {
  const headers = req?.headers || {};
  const realIp = headers["x-real-ip"];
  const forwarded = headers["x-forwarded-for"];
  const candidate = typeof realIp === "string" && realIp.trim()
    ? realIp.trim()
    : typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "";
  return safeText(candidate || req?.socket?.remoteAddress || "unknown", 96) || "unknown";
}
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}
