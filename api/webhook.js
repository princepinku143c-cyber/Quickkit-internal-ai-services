import admin, { db } from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { askAI } from "./services/aiService.js";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return error(res, "Method Not Allowed: Webhook requires POST requests.", 450);
  }

  // Parse client_id or uid to match query formats
  const targetUid = req.query.client_id || req.query.uid;
  if (!targetUid) {
    return error(res, "Bad Request: Missing client_id/uid verification parameter.", 400);
  }

  const data = req.body || {};

  try {
    if (!db) {
      return error(res, "Database Offline: Firestore admin instance is unavailable.", 500);
    }

    const leadRef = db.collection('leads').doc();
    const projectRef = db.collection('projects').doc();

    const budgetVal = Number(data.budget) || Number(data.price) || 0;

    // Bundle custom metadata fields (excluding standard keys)
    const standardKeys = ['name', 'email', 'phone', 'businessName', 'company', 'projectName', 'price', 'budget', 'requirement', 'notes'];
    const custom_metadata = data.custom_metadata || {};
    
    Object.entries(data).forEach(([key, val]) => {
      if (!standardKeys.includes(key) && typeof val !== 'object') {
        custom_metadata[key] = val;
      }
    });

    const leadData = {
      name: data.name || 'Webhook Inbound Lead',
      email: data.email || '',
      phone: data.phone || '',
      businessName: data.businessName || data.company || 'Unknown Company',
      projectName: data.projectName || 'External Webhook Sync',
      price: budgetVal,
      budget: budgetVal,
      requirement: data.requirement || data.notes || 'Lead ingested automatically via universal API webhook.',
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
    return error(res, e.message, 500);
  }
}
