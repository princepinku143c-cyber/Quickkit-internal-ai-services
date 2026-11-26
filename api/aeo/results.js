import admin from "../_lib/firebaseAdmin.js";
import { checkRateLimit } from "../_lib/security.js";
import {
  isPlainObject,
  normalizeFirestoreDocumentId,
  safeText,
} from "../_lib/input.js";

const MAX_TOKEN_LENGTH = 8192;
const MAX_RESULT_AGE_TEXT_LENGTH = 64;

function sendError(res, status, message, retryAfter) {
  if (retryAfter) res.setHeader("Retry-After", String(retryAfter));
  return res.status(status).json({ success: false, message });
}

function normalizeStoredResult(record, resultId) {
  if (!isPlainObject(record) || record.schemaVersion !== 1) return null;
  if (typeof record.keyword !== "string" || !Number.isInteger(record.requestedCount)) return null;
  if (record.requestedCount < 1 || record.requestedCount > 5) return null;
  if (!Array.isArray(record.qaPairs) || record.qaPairs.length !== record.requestedCount) return null;
  if (typeof record.createdAt !== "string") return null;

  const keyword = safeText(record.keyword, 160);
  const createdAt = safeText(record.createdAt, MAX_RESULT_AGE_TEXT_LENGTH);
  if (!keyword || /[\u0000-\u001f\u007f]/.test(keyword) || !Number.isFinite(Date.parse(createdAt))) {
    return null;
  }

  const qaPairs = [];
  for (const pair of record.qaPairs) {
    if (!isPlainObject(pair) || typeof pair.question !== "string" || typeof pair.answer !== "string") {
      return null;
    }
    const question = safeText(pair.question, 300);
    const answer = safeText(pair.answer, 1800);
    if (!question || !answer) return null;
    qaPairs.push({ question, answer });
  }

  return {
    resultId,
    keyword,
    requestedCount: record.requestedCount,
    qaPairs,
    createdAt,
  };
}

export function createAeoResultsHandler({
  adminClient = admin,
  rateLimit = checkRateLimit,
} = {}) {
  return async function aeoResultsHandler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "OPTIONS") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(204).end();
    }
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return sendError(res, 405, "Method not allowed.");
    }

    const query = req.query;
    if (
      !isPlainObject(query)
      || Object.keys(query).some((key) => key !== "id")
      || typeof query.id !== "string"
    ) {
      return sendError(res, 400, "A valid AEO result ID is required.");
    }

    const resultId = normalizeFirestoreDocumentId(query.id, 128);
    if (
      !resultId
      || resultId !== query.id
      || !/^[A-Za-z0-9_-]{1,128}$/.test(resultId)
    ) {
      return sendError(res, 400, "A valid AEO result ID is required.");
    }

    const authHeader = req.headers?.authorization;
    const tokenMatch = typeof authHeader === "string"
      ? authHeader.match(/^Bearer\s+(\S+)$/i)
      : null;
    if (!tokenMatch || tokenMatch[1].length > MAX_TOKEN_LENGTH) {
      return sendError(res, 401, "Authentication required.");
    }

    if (!adminClient?.apps?.length) {
      return sendError(res, 503, "AEO authentication is temporarily unavailable.");
    }

    let uid;
    try {
      const decoded = await adminClient.auth().verifyIdToken(tokenMatch[1]);
      uid = typeof decoded?.uid === "string" ? decoded.uid : "";
    } catch {
      return sendError(res, 401, "Authentication failed.");
    }
    if (!uid || uid.length > 128 || uid.includes("/")) {
      return sendError(res, 401, "Authentication failed.");
    }

    try {
      await rateLimit(adminClient, "uid:" + uid, "aeo-result-read", 30);
    } catch (error) {
      if (error?.status === 429) {
        const retryAfter = Math.max(1, Math.min(3600, Number(error.retryAfter) || 60));
        return sendError(res, 429, "AEO result request limit reached. Please retry later.", retryAfter);
      }
      return sendError(res, 503, "AEO request protection is temporarily unavailable.");
    }

    let snapshot;
    try {
      const database = adminClient.firestore();
      snapshot = await database.collection("aeo_results").doc(resultId).get();
    } catch {
      return sendError(res, 503, "AEO evidence storage is temporarily unavailable.");
    }

    // Return the same not-found response for unknown IDs and records owned by
    // another tenant, so callers cannot use this endpoint to enumerate IDs.
    if (!snapshot?.exists) return sendError(res, 404, "AEO result not found.");

    const record = snapshot.data();
    if (!isPlainObject(record) || record.userId !== uid) {
      return sendError(res, 404, "AEO result not found.");
    }

    const data = normalizeStoredResult(record, resultId);
    if (!data) return sendError(res, 503, "AEO result data is temporarily unavailable.");

    return res.status(200).json({ success: true, data });
  };
}

export default createAeoResultsHandler();
