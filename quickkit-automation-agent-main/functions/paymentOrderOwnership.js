/**
 * Returns true only when a stored payment order is explicitly owned by the
 * authenticated Firebase UID. Missing or malformed ownership fails closed.
 * @param {unknown} orderData
 * @param {unknown} userId
 * @returns {boolean}
 */
export function isPaymentOrderOwnedBy(orderData, userId) {
  if (!orderData || typeof orderData !== "object" || Array.isArray(orderData)) return false;
  return typeof userId === "string"
    && userId.length > 0
    && "userId" in orderData
    && orderData.userId === userId;
}
