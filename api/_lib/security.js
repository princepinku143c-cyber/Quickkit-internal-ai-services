import admin from './firebaseAdmin.js';

/**
 * Deterministic Rate Limiting Utility
 * Prevents resource exhaustion and bot volatility in serverless environments.
 * @param {string} userId - Authentic Principal ID
 * @param {number} windowMs - Window in milliseconds (e.g., 2000 for 2s)
 */
export const checkRateLimit = async (userId, windowMs = 5000) => {
  if (!userId) return { allowed: true }; // Skip for non-auth nodes if necessary

  const limitRef = admin.firestore().collection('_rate_limits').doc(userId);
  const now = Date.now();

  return await admin.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(limitRef);
    
    if (doc.exists) {
       const lastCall = doc.data().lastCall || 0;
       if (now - lastCall < windowMs) {
           return { allowed: false, retryIn: windowMs - (now - lastCall) };
       }
    }

    transaction.set(limitRef, { lastCall: now }, { merge: true });
    return { allowed: true };
  });
};

/**
 * Basic Payload Sanitization
 */
export const sanitizePayload = (text) => {
  if (!text) return '';
  return text.toString().substring(0, 5000).replace(/[<>]/g, ''); // Basic XSS + Length
};
