import { safeText } from "./input.js";

/** Normalize an authenticated project-create payload without changing price policy. */
export function normalizeProjectCreateInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const projectName = safeText(value.projectName, 120);
  const packageId = safeText(value.packageId, 80);
  const rawPrice = value.price;

  if (!projectName || projectName.length < 3 || !packageId) return null;
  if (typeof rawPrice !== "number" && typeof rawPrice !== "string") return null;
  if (typeof rawPrice === "string" && !rawPrice.trim()) return null;

  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0 || price > Number.MAX_SAFE_INTEGER) return null;

  return { projectName, packageId, price };
}
