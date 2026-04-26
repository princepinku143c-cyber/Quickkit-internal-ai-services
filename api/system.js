import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import nodemailer from "nodemailer";
import { saveLead } from "./services/leadService.js";

/**
 * Unified System Utility Cluster.
 * Handles: Email, Leads, Promo, Logs, and Workflows.
 */
export default async function handler(req, res) {
  const { action } = req.query;

  // Lead transmission needs to be public for now or handles its own auth
  if (action === 'lead') return handleLead(req, res);

  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "Missing Authorization", 401);

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
    console.error("SYSTEM_ENGINE_CRASH:", err);
    return error(res, err.message);
  }
}

async function handleLead(req, res) {
  try {
    await saveLead(req.body);
    return success(res, { status: "CAPTURED" });
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function handleEmail(req, res, userId) {
  const { to, subject, html } = req.body;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({ from: `"QuickKit AI" <${process.env.EMAIL_USER}>`, to, subject, html });
  return success(res, { sent: true });
}

async function handlePromo(req, res, userId) {
  const { code } = req.query;
  // Mock promo validation
  return success(res, { valid: true, discount: 0.1 });
}

async function handleLogs(res, userId) {
  const snapshot = await admin.firestore().collection('logs').where('userId', '==', userId).limit(20).get();
  return success(res, snapshot.docs.map(doc => doc.data()));
}

async function handleWorkflows(res, userId) {
  const snapshot = await admin.firestore().collection('workflows').where('userId', '==', userId).get();
  return success(res, snapshot.docs.map(doc => doc.data()));
}

async function handleTrigger(req, res, userId) {
  const { projectId, payload } = req.body;
  // Trigger automation via external webhooks or VPS
  return success(res, { status: "TRIGGERED", projectId });
}
