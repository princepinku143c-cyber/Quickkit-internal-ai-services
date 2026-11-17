import { randomInt } from "node:crypto";
import { constantTimeSecretEqual } from "./constantTimeSecret.js";

const TOKEN_SPACE = 36 ** 6;

// Preserve the existing six-character uppercase base-36 payment-token format,
// but generate it with Node's cryptographically secure random number generator.
export function generatePaymentToken() {
  return randomInt(TOKEN_SPACE).toString(36).padStart(6, "0").toUpperCase();
}


// Verify and consume a token in one Firestore transaction. This makes the
// one-time token semantics atomic under concurrent verification requests.
export async function verifyAndConsumePaymentToken(db, projectRef, token) {
  if (typeof token !== "string" || !token.trim()) return false;

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(projectRef);
    if (!snapshot.exists) return false;

    const storedToken = snapshot.get("paymentToken");
    if (
      typeof storedToken !== "string" || !storedToken.length
      || !constantTimeSecretEqual(storedToken, token)
    ) {
      return false;
    }

    transaction.update(projectRef, {
      status: "accepted",
      advancePaid: true,
      paymentToken: null,
    });
    return true;
  });
}
