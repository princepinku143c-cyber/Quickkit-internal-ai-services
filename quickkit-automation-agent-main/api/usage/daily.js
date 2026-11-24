import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const DAILY_EXECUTION_LIMIT = 500;
const MAX_REQUEST_BYTES = 1024;
const MAX_TOKEN_LENGTH = 8192;

const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/tenant-id-mismatch",
]);

function adminUnavailableError() {
  const error = new Error("Firebase Admin is not configured for this environment.");
  error.code = "ADMIN_UNAVAILABLE";
  return error;
}

export function getAdminApp() {
  const apps = getApps();
  const existing = apps.find((candidate) => candidate.name === "[DEFAULT]") || apps[0];
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

  if (existing) {
    const existingProjectId = existing.options?.projectId;
    if (projectId && existingProjectId && existingProjectId !== projectId) {
      throw adminUnavailableError();
    }
    return existing;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        projectId,
      });
    } catch {
      throw adminUnavailableError();
    }
  }

  const hasApplicationDefaultCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS
    || process.env.GCLOUD_PROJECT
    || process.env.GCP_PROJECT
    || process.env.K_SERVICE
    || process.env.FUNCTIONS_EMULATOR
  );
  if (hasApplicationDefaultCredentials) {
    try {
      return initializeApp({
        ...(projectId || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT
          ? { projectId: projectId || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT }
          : {}),
      });
    } catch {
      throw adminUnavailableError();
    }
  }

  throw adminUnavailableError();
}

async function verifyUserIdToken(token) {
  return getAuth(getAdminApp()).verifyIdToken(token);
}

async function consumeQuotaForUser(userId) {
  return consumeDailyQuota(getFirestore(getAdminApp()), userId);
}

export async function consumeDailyQuota(db, userId, now = Date.now()) {
  if (!db || typeof db.collection !== "function" || typeof db.runTransaction !== "function") {
    throw new TypeError("A Firestore Admin client is required.");
  }
  if (
    typeof userId !== "string"
    || !userId
    || userId.length > 128
    || userId.includes("/")
  ) {
    throw new TypeError("A valid authenticated user ID is required.");
  }

  const timestamp = Number(now);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || !Number.isFinite(new Date(timestamp).getTime())) {
    throw new TypeError("A valid quota timestamp is required.");
  }

  const day = new Date(timestamp).toISOString().slice(0, 10);
  const quotaRef = db.collection("usage_quotas").doc(`${userId}_${day}`);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(quotaRef);
    const count = snapshot.exists ? snapshot.data()?.count : 0;

    // Corrupt quota records fail closed; they must never reset a user's limit.
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error("Daily quota record is invalid.");
    }
    if (count >= DAILY_EXECUTION_LIMIT) {
      return { allowed: false, count };
    }

    const nextCount = count + 1;
    transaction.set(quotaRef, { count: nextCount, lastUpdate: timestamp }, { merge: true });
    return { allowed: true, count: nextCount };
  });
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export function createDailyQuotaHandler({
  verifyIdToken = verifyUserIdToken,
  consumeQuota = consumeQuotaForUser,
} = {}) {
  if (typeof verifyIdToken !== "function" || typeof consumeQuota !== "function") {
    throw new TypeError("Daily quota handler dependencies must be functions.");
  }

  return async function dailyQuotaHandler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "OPTIONS") {
      res.setHeader("Allow", "POST, OPTIONS");
      return res.status(204).end();
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return sendError(res, 405, "Method not allowed.");
    }

    const rawLength = req.headers?.["content-length"] ?? req.headers?.["Content-Length"];
    if (rawLength !== undefined) {
      const contentLength = Number(rawLength);
      if (!Number.isFinite(contentLength) || contentLength < 0) {
        return sendError(res, 400, "Invalid request size.");
      }
      if (contentLength > MAX_REQUEST_BYTES) {
        return sendError(res, 413, "Request payload is too large.");
      }
    }

    if (req.body !== undefined && req.body !== null) {
      if (!isPlainObject(req.body) || Object.keys(req.body).length !== 0) {
        return sendError(res, 400, "Request body must be empty.");
      }
    }

    const authorization = req.headers?.authorization ?? req.headers?.Authorization;
    const tokenMatch = typeof authorization === "string"
      ? authorization.match(/^Bearer\s+(\S+)$/i)
      : null;
    if (!tokenMatch || tokenMatch[1].length > MAX_TOKEN_LENGTH) {
      return sendError(res, 401, "Authentication required.");
    }

    let decoded;
    try {
      decoded = await verifyIdToken(tokenMatch[1]);
    } catch (error) {
      const code = String(error?.code || "");
      if (INVALID_TOKEN_CODES.has(code)) {
        return sendError(res, 401, "Authentication failed.");
      }
      return sendError(res, 503, "Quota authentication is temporarily unavailable.");
    }

    const uid = decoded?.uid;
    if (typeof uid !== "string" || !uid || uid.length > 128 || uid.includes("/")) {
      return sendError(res, 401, "Authentication failed.");
    }

    try {
      const quota = await consumeQuota(uid);
      if (
        !quota
        || typeof quota.allowed !== "boolean"
        || !Number.isSafeInteger(quota.count)
        || quota.count < 0
      ) {
        return sendError(res, 503, "Quota service is temporarily unavailable.");
      }
      return res.status(200).json({
        success: true,
        data: { allowed: quota.allowed, count: quota.count },
      });
    } catch {
      return sendError(res, 503, "Quota service is temporarily unavailable.");
    }
  };
}

export default createDailyQuotaHandler();
