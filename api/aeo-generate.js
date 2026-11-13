import admin from "./_lib/firebaseAdmin.js";
import { checkRateLimit } from "./_lib/security.js";
import { isPlainObject, payloadTooLarge, safeText } from "./_lib/input.js";
import { generateAeoQaPairs } from "../services/opencodeService.js";

const sendError = (res, status, message, code) =>
  res.status(status).json({ success: false, error: message, ...(code ? { code } : {}) });

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
  if (!isPlainObject(req.body) || payloadTooLarge(req.body, 8 * 1024)) {
    return sendError(res, 400, "Invalid or oversized request payload.");
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
      console.warn("AEO_AUTH_FAILED");
      return sendError(res, 401, "Authentication failed.");
    }
    console.error("AEO_AUTH_UNAVAILABLE");
    return sendError(res, 503, "Authentication service is temporarily unavailable.");
  }

  let userData;
  try {
    const userSnapshot = await admin.firestore().collection("users").doc(decoded.uid).get();
    userData = userSnapshot.data() || {};
  } catch {
    console.error("AEO_PROFILE_LOOKUP_FAILED");
    return sendError(res, 503, "Authorization service is temporarily unavailable.");
  }
  if (userData.role !== "admin") {
    return sendError(res, 403, "Administrator access is required.");
  }

  try {
    await checkRateLimit(admin, decoded.uid, "aeo-generate", 3);
  } catch (error) {
    if (error && error.status === 429) {
      if (error.retryAfter) res.setHeader("Retry-After", String(error.retryAfter));
      return sendError(res, 429, "AEO generation rate limit reached. Please retry later.");
    }
    console.error("AEO_RATE_LIMIT_UNAVAILABLE");
    return sendError(res, 503, "AEO generation is temporarily unavailable.");
  }

  const keyword = safeText(req.body.keyword, 180);
  const context = safeText(req.body.context, 1200);
  const count = Number(req.body.count === undefined ? 5 : req.body.count);
  if (!keyword || !Number.isInteger(count) || count < 1 || count > 10) {
    return sendError(res, 400, "Provide a keyword and a count from 1 to 10.");
  }

  let generated;
  try {
    generated = await generateAeoQaPairs({ keyword, count, context });
  } catch (error) {
    if (error && error.status === 429) {
      if (error.retryAfter) res.setHeader("Retry-After", String(error.retryAfter));
      return sendError(res, 429, "AEO generation rate limit reached. Please retry later.");
    }
    if (error && error.status === 503 && error.code === "OPENCODE_API_KEY_MISSING") {
      return sendError(res, 503, error.message, error.code);
    }
    console.error("AEO_PROVIDER_FAILED");
    return sendError(res, 502, "AEO generation failed. No draft was published.");
  }

  const record = {
    userId: decoded.uid,
    keyword,
    context,
    model: generated.model,
    provider: "OpenCode Zen",
    items: generated.items,
    itemCount: generated.items.length,
    status: "draft",
    reviewRequired: true,
    createdAt: new Date().toISOString()
  };
  try {
    const saved = await admin.firestore().collection("aeo_generations").add(record);
    return res.status(200).json({ success: true, data: { id: saved.id, ...record } });
  } catch {
    console.error("AEO_DRAFT_SAVE_FAILED");
    return sendError(res, 503, "AEO draft could not be saved. Please retry.");
  }
}
