import { randomInt } from "node:crypto";

const TOKEN_SPACE = 36 ** 6;

// Preserve the existing six-character uppercase base-36 payment-token format,
// but generate it with Node's cryptographically secure random number generator.
export function generatePaymentToken() {
  return randomInt(TOKEN_SPACE).toString(36).padStart(6, "0").toUpperCase();
}
