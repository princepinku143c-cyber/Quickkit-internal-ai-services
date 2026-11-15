const PROMO_VALIDATION_ERRORS = new Set([
  "Invalid promo code.",
  "Promo code has reached maximum usage.",
  "You have already redeemed this code.",
]);

/**
 * Convert internal exceptions into stable, non-sensitive API responses.
 * Only explicitly recognized business errors and rate-limit statuses cross the boundary.
 */
export function getPublicSystemError(error, fallback = "Request could not be completed.") {
  const status = Number(error?.status);
  if (status === 429) {
    return { status: 429, message: "Too many requests. Please try again later." };
  }
  if (status === 503) {
    return { status: 503, message: "Service temporarily unavailable. Please try again later." };
  }

  const message = typeof error?.message === "string" ? error.message : "";
  if (PROMO_VALIDATION_ERRORS.has(message)) {
    return { status: 400, message };
  }

  return { status: 500, message: fallback };
}
