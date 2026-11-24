/**
 * Production security helpers.
 * Identity-aware rate limiting with a fail-closed posture.
 */
import { logSafeError } from "./safeErrorLog.js";

export async function checkRateLimit(admin, userId, action, limitCount = 10) {
  const now = Date.now();
  const windowMs = 60_000;
  const safeUserId = String(userId || "anonymous").slice(0, 160);
  const safeAction = String(action || "unknown").slice(0, 80);
  try {
    if (!Number.isSafeInteger(limitCount) || limitCount < 1) {
      throw new TypeError("Rate limit configuration is invalid.");
    }

    // Initialize Firestore inside the guarded block so missing Admin credentials
    // or a failed client initialization is treated as an unavailable limiter.
    const db = admin.firestore();
    const limitRef = db.collection("rate_limits").doc(`${safeUserId}_${safeAction}`);
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(limitRef);
      let count = 0;
      let firstCall = now;

      if (doc.exists) {
        const data = doc.data();
        // Never coerce malformed counters or timestamps to zero/current time:
        // doing so could reset an exhausted bucket and silently bypass the limit.
        if (
          !data
          || typeof data !== "object"
          || Array.isArray(data)
          || !Number.isSafeInteger(data.count)
          || data.count < 0
          || !Number.isSafeInteger(data.firstCall)
          || data.firstCall < 0
        ) {
          throw new Error("Rate limit record is invalid.");
        }
        count = data.count;
        firstCall = data.firstCall;
      }

      if (now - firstCall >= windowMs) {
        transaction.set(limitRef, { count: 1, firstCall: now });
        return { allowed: true };
      }

      if (count >= limitCount) {
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((windowMs - (now - firstCall)) / 1000))
        };
      }

      transaction.set(limitRef, { count: count + 1, firstCall });
      return { allowed: true };
    });

    if (!result.allowed) {
      const rateLimitError = new Error(
        `Rate limit exceeded. Retry after ${result.retryAfter}s.`
      );
      rateLimitError.status = 429;
      rateLimitError.retryAfter = result.retryAfter;
      throw rateLimitError;
    }

    return true;
  } catch (err) {
    if (err?.status === 429) throw err;

    // Do not silently bypass abuse controls when the limiter backend is unavailable.
    logSafeError("RATE_LIMIT_UNAVAILABLE", err);
    const unavailableError = new Error("Rate limiting is temporarily unavailable.");
    unavailableError.status = 503;
    throw unavailableError;
  }
}
