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

  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    let decodedToken = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split('Bearer ')[1];
      decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    }

    // --- Action Routing ---
    
    // 1. PUBLIC ACTIONS
    if (action === 'kelly') return handleKelly(req, res, userId);

    // 2. PROTECTED ACTIONS (Requires Auth)
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
  const { message, history } = req.body;
  if (!message) return error(res, "Payload missing: Neural context required.", 400);

  try {
    // 1. Credit / Access Check
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

        // Deduct Credits
        await userRef.update({ 
            credits: admin.firestore.FieldValue.increment(-10),
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });
    } else {
        // GUEST MODE: Basic Rate Limiting Check (Optional: Add IP-based limiting here)
        console.log("GUEST_ACCESS: Initializing Neural Consultation for Anonymous Node.");
    }

    // 2. Generate AI Response
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
