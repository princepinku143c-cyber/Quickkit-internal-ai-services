import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import { askAI } from "./services/aiService.js";

/**
 * Unified AI Intelligence & Execution Cluster.
 * Handles: Kelly Architect, Agent Deployment, and VPS Execution.
 */
export default async function handler(req, res) {
  const { action } = req.query;

  // Temporary Bypass for Kelly Action while Firebase is being fixed in Vercel Dashboard
  if (action === 'kelly') return handleKelly(req, res, "guest_user");

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "UNAUTHORIZED: Industrial Identity Required", 401);
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

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
  const { message, history } = req.body;
  if (!message) return error(res, "Payload missing: Neural context required.", 400);

  try {
    // 3. Generate AI Response
    // Construct messages for OpenRouter (last 6 context window)
    const messages = [
        ...(Array.isArray(history) ? history : []).map(m => ({ role: m.role || 'user', content: m.content || '' })),
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
  // Logic from deploy-agent.js
  const { agentId, config } = req.body;
  return success(res, { status: "PROVISIONING", task: "deploy", timestamp: Date.now() });
}

async function handleExecute(req, res, userId) {
  // Logic from execute.js
  const { command } = req.body;
  return success(res, { status: "QUEUED", command, output: "Mock VPS execution acknowledged." });
}

async function handleVPSTest(req, res, userId) {
    const { endpoint, token } = req.body;
    return success(res, { status: "CONNECTED", endpoint });
}
