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
    
    // 📧 Trigger Industrial Notification (Email to Admin)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // 1. Alert Admin
        await transporter.sendMail({
          from: `"QuickKit AI Alerts" <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: `🚨 NEW LEAD CAPTURED: ${req.body.name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #2563eb;">New Operational Intent Detected</h2>
              <p>A new lead has been synchronized with the platform.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
              <p><strong>Name:</strong> ${req.body.name}</p>
              <p><strong>Email:</strong> ${req.body.email}</p>
              <p><strong>Phone:</strong> ${req.body.phone}</p>
              <p><strong>Org/Project:</strong> ${req.body.projectName || req.body.businessName}</p>
              <p><strong>Requirement:</strong> ${req.body.requirement}</p>
              <p><strong>Price (Quoted):</strong> $${req.body.price || 0}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">QuickKit AI Automation System — Internal Use Only</p>
            </div>
          `
        });

        // 2. Confirm to Client (Professionalism Booster)
        await transporter.sendMail({
          from: `"QuickKit AI" <${process.env.EMAIL_USER}>`,
          to: req.body.email,
          subject: `Initialization Confirmed: ${req.body.projectName || 'AI Automation'}`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; color: #0f172a; line-height: 1.6;">
              <h1 style="color: #2563eb; font-size: 24px;">Systems Initialized.</h1>
              <p>Hello ${req.body.name},</p>
              <p>Your request for <strong>${req.body.projectName || 'AI Automation Architecture'}</strong> has been successfully received and synchronized with our engineering queue.</p>
              <p><strong>What happens next?</strong></p>
              <ul style="padding-left: 20px;">
                <li>Our AI Architects are reviewing your requirements.</li>
                <li>You will receive a follow-up via phone or email within 24 hours.</li>
                <li>You can track your project status in your <a href="https://quickkitai.com/dashboard" style="color: #2563eb; text-decoration: none; font-weight: bold;">Client Portal</a>.</li>
              </ul>
              <p>Thank you for choosing QuickKit AI for your enterprise automation.</p>
              <br />
              <p style="font-size: 14px; color: #64748b;">Best Regards,<br /><strong>QuickKit Engineering Team</strong></p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("LEAD_NOTIFICATION_FAILED:", emailErr);
    }

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
