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
 ¶»§q«^