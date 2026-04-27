/**
 * Industrialized Security Engine.
 * Implements Identity-Aware Rate Limiting with strict TTL guards.
 */
export async function checkRateLimit(admin, userId, action, limitCount = 10) {
  const now = Date.now();
  const windowMs = 60000; // 1 Minute Dynamic Window
  
  const limitRef = admin.firestore().collection("rate_limits").doc(`${userId}_${action}`);
  
  try {
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(limitRef);
      const data = doc.data() || { count: 0, firstCall: now };

      // 1. TTL / Window Check
      if (now - data.firstCall > windowMs) {
        // Reset window
        transaction.set(limitRef, { count: 1, firstCall: now });
        return { allowed: true };
      }

      // 2. Threshold Check
      if (data.count >= limitCount) {
        return { allowed: false, retryAfter: Math.ceil((windowMs - (now - data.firstCall)) / 1000) };
      }

      // 3. Increment within window
      transaction.update(limitRef, { count: data.count + 1 });
      return { allowed: true };
    });

    if (!result.allowed) {
      const error = new Error(`Infrastructure Rate Jam: Please cool down for ${result.retryAfter}s.`);
      error.status = 429;
      throw error;
    }

    return true;
  } catch (err) {
    if (err.status === 429) throw err;
    console.error("RATE_LIMIT_BYPASS:", err); // Log but let user through if DB is laggy (High Availability)
    return true; 
  }
}
