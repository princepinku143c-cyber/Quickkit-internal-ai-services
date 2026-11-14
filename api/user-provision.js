import admin from "./_lib/firebaseAdmin.js";

const INVALID_ID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-user-token",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/tenant-id-mismatch",
]);

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, error: message });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendError(res, 405, "Method not allowed.");
  }

  const authorization = req.headers && req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return sendError(res, 401, "Sign-in is required.");
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(authorization.slice(7));
  } catch (authError) {
    if (INVALID_ID_TOKEN_CODES.has(authError?.code)) {
      console.warn("USER_PROVISION_AUTH_FAILED");
      return sendError(res, 401, "Authentication failed.");
    }
    // Firebase verifier outages are service failures, not invalid credentials.
    console.error("USER_PROVISION_AUTH_UNAVAILABLE");
    return sendError(res, 503, "Authentication service is temporarily unavailable.");
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(decoded.uid);

    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      if (snapshot.exists) {
        return { created: false };
      }

      transaction.create(userRef, {
        uid: decoded.uid,
        email: decoded.email || "",
        displayName: decoded.name || "User",
        role: "client",
        credits: 500,
        plan: "free",
        createdAt: new Date().toISOString(),
      });
      return { created: true };
    });

    return res.status(200).json({
      success: true,
      data: { profileReady: true, created: result.created },
    });
  } catch {
    // Transaction and database diagnostics stay out of application logs.
    console.error("USER_PROVISION_FAILED");
    return sendError(res, 503, "Unable to initialize the user profile.");
  }
}
