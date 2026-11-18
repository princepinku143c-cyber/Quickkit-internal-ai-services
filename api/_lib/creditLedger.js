/**
 * Atomically charge a user's AI credit balance.
 *
 * Reading and writing the balance in one Firestore transaction prevents
 * concurrent requests from both spending the same remaining credits.
 */
export async function chargeUserCredits(
  db,
  userId,
  {
    amount = 10,
    initialCredits = 500,
    serverTimestamp = () => new Date().toISOString(),
  } = {},
) {
  if (!db || typeof db.collection !== "function" || typeof db.runTransaction !== "function") {
    throw new TypeError("A Firestore database is required.");
  }
  if (
    typeof userId !== "string"
    || !userId
    || userId.length > 128
    || userId.includes("/")
  ) {
    throw new TypeError("A valid user ID is required.");
  }
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new RangeError("Credit charge must be a positive safe integer.");
  }
  if (!Number.isSafeInteger(initialCredits) || initialCredits < amount) {
    throw new RangeError("Initial credits must cover the requested charge.");
  }
  if (typeof serverTimestamp !== "function") {
    throw new TypeError("A server timestamp factory is required.");
  }

  const userRef = db.collection("users").doc(userId);
  return db.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);

    if (!userSnapshot.exists) {
      const remaining = initialCredits - amount;
      const timestamp = serverTimestamp();
      transaction.set(userRef, {
        credits: remaining,
        createdAt: timestamp,
        lastUsed: timestamp,
      });
      return { allowed: true, remaining, created: true };
    }

    const storedCredits = userSnapshot.data()?.credits ?? 0;
    if (!Number.isSafeInteger(storedCredits) || storedCredits < 0) {
      const error = new Error("Stored user credit balance is invalid.");
      error.status = 503;
      throw error;
    }
    if (storedCredits < amount) {
      return { allowed: false, remaining: storedCredits, created: false };
    }

    const remaining = storedCredits - amount;
    transaction.update(userRef, {
      credits: remaining,
      lastUsed: serverTimestamp(),
    });
    return { allowed: true, remaining, created: false };
  });
}
