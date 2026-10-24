import admin, { db } from "./_lib/firebaseAdmin.js";
import { timingSafeEqual } from "node:crypto";
import { checkRateLimit } from "./_lib/security.js";
import { getClientIp, isPlainObject, payloadTooLarge, safeMetadata, safeNumber, safeText } from "./_lib/input.js";
import { success, error } from "./_lib/response.js";
import { askAI } from "./services/aiService.js";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return error(res, "Method Not Allowed: Webhook requires POST requests.", 405);
  }

  // Parse client_id or uid to match query formats
  const targetUid = safeText(req.query.client_id || req.query.uid, 128);
  if (!targetUid) {
    return error(res, "Bad Request: Missing client_id/uid verification parameter.", 400);
  }
  const data = req.body;
  if (!isPlainObject(data)) return error(res, "Invalid webhook payload.", 400);
  if (payloadTooLarge(data)) return error(res, "Webhook payload is too large.", 413);

  try {
    if (!db) {
      return error(res, "Database Offline: Firestore admin instance is unavailable.", 503);
    }
    const userSnap = await db.collection("users").doc(String(targetUid)).get();
    const expectedSecret = userSnap.exists ? userSnap.data()?.webhookSecret : null;
    const suppliedSecret = req.headers["x-webhook-secret"];
    if (typeof expectedSecret !== "string" || !expectedSecret || typeof suppliedSecret !== "string" || !suppliedSecret) {
      return error(res, "Unauthorized: a valid X-Webhook-Secret is required.", 401);
    }
    const expectedBytes = Buffer.from(expectedSecret, "utf8");
    const suppliedBytes = Buffer.from(suppliedSecret, "utf8");
    if (expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) {
      return error(res, "Unauthorized: a valid X-Webhook-Secret is required.", 401);
    }
    await checkRateLimit(admin, String(targetUid) + ":" + getClientIp(req), "webhook", 10);
    const leadRef = db.collection('leads').doc();
    const projectRef = db.collection('projects').doc();

    const budgetVal = safeNumber(data.budget) || safeNumber(data.price) || 0;

    // Keep only bounded scalar metadata; never mutate an untrusted nested value.
    const standardKeys = ['name', 'email', 'phone', 'businessName', 'company', 'projectName', 'price', 'budget', 'requirement', 'notes', 'custom_metadata'];
    const extraMetadata = {};
    for (const [key, value] of Object.entries(data)) {
      if (!standardKeys.includes(key) && ['string', 'number', 'boolean'].includes(typeof value)) extraMetadata[key] = value;
    }
    const custom_metadata = safeMetadata({
      ...(isPlainObject(data.custom_metadata) ? data.custom_metadata : {}),
      ...extraMetadata
    });
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

    // Save lead record
    await leadRef.set(leadData);

    // Asynchronously call the askAI service to draft a welcome email
    const leadId = leadRef.id;
    const leadName = leadData.name || 'Webhook Inbound Lead';
    const projectName = leadData.projectName || 'External Webhook Sync';
    (async () => {
      try {
        const prompt = `Write a short, highly professional 3-sentence welcome email for a new lead named ${leadName} inquiring about ${projectName}. Offer to schedule a quick call.`;
        const draft = await askAI([{ role: "user", content: prompt }]);
        await db.collection('leads').doc(leadId).update({
          aiDraftReply: draft
        });
        console.log(`🤖 AI Draft successfully generated for webhook lead ${leadId}`);
      } catch (err) {
        console.error(`❌ Failed to generate AI draft for webhook lead ${leadId}:`, err);
      }
    })();

    // Save project node
    await projectRef.set({
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
    });

    // Odoo CRM Integration (Fault tolerant tunnel matching system.js)
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
      console.error("❌ Webhook Odoo Sync failure:", odooErr);
    }

    return success(res, { status: "LEAD_INGESTED", leadId: leadRef.id, projectId: projectRef.id });
  } catch (e) {
    if (e?.status === 429) {
      if (e.retryAfter) res.setHeader('Retry-After', String(e.retryAfter));
      return error(res, 'Too many webhook requests. Please retry shortly.', 429);
    }
    if (e?.status === 503) return error(res, 'Webhook service is temporarily unavailable.', 503);
    console.error('WEBHOOK_ERROR:', e);
    return error(res, 'Webhook processing failed. Please retry later.', 500);
  }
}
