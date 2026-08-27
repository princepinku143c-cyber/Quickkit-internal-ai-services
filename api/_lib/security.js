/**
 * Production security helpers.
 * Identity-aware rate limiting with a fail-closed posture.
 */
export async function checkRateLimit(admin, userId, action, limitCount = 10) {
  const now = Date.now();
  const windowMs = 60_000;
  const safeUserId = String(userId || "anonymous").slice(0, 160);
  const safeAction = String(action || "unknown").slice(0, 80);
  const limitRef = admin.firestore().collection("rate_limits").doc(`${safeUserId}_${safeAction}`);

  try {
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(limitRef);
      const data = doc.data() || { count: 0, firstCall: now };
      const firstCall = Number(data.firstCall) || now;
      const count = Number(data.count) || 0;

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
    console.error("RATE_LIMIT_UNAVAILABLE", err?.message || err);
    const unavailableError = new Error("Rate limiting is temporarily unavailable.");
    unavailableError.status = 503;
    throw unavailableError;
  }
}
