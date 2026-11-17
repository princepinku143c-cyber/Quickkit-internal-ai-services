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
export async function verifyAndConsumePaymentToken(db, projectRef, token, actorUserId) {
  if (
    typeof token !== "string" || !token.trim()
    || typeof actorUserId !== "string" || !actorUserId.trim()
  ) {
    return false;
  }

  const actorRef = db.collection("users").doc(actorUserId);

  return db.runTransaction(async (transaction) => {
    const projectSnapshot = await transaction.get(projectRef);
    if (!projectSnapshot.exists) return false;

    // Read the actor's trusted server-managed profile in the same transaction.
    // Firebase custom claims or request-supplied role fields are not consulted.
    const actorSnapshot = await transaction.get(actorRef);
    const isOwner = projectSnapshot.get("userId") === actorUserId;
    const isAdmin = actorSnapshot.exists && actorSnapshot.get("role") === "admin";
    if (!isOwner && !isAdmin) return false;

    const storedToken = projectSnapshot.get("paymentToken");
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
