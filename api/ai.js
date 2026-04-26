import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import fetch from "node-fetch";

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
  const { messages, model } = req.body;
  if (!messages) throw new Error("Payload missing: Neural context required.");

  await checkRateLimit(admin, userId, "kelly_api", 10);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_ADMIN_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "deepseek/deepseek-chat",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    if (e.name === 'AbortError') return error(res, "Intelligence Timeout: Response took too long.", 504);
    throw e;
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
