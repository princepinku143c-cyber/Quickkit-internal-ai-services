/**
 * Runs a lead notification after its Firestore records have committed.
 * Notification failures are best-effort: callers must not report a persisted
 * lead as failed merely because SMTP is temporarily unavailable.
 */
export async function sendLeadNotification(send, logger = console) {
  try {
    await send();
    return true;
  } catch {
    if (typeof logger?.error === "function") {
      logger.error("Lead notification email failed after lead persistence.");
    }
    return false;
  }
}
