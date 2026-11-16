const POST_ONLY = Object.freeze(["POST"]);
const READ_COMPATIBLE = Object.freeze(["GET", "POST"]);

export const SYSTEM_ACTION_METHODS = Object.freeze({
  stats: READ_COMPATIBLE,
  "add-credits": POST_ONLY,
  "redeem-code": POST_ONLY,
  "credit-request": POST_ONLY,
  "generate-payment-token": POST_ONLY,
  "verify-payment-token": POST_ONLY,
  "project-quote": POST_ONLY,
  "project-update": POST_ONLY,
  "project-status": POST_ONLY,
  lead: POST_ONLY,
});

export function getSystemActionMethods(action) {
  if (typeof action !== "string" || !Object.prototype.hasOwnProperty.call(SYSTEM_ACTION_METHODS, action)) {
    return null;
  }
  return SYSTEM_ACTION_METHODS[action];
}
