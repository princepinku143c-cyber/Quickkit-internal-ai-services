import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import { getClientIp, isPlainObject, safeText } from "./_lib/input.js";
import { askAI } from "../services/aiService.js";

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

/**
 * Unified AI Intelligence & Execution Cluster.
 * Handles: Kelly Architect, Agent Deployment, and VPS Execution.
 */
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return error(res, "Method Not Allowed", 405);
  }

  if (req.body !== undefined && !isPlainObject(req.body)) {
    return error(res, "Invalid request payload", 400);
  }
  const { action } = req.query;

  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    let decodedToken = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.slice("Bearer ".length);
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
        userId = decodedToken.uid;
      } catch (authError) {
        if (INVALID_ID_TOKEN_CODES.has(authError?.code)) {
          console.warn("AI_CLUSTER_AUTH_FAILED");
          return error(res, "Authentication failed.", 401);
        }
        // Missing or unavailable Firebase Admin configuration is a service failure,
        // not proof that the caller supplied an invalid token.
        console.error("AI_CLUSTER_AUTH_UNAVAILABLE");
        return error(res, "Authentication service is temporarily unavailable.", 503);
      }
    }

    if (action === 'kelly') return handleKelly(req, res, userId);

    if (!userId) {
      return error(res, "UNAUTHORIZED: Identity Verification Required for Industrial Nodes.", 401);
    }

    if (action === 'deploy') return handleDeploy(req, res, userId);
    if (action === 'execute') return handleExecute(req, res, userId);
    if (action === 'vps-test') return handleVPSTest(req, res, userId);

    return error(res, "Action Not Allowed", 400);
  } catch {
    // Unexpected routing failures are service errors; never expose internal diagnostics.
    console.error("AI_CLUSTER_UNAVAILABLE");
    return error(res, "AI service is temporarily unavailable.", 503);
  }
}

async function handleKelly(req, res, userId) {
  const body = req.body || {};
  const rawMessage = body.message;
  if (typeof rawMessage !== "string" || !rawMessage.trim()) {
    return error(res, "Payload missing: a text message is required.", 400);
  }
  if (rawMessage.length > 5000) return error(res, "Message is too long (maximum 5000 characters).", 413);
  const message = safeText(rawMessage, 5000);
  const history = Array.isArray(body.history)
    ? body.history
        .filter((item) => isPlainObject(item) && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-5)
        .map((item) => ({ role: item.role, content: safeText(item.content, 2000) }))
        .filter((item) => item.content)
    : [];

  try {
    const rateKey = userId ? "uid:" + userId : "guest:" + getClientIp(req);
    await checkRateLimit(admin, rateKey, "kelly", userId ? 30 : 5);

    if (userId) {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userSnap = await userRef.get();

      let credits = 0;
      if (!userSnap.exists) {
        credits = 500;
        await userRef.set({ credits, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        credits = userSnap.data().credits || 0;
      }

      if (credits < 10) {
        return error(res, "INSUFFICIENT_CREDITS: Neural power depleted. Please upgrade your node.", 403);
      }

      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-10),
        lastUsed: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const messages = [
      ...history,
      { role: 'user', content: message }
    ].slice(-6);

    const reply = await askAI(messages);
    return success(res, { reply });
  } catch (e) {
    const status = e?.status === 429 ? 429 : e?.status === 503 ? 503 : 500;
    if (status === 429 && Number.isFinite(e?.retryAfter)) {
      res.setHeader("Retry-After", String(e.retryAfter));
    }
    const message = status === 429
      ? "Rate limit exceeded. Please try again shortly."
      : status === 503
        ? "AI service is temporarily unavailable."
        : "Unable to process your request right now.";
    // Keep diagnostics out of API responses and logs; retain only the safe status.
    console.error("KELLY_ERROR", { status });
    return error(res, message, status);
  }
}

async function handleDeploy(req, res, userId) {
  return error(res, "Agent deployment backend is not configured. No deployment was started.", 501);
}

async function handleExecute(req, res, userId) {
  return error(res, "Command execution backend is not configured. No command was executed.", 501);
}

async function handleVPSTest(req, res, userId) {
  return error(res, "VPS connectivity adapter is not configured. No connection was verified.", 501);
}
