import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { DAILY_EXECUTION_LIMIT, getAdminApp } from "../usage/daily.js";

const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_TOKEN_LENGTH = 8192;
const MAX_NODES = 50;

// Keep cloud runs disabled until a real Firebase Functions worker is registered and deployed.
const CLOUD_WORKER_DEPLOYMENT_CONFIGURED = false;
const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/tenant-id-mismatch",
]);
const VALID_RUN_STATUSES = new Set(["QUEUED", "RUNNING", "PAUSED", "COMPLETED", "FAILED"]);

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sendError(res, status, message, data) {
  return res.status(status).json({
    success: false,
    message,
    ...(data ? { data } : {}),
  });
}

function verifyDocumentId(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized || normalized.length > 128 || normalized.includes("/")) return "";
  return normalized;
}

function normalizeRunInput(body) {
  if (!isPlainObject(body)) return null;
  const allowedKeys = new Set([
    "runId",
    "projectId",
    "mode",
    "currentQueue",
    "completedNodeIds",
    "context",
    "startTime",
    "lastUpdateTime",
    "nodeLimitCount",
  ]);
  if (Object.keys(body).some((key) => !allowedKeys.has(key))) return null;

  const runId = verifyDocumentId(body.runId);
  const projectId = verifyDocumentId(body.projectId);
  if (!runId || !projectId || projectId === "test-project" || projectId === "unknown") return null;
  if (body.mode !== "local" && body.mode !== "cloud") return null;
  if (
    !Array.isArray(body.currentQueue)
    || body.currentQueue.length > MAX_NODES
    || body.currentQueue.some((id) => typeof id !== "string" || !id.trim() || id.length > 128)
  ) return null;
  if (
    !Array.isArray(body.completedNodeIds)
    || body.completedNodeIds.length > MAX_NODES
    || body.completedNodeIds.some((id) => typeof id !== "string" || !id.trim() || id.length > 128)
  ) return null;
  if (!isPlainObject(body.context)) return null;
  if (!Number.isSafeInteger(body.startTime) || body.startTime < 0) return null;
  if (!Number.isSafeInteger(body.lastUpdateTime) || body.lastUpdateTime < 0) return null;
  if (!Number.isSafeInteger(body.nodeLimitCount) || body.nodeLimitCount < 0 || body.nodeLimitCount > MAX_NODES) return null;

  return {
    runId,
    projectId,
    mode: body.mode,
    currentQueue: body.currentQueue,
    completedNodeIds: body.completedNodeIds,
    context: body.context,
    startTime: body.startTime,
    lastUpdateTime: body.lastUpdateTime,
    nodeLimitCount: body.nodeLimitCount,
  };
}

async function verifyUserIdToken(token) {
  return getAuth(getAdminApp()).verifyIdToken(token);
}

async function createRunForUser(userId, input) {
  return createRunWithQuota(
    getFirestore(getAdminApp()),
    userId,
    input,
    Date.now(),
    FieldValue.serverTimestamp(),
  );
}

export async function createRunWithQuota(db, userId, input, now = Date.now(), serverTimestamp = FieldValue.serverTimestamp(), cloudExecutionEnabled = process.env.CLOUD_EXECUTION_ENABLED === "true" && CLOUD_WORKER_DEPLOYMENT_CONFIGURED) {
  if (!db || typeof db.collection !== "function" || typeof db.runTransaction !== "function") {
    throw new TypeError("A Firestore Admin client is required.");
  }
  if (typeof userId !== "string" || !userId || userId.length > 128 || userId.includes("/")) {
    throw new TypeError("A valid authenticated user ID is required.");
  }
  if (
    !input
    || typeof input.runId !== "string"
    || typeof input.projectId !== "string"
    || (input.mode !== "local" && input.mode !== "cloud")
  ) {
    throw new TypeError("A valid run payload is required.");
  }

  // Environment flags are not proof that a worker exists. Keep cloud runs disabled in production
  // until a real Firebase Functions worker is registered, deployed, and covered by integration tests.
  if (input.mode === "cloud" && cloudExecutionEnabled !== true) {
    return { allowed: false, reason: "cloud_execution_unavailable" };
  }

  const timestamp = Number(now);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || !Number.isFinite(new Date(timestamp).getTime())) {
    throw new TypeError("A valid quota timestamp is required.");
  }

  const day = new Date(timestamp).toISOString().slice(0, 10);
  const projectRef = db.collection("projects").doc(input.projectId);
  const runRef = db.collection("active_runs").doc(input.runId);
  const quotaRef = db.collection("usage_quotas").doc(userId + "_" + day);

  return db.runTransaction(async (transaction) => {
    const [projectSnapshot, runSnapshot, quotaSnapshot] = await Promise.all([
      transaction.get(projectRef),
      transaction.get(runRef),
      transaction.get(quotaRef),
    ]);

    if (!projectSnapshot.exists || projectSnapshot.data()?.userId !== userId) {
      return { allowed: false, reason: "project_not_found" };
    }

    const count = quotaSnapshot.exists ? quotaSnapshot.data()?.count : 0;
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error("Daily quota record is invalid.");
    }

    if (runSnapshot.exists) {
      const existing = runSnapshot.data();
      if (existing?.userId === userId && existing?.projectId === input.projectId && existing?.mode === input.mode) {
        if (!VALID_RUN_STATUSES.has(existing.status)) {
          throw new Error("Existing active-run record is invalid.");
        }
        return { allowed: true, count, created: false, status: existing.status };
      }
      return { allowed: false, reason: "conflict" };
    }
    if (count >= DAILY_EXECUTION_LIMIT) {
      return { allowed: false, count, reason: "exceeded" };
    }

    const status = input.mode === "cloud" ? "QUEUED" : "RUNNING";
    transaction.create(runRef, {
      runId: input.runId,
      userId,
      projectId: input.projectId,
      mode: input.mode,
      status,
      currentQueue: input.currentQueue,
      completedNodeIds: input.completedNodeIds,
      context: input.context,
      startTime: input.startTime,
      lastUpdateTime: input.lastUpdateTime,
      nodeLimitCount: input.nodeLimitCount,
      createdAt: serverTimestamp,
    });
    transaction.set(quotaRef, { count: count + 1, lastUpdate: timestamp }, { merge: true });
    return { allowed: true, count: count + 1, created: true, status };
  });
}

export function createRunCreationHandler({ verifyIdToken = verifyUserIdToken, createRun = createRunForUser } = {}) {
  if (typeof verifyIdToken !== "function" || typeof createRun !== "function") {
    throw new TypeError("Run creation handler dependencies must be functions.");
  }

  return async function runCreationHandler(req, res) {
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

    const body = req.body;
    if (!isPlainObject(body)) return sendError(res, 400, "Invalid run request payload.");
    let bodyBytes;
    try {
      bodyBytes = Buffer.byteLength(JSON.stringify(body), "utf8");
    } catch {
      return sendError(res, 400, "Invalid run request payload.");
    }
    if (bodyBytes > MAX_REQUEST_BYTES) {
      return sendError(res, 413, "Request payload is too large.");
    }

    const input = normalizeRunInput(body);
    if (!input) return sendError(res, 400, "Invalid run request payload.");

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
      return sendError(res, 503, "Run authentication is temporarily unavailable.");
    }

    const uid = decoded?.uid;
    if (typeof uid !== "string" || !uid || uid.length > 128 || uid.includes("/")) {
      return sendError(res, 401, "Authentication failed.");
    }

    try {
      const result = await createRun(uid, input);
      if (result?.reason === "cloud_execution_unavailable") {
        return sendError(res, 503, "Cloud execution is not available until the worker is deployed.");
      }
      if (result?.reason === "project_not_found") {
        return sendError(res, 404, "Saved project was not found.");
      }
      if (result?.reason === "conflict") {
        return sendError(res, 409, "Run ID is already in use.");
      }
      if (result?.reason === "exceeded") {
        return sendError(res, 429, "Daily execution quota exceeded.", {
          allowed: false,
          count: result.count,
          reason: "exceeded",
        });
      }
      if (
        !result
        || result.allowed !== true
        || !Number.isSafeInteger(result.count)
        || result.count < 0
        || typeof result.created !== "boolean"
        || typeof result.status !== "string"
      ) {
        return sendError(res, 503, "Run creation is temporarily unavailable.");
      }

      return res.status(result.created ? 201 : 200).json({
        success: true,
        data: {
          allowed: true,
          count: result.count,
          created: result.created,
          status: result.status,
        },
      });
    } catch {
      return sendError(res, 503, "Run creation is temporarily unavailable.");
    }
  };
}

export default createRunCreationHandler();
