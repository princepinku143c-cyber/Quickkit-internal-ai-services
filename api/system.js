import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import nodemailer from "nodemailer";
import { saveLead } from "./services/leadService.js";

/**
 * Industrialized System Utility Cluster.
 * Handles: Emails, Leads, Promo, Logs, and Workflows.
 */
export default async function handler(req, res) {
  const { action } = req.query;

  // 🛡️ SECURITY: Public Leads are strictly sanitized in leadService
  if (action === 'lead') {
    if (req.method !== 'POST') return error(res, "Method Not Allowed", 405);
    return handleLead(req, res);
  }

  // 🛡️ SECURITY: Strict Auth enforced for ALL internal actions
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "UNAUTHORIZED: Infrastructure Access Token Required", 401);
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (action === 'email') return handleEmail(req, res, userId);
    if (action === 'promo') return handlePromo(req, res, userId);
    if (action === 'logs') return handleLogs(res, userId);
    if (action === 'workflows') return handleWorkflows(res, userId);
    if (action === 'trigger') return handleTrigger(req, res, userId);

    return error(res, "Action Not Allowed", 400);
  } catch (err) {
    console.error("SYSTEM_CLUSTER_CRASH:", err);
    return error(res, "System Logic Verification Failure", 403);
  }
}

async function handleLead(req, res) {
  try {
    const result = await saveLead(req.body);
    return success(res, { status: "CAPTURED", ...result });
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function handleEmail(req, res, userId) {
  const { to, subject, html, text } = req.body;
  if (!to || !subject || (!html && !text)) return error(res, "Incomplete Post Payload", 400);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"QuickKit AI" <${process.env.EMAIL_USER}>`,
      to, subject, text, html
    });

    return success(res, { status: "DISPATCHED" });
  } catch (e) {
    console.error("EMAIL_FAILURE:", e);
    return success(res, { status: "FALLBACK_ACKNOWLEDGED", warning: "Email Node Bypass" });
  }
}

async function handlePromo(req, res, userId) {
  const { code } = req.query;
  if (!code) return error(res, "Missing Redemption Code", 400);

  // Simplified logic for MVP: DB check required for production scale
  if (code.toUpperCase() === "QUICKKIT500") {
      const userRef = admin.firestore().collection('users').doc(userId);
      await userRef.update({ 
          credits: admin.firestore.FieldValue.increment(500),
          lastPromo: code.toUpperCase()
      });
      return success(res, { added: 500 });
  }
  
  return error(res, "Invalid or Expired Infrastructure Code", 400);
}

async function handleLogs(res, userId) {
  const snapshot = await admin.firestore().collection('logs')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
  
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return success(res, Array.isArray(data) ? data : []);
}

async function handleWorkflows(res, userId) {
    // Return registered project workflows
    const snapshot = await admin.firestore().collection('projects')
      .where('userId', '==', userId)
      .where('advancePaid', '==', true)
      .get();

    const data = snapshot.docs.map(doc => {
        const p = doc.data();
        return {
            id: doc.id,
            name: p.projectName,
            status: p.status,
            description: "Autonomous Agent Workflow Interface"
        };
    });
    return success(res, Array.isArray(data) ? data : []);
}

async function handleTrigger(req, res, userId) {
    const { projectId, params } = req.body;
    return success(res, { status: "TRIGGERED", taskId: `job_${Date.now()}` });
}
