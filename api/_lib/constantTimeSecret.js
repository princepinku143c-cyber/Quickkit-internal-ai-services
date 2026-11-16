import { timingSafeEqual } from "node:crypto";

/**
 * Compare server-side shared secrets without leaking the first differing byte.
 * Empty, missing, non-string, and unequal-length inputs are always rejected.
 */
export function constantTimeSecretEqual(expected, supplied) {
  if (typeof expected !== "string" || typeof supplied !== "string") return false;
  if (!expected.length || !supplied.length) return false;

  const expectedBytes = Buffer.from(expected, "utf8");
  const suppliedBytes = Buffer.from(supplied, "utf8");
  if (expectedBytes.length !== suppliedBytes.length) return false;

  return timingSafeEqual(expectedBytes, suppliedBytes);
}
