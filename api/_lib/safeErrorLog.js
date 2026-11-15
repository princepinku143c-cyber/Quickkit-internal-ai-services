const SAFE_CONTEXT = /^[A-Z][A-Z0-9_]{0,63}$/;
const SAFE_ERROR_NAME = /^[A-Za-z][A-Za-z0-9]{0,39}$/;

/**
 * Return only a bounded error class name. Never return/log the error message,
 * stack, request URL, provider response body, or arbitrary error properties.
 */
export function safeErrorType(error) {
  const name = typeof error?.name === "string" ? error.name : "";
  return SAFE_ERROR_NAME.test(name) ? name : "Error";
}

/** Log a fixed context label and the bounded error class only. */
export function logSafeError(context, error) {
  const label = typeof context === "string" && SAFE_CONTEXT.test(context)
    ? context
    : "API_ERROR";
  console.error(`[${label}]`, safeErrorType(error));
}
