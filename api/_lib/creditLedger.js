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
        uid: userId,
        role: "client",
        plan: "free",
        credits: remaining,
        createdAt: timestamp,
        lastUsed: timestamp,
      });
      return { allowed: true, remaining, created: true };
    }

    const userData = userSnapshot.data() ?? {};
    if (userData.uid !== undefined && userData.uid !== userId) {
      const error = new Error("Stored user profile identity is invalid.");
      error.status = 503;
      throw error;
    }

    // Signup creates a profile before the first AI request, but does not
    // create a credit balance. Grant the initial balance exactly once when
    // the credits field is absent; an explicit zero or malformed value is
    // never treated as a fresh account.
    const hasCreditBalance = Object.prototype.hasOwnProperty.call(userData, "credits");
    const storedCredits = userData.credits;
    if (hasCreditBalance && (!Number.isSafeInteger(storedCredits) || storedCredits < 0)) {
      const error = new Error("Stored user credit balance is invalid.");
      error.status = 503;
      throw error;
    }
    if (hasCreditBalance && storedCredits < amount) {
      return { allowed: false, remaining: storedCredits, created: false };
    }

    const timestamp = serverTimestamp();
    const profileDefaults = {
      ...(userData.uid === undefined ? { uid: userId } : {}),
      ...(userData.role === undefined ? { role: "client" } : {}),
      ...(userData.plan === undefined ? { plan: "free" } : {}),
      ...(userData.createdAt === undefined ? { createdAt: timestamp } : {}),
    };
    const remaining = (hasCreditBalance ? storedCredits : initialCredits) - amount;

    transaction.update(userRef, {
      ...profileDefaults,
      credits: remaining,
      lastUsed: timestamp,
    });
    return { allowed: true, remaining, created: false };
  });
}
