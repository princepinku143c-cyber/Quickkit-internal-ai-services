import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import { getClientIp, isPlainObject, safeText } from "./_lib/input.js";
import { askAI } from "./services/aiService.js";

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
      const idToken = authHeader.split('Bearer ')[1];
      decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    }

    if (action === 'kelly') return handleKelly(req, res, userId);

    if (!userId) {
      return error(res, "UNAUTHORIZED: Identity Verification Required for Industrial Nodes.", 401);
    }

    if (action === 'deploy') return handleDeploy(req, res, userId);
    if (action === 'execute') return handleExecute(req, res, userId);
    if (action === 'vps-test') return handleVPSTest(req, res, userId);

    return error(res, "Action Not Allowed", 400);
  } catch (err) {
    console.error("AI_CLUSTER_CRASH:", err);
    return error(res, "Identity Verification Failure", 403);
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
    console.error("KELLY_ERROR:", e);
    return error(res, e.message, e.status || 500);
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
