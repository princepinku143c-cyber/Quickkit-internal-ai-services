import admin, { db } from "./_lib/firebaseAdmin.js";
import { logSafeError } from "./_lib/safeErrorLog.js";
import { constantTimeSecretEqual } from "./_lib/constantTimeSecret.js";
import { checkRateLimit } from "./_lib/security.js";
import { getOrCreateWebhookSubmission } from "./_lib/leadIdempotency.js";
import { getClientIp, isPlainObject, normalizeFirestoreDocumentId, payloadTooLarge, safeMetadata, safeNumber, safeText } from "./_lib/input.js";
import { success, error } from "./_lib/response.js";
import { askAI } from "./_lib/services/aiService.js";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret, Idempotency-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return error(res, "Method Not Allowed: Webhook requires POST requests.", 405);
  }

  // Parse client_id or uid to match query formats
  const targetUid = normalizeFirestoreDocumentId(req.query.client_id || req.query.uid, 128);
  if (!targetUid) {
    return error(res, "Bad Request: Invalid client_id/uid verification parameter.", 400);
  }
  const data = req.body;
  if (!isPlainObject(data)) return error(res, "Invalid webhook payload.", 400);
  if (payloadTooLarge(data)) return error(res, "Webhook payload is too large.", 413);
  const rawIdempotencyKey = req.headers?.["idempotency-key"] ?? data.idempotencyKey;
  const idempotencyKey = typeof rawIdempotencyKey === "string" ? rawIdempotencyKey.trim() : "";
  if (rawIdempotencyKey !== undefined && rawIdempotencyKey !== null
    && !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
    return error(res, "Invalid Idempotency-Key. Use 16–128 letters, numbers, underscores or hyphens.", 400);
  }

  try {
    if (!db) {
      return error(res, "Database Offline: Firestore admin instance is unavailable.", 503);
    }
    // Rate-limit by source IP before checking the shared secret so invalid guesses are counted.
    await checkRateLimit(admin, getClientIp(req), "webhook-auth", 30);
    const userSnap = await db.collection("users").doc(String(targetUid)).get();
    const expectedSecret = userSnap.exists ? userSnap.data()?.webhookSecret : null;
    const suppliedSecret = req.headers["x-webhook-secret"];
    if (!constantTimeSecretEqual(expectedSecret, suppliedSecret)) {
      return error(res, "Unauthorized: a valid X-Webhook-Secret is required.", 401);
    }
    await checkRateLimit(admin, String(targetUid) + ":" + getClientIp(req), "webhook", 10);
    const leadData = {
      name: safeText(data.name, 120) || 'Webhook Inbound Lead',
      email: safeText(data.email, 254),
      phone: safeText(data.phone, 48),
      businessName: safeText(data.businessName || data.company, 160) || 'Unknown Company',
      projectName: safeText(data.projectName, 180) || 'External Webhook Sync',
      price: budgetVal,
      budget: budgetVal,
      requirement: safeText(data.requirement || data.notes, 3000) || 'Lead ingested automatically via universal API webhook.',
      userId: targetUid,
      status: 'NEW',
      custom_metadata,
      createdAt: new Date().toISOString()
    };
    const projectData = {
      userId: targetUid,
      clientEmail: leadData.email,
      clientName: leadData.name,
      projectName: leadData.projectName,
      businessName: leadData.businessName,
      status: 'pending',
      progress: 0,
      price: leadData.price,
      advancePaid: false,
      createdAt: new Date().toISOString()
    };

    let leadRef;
    let projectRef;
    let lead;
    let created = true;

    if (idempotencyKey) {
      const submission = await getOrCreateWebhookSubmission(
        db,
        targetUid,
        idempotencyKey,
        leadData,
        projectData
      );
      leadRef = submission.leadRef;
      projectRef = submission.projectRef;
      lead = submission.lead;
      created = submission.created;
    } else {
      // Preserve legacy clients while making the lead/project writes atomic.
      leadRef = db.collection("leads").doc();
      projectRef = db.collection("projects").doc();
      lead = { ...leadData, id: leadRef.id, projectId: projectRef.id };
      await db.runTransaction(async (transaction) => {
        transaction.create(leadRef, lead);
        transaction.create(projectRef, { ...projectData, leadId: leadRef.id });
      });
    }

    // Only the first accepted delivery starts side effects. Replays return the
    // original IDs without sending duplicate AI drafts or duplicate CRM records.
    if (created) {
      const leadId = leadRef.id;
      const leadName = lead.name || 'Webhook Inbound Lead';
      const projectName = lead.projectName || 'External Webhook Sync';
      (async () => {
        try {
          const prompt = `Write a short, highly professional 3-sentence welcome email for a new lead named ${leadName} inquiring about ${projectName}. Offer to schedule a quick call.`;
          const draft = await askAI([{ role: "user", content: prompt }]);
          await db.collection('leads').doc(leadId).update({
            aiDraftReply: draft
          });
          console.log(`🤖 AI Draft successfully generated for webhook lead ${leadId}`);
        } catch (err) {
          logSafeError("WEBHOOK_AI_DRAFT_FAILED", err);
        }
      })();
    }

    // Odoo CRM Integration (Fault tolerant tunnel matching system.js)
    if (created) {
    try {
      const odooUrl = process.env.ODOO_URL;
      const odooDb = process.env.ODOO_DB;
      const odooUsername = process.env.ODOO_USERNAME;
      const odooApiKey = process.env.ODOO_API_KEY;

      if (odooUrl && odooDb && odooUsername && odooApiKey) {
        // Authenticate
        const authResponse = await fetch(`${odooUrl}/jsonrpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
              service: "common",
              method: "login",
              args: [odooDb, odooUsername, odooApiKey]
            },
            id: Date.now()
          })
        });
        
        const authData = await authResponse.json();
        const odooUid = authData.result;
        
        if (odooUid) {
          // Fetch user industry type for tagging
          let clientNiche = "Unknown";
          const userSnap = await db.collection('users').doc(targetUid).get();
          if (userSnap.exists) {
            clientNiche = userSnap.data().industryType || "Unknown";
          }

          const formattedMetadataStr = Object.entries(custom_metadata)
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');

          const leadDescription = `Project: ${leadData.projectName}\nRequirements: ${leadData.requirement}\n\n--- CRM Mappings ---\nClient_ID: ${targetUid}\nNiche: ${clientNiche}\n\n--- CUSTOM METADATA ---\n${formattedMetadataStr || 'None'}`;
          
          await fetch(`${odooUrl}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "call",
              params: {
                service: "object",
                method: "execute_kw",
                args: [
                  odooDb,
                  odooUid,
                  odooApiKey,
                  "crm.lead",
                  "create",
                  [{
                    name: `${leadData.name} - ${leadData.projectName}`,
                    contact_name: leadData.name,
                    email_from: leadData.email,
                    phone: leadData.phone,
                    description: leadDescription
                  }]
                ]
              },
              id: Date.now() + 1
            })
          });
          console.log("✅ Lead successfully synced to Odoo CRM via webhook.");
        } else {
          console.error("❌ Odoo Webhook Authentication failed.");
        }
      }
    } catch (odooErr) {
      logSafeError("WEBHOOK_ODOO_SYNC_FAILED", odooErr);
    }
    }

    return success(res, {
      status: created ? "LEAD_INGESTED" : "LEAD_ALREADY_RECEIVED",
      leadId: leadRef.id,
      projectId: projectRef.id,
    });
  } catch (e) {
    if (e?.status === 429) {
      if (e.retryAfter) res.setHeader('Retry-After', String(e.retryAfter));
      return error(res, 'Too many webhook requests. Please retry shortly.', 429);
    }
    if (e?.status === 503) return error(res, 'Webhook service is temporarily unavailable.', 503);
    logSafeError("WEBHOOK_PROCESSING_FAILED", e);
    return error(res, 'Webhook processing failed. Please retry later.', 500);
  }
}
