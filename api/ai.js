import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import { askAI } from "./services/aiService.js";

/**
 * Unified AI Intelligence & Execution Cluster.
 * Handles: Kelly Architect, Agent Deployment, and VPS Execution.
 */
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "Missing Authorization", 401);

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { action } = req.query;

    if (action === 'kelly') return handleKelly(req, res, userId);
    if (action === 'deploy') return handleDeploy(req, res, userId);
    if (action === 'execute') return handleExecute(req, res, userId);
    if (action === 'vps-test') return handleVPSTest(req, res, userId);

    return error(res, "Action Not Allowed", 400);
  } catch (err) {
    console.error("AI_ENGINE_CRASH:", err);
    return error(res, err.message);
  }
}

async function handleKelly(req, res, userId) {
  const { messages } = req.body;
  if (!messages) throw new Error("Payload missing: Neural context required.");

  await checkRateLimit(admin, userId, "kelly_api", 10);

  try {
    const reply = await askAI(messages);
    return success(res, { reply });
  } catch (e) {
    return error(res, e.message, e.message.includes("timeout") ? 504 : 500);
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
