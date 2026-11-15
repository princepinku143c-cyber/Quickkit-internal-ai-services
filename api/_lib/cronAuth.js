import { timingSafeEqual } from "node:crypto";

/**
 * Verify the Authorization bearer token used by Vercel Cron.
 * A caller-controlled marker header is not an authentication credential.
 */
export function hasValidCronAuthorization(authorizationHeader, secret) {
  if (typeof secret !== "string" || secret.length === 0) return false;
  if (typeof authorizationHeader !== "string") return false;

  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const actual = Buffer.from(authorizationHeader, "utf8");
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}
