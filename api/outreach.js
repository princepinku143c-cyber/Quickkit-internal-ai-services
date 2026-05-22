import admin from "./_lib/firebaseAdmin.js";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

// CORS Headers Configuration
const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
};

const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  try {
    if (action === "analyze") return handleAnalyze(req, res);
    if (action === "approve") return handleApprove(req, res);
    if (action === "reject") return handleReject(req, res);
    if (action === "add-lead") return handleAddLead(req, res);
    if (action === "process-queue") return handleProcessQueue(req, res);
    if (action === "telegram-webhook") return handleTelegramWebhook(req, res);

    return error(res, "Invalid Action", 400);
  } catch (err) {
    console.error("OUTREACH_CRASH:", err);
    return error(res, err.message, 500);
  }
}

// Helper: Load Outreach settings/pricing configurations
async function loadOutreachConfig() {
  try {
    const configSnap = await admin.firestore().collection("settings").doc("outreach_config").get();
    if (configSnap.exists) {
      return configSnap.data();
    }
  } catch (err) {
    console.error("Error loading outreach config:", err.message);
  }
  return null;
}

// Helper: Deep merge pricing configs
function mergePricing(current, updates) {
  const merged = { ...current };
  for (const region in updates) {
    merged[region] = { ...merged[region] };
    for (const tier in updates[region]) {
      merged[region][tier] = {
        ...merged[region][tier],
        ...updates[region][tier]
      };
    }
  }
  return merged;
}

// Helper: Send message to Telegram chat
async function sendTelegramMessage(token, chatId, text) {
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}

// 1. Analyze Prospect, generate pain points and email draft, push to Telegram
async function handleAnalyze(req, res) {
  const { businessName, websiteUrl, email, phone, location, nicheNotes } = req.body;

  if (!businessName || !email || !location) {
    return error(res, "Business Name, Email, and Location (India/Abroad) are required.", 400);
  }

  try {
    const isIndia = location.toLowerCase() === "india";
    const dbEntry = {
      businessName,
      websiteUrl: websiteUrl || "",
      email,
      phone: phone || "",
      location,
      isIndia,
      status: "ANALYZING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      nicheNotes: nicheNotes || "",
    };

    // Save lead to outreach sub-collection
    const docRef = await admin.firestore().collection("leads_outreach").add(dbEntry);
    const leadId = docRef.id;

    // Fetch custom config and process analysis
    const customConfig = await loadOutreachConfig();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
    const chatId = chatDoc.exists ? chatDoc.data().chatId : process.env.TELEGRAM_CHAT_ID;

    const analysis = await analyzeAndDraftLead(leadId, dbEntry, botToken, chatId, customConfig);

    return success(res, { leadId, status: "PENDING_APPROVAL", analysis });
  } catch (err) {
    console.error("ANALYZE_ERROR:", err);
    return error(res, err.message, 500);
  }
}

// Core helper: Analyzes lead niche/URL with DeepSeek, builds proposal, registers to Firestore, notifies Telegram
async function analyzeAndDraftLead(leadId, leadData, botToken, chatId, customConfig) {
  const { businessName, websiteUrl, email, phone, location, nicheNotes } = leadData;
  const isIndia = location.toLowerCase() === "india";
  const pricing = getPricingDetails(isIndia, customConfig);

  const deepseekApiKey = process.env.NEURAL_NODE_KEY;
  const deepseekEndpoint = process.env.NEURAL_NODE_ENDPOINT || "https://api.deepseek.com/chat/completions";
  let deepseekModel = process.env.NEURAL_NODE_ENGINE || "deepseek-chat";

  if (!deepseekApiKey) {
    throw new Error("Missing DeepSeek API credentials.");
  }

  if (deepseekModel === "deepseek-v4-flash" || (deepseekModel.includes("flash") && deepseekEndpoint.includes("deepseek.com"))) {
    deepseekModel = "deepseek-chat";
  }

  const systemPrompt = `You are a cold outreach automation agent for QuickKit AI.
We analyze prospect websites/niches and design cold email proposals with custom AI Agents & AI Employees.
You must return a raw JSON object (and nothing else) containing:
1. "niche": Short niche category (e.g., Travel Agency, E-commerce, Real Estate).
2. "customPainPoint": An object representing a 3rd specific operational pain point for this business type.
   - "title": Niche pain point title (e.g., "Custom Itinerary Building" or "24/7 Order Tracking").
   - "before": What happens before AI (Hinglish for India leads, English for Abroad leads).
   - "after": How QuickKit AI agents fix it (Hinglish for India leads, English for Abroad leads).
   - "result": The estimated ROI or speed benefit of the fix.
3. "introSentence": A personalized hook sentence referencing their business type and name.

Language Rules:
- If location is India (isIndia = true), write the "before", "after", and "result" of the custom pain point in conversational Hinglish (Hindi written in Roman script) that matches the style of the first two pain points.
- If location is Abroad (isIndia = false), write in professional US English.

Return exactly this JSON format:
{
  "niche": "...",
  "customPainPoint": {
    "title": "...",
    "before": "...",
    "after": "...",
    "result": "..."
  },
  "introSentence": "..."
}`;

  const userMessage = `Analyze this prospect:
Business Name: ${businessName}
Website: ${websiteUrl || "N/A"}
Location: ${isIndia ? "India" : "Abroad (Global)"}
Notes: ${nicheNotes || "N/A"}
isIndia: ${isIndia}`;

  const aiRes = await fetch(deepseekEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: deepseekModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    throw new Error(`DeepSeek API connection failure: ${aiRes.status}`);
  }

  const aiData = await aiRes.json();
  const parsedAI = JSON.parse(aiData.choices[0].message.content);

  const painPoints = [
    {
      title: isIndia ? "24x7 WhatsApp Handling" : "24/7 Automated Support",
      before: isIndia
        ? "Customer raat ko message karta hai, subah tak competitor se book ho chuka hota hai."
        : "Leads inquire outside office hours and wait overnight, dropping off to competitors who reply faster.",
      after: isIndia
        ? "Raat 2 baje bhi 10 second mein professional reply. Package details, pricing, availability instantly share hoti hai."
        : "Instant professional responses 24/7 within 10 seconds via WhatsApp/Email. Sharing quotes, itineraries, and booking links dynamically.",
      result: isIndia
        ? "Result: Sirf yeh ek feature monthly bookings 20-30% badha sakta hai."
        : "Result: Captures and converts up to 25% more after-hours inquiries.",
    },
    {
      title: isIndia ? "Smart Lead Qualification" : "Automated Lead Scoring",
      before: isIndia
        ? "Staff 50 logon se baat karta hai — 45 sirf 'puch rahe the' — 5 genuine customers miss ho jaate hain."
        : "Sales team spends 80% of their time chatting with low-intent leads, leaving key customers unattended.",
      after: isIndia
        ? "AI budget, dates, group size qualify karke, hot leads staff ko instantly forward kar deta hai."
        : "AI pre-qualifies budget, preferences, and timeline, alerting your team only for high-value sales opportunities.",
      result: isIndia
        ? "Result: Staff productivity 3 guna — same team se 3x zyada bookings."
        : "Result: Decreases response time by 90% and triples lead-to-booking rates.",
    },
    {
      title: parsedAI.customPainPoint.title,
      before: parsedAI.customPainPoint.before,
      after: parsedAI.customPainPoint.after,
      result: parsedAI.customPainPoint.result,
    },
  ];

  const updateData = {
    niche: parsedAI.niche || "Business Automation",
    introSentence: parsedAI.introSentence || "",
    painPoints,
    pricing,
    status: "PENDING_APPROVAL",
    analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection("leads_outreach").doc(leadId).update(updateData);

  if (botToken && chatId) {
    const telegramText = `🚨 *New Campaign Lead Draft Generated* 🚨\n\n*Company:* ${businessName}\n*Website:* ${websiteUrl || "N/A"}\n*Location:* ${location}\n*Niche:* ${parsedAI.niche}\n\n*Dynamic Pain Point 3:* ${parsedAI.customPainPoint.title}\n• Before: ${parsedAI.customPainPoint.before}\n• After: ${parsedAI.customPainPoint.after}\n\n*Pricing Proposed:* ${pricing.starter.price}/mo + ${pricing.starter.setup} setup\n\nWould you like to approve and dispatch this cold email?`;

    const telegramButtons = {
      inline_keyboard: [
        [
          { text: "✅ Approve & Send", callback_data: `approve_${leadId}` },
          { text: "❌ Reject / Skip", callback_data: `reject_${leadId}` },
        ],
      ],
    };

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: "Markdown",
        reply_markup: telegramButtons,
      }),
    });
  }

  return { ...leadData, ...updateData };
}

// 2. Approve draft and send email
async function handleApprove(req, res) {
  const { id } = req.body;
  if (!id) return error(res, "Lead ID required", 400);

  try {
    const leadDoc = await admin.firestore().collection("leads_outreach").doc(id).get();
    if (!leadDoc.exists) return error(res, "Lead not found", 404);

    const leadData = leadDoc.data();
    if (leadData.status === "SENT") {
      return success(res, { status: "ALREADY_SENT", message: "Email has already been sent." });
    }

    // Generate custom HTML email
    const emailHtml = generateEmailHtml(leadData);

    // Send email with automatic fallback
    const result = await sendOutreachEmail(leadData, emailHtml);

    // Update database status
    await admin.firestore().collection("leads_outreach").doc(id).update({
      status: "SENT",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentVia: result.sentVia,
    });

    return success(res, { status: "SENT", leadId: id, sentVia: result.sentVia });
  } catch (err) {
    console.error("APPROVE_ERROR:", err);
    return error(res, err.message, 500);
  }
}

// 3. Reject draft
async function handleReject(req, res) {
  const { id } = req.body;
  if (!id) return error(res, "Lead ID required", 400);

  try {
    await admin.firestore().collection("leads_outreach").doc(id).update({
      status: "REJECTED",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return success(res, { status: "REJECTED", leadId: id });
  } catch (err) {
    console.error("REJECT_ERROR:", err);
    return error(res, err.message, 500);
  }
}

// 4. Add Lead to queue directly (for scraper/VPS automation)
async function handleAddLead(req, res) {
  const { businessName, websiteUrl, email, phone, location } = req.body;

  if (!businessName || !email || !location) {
    return error(res, "Business Name, Email, and Location (India/Abroad) are required.", 400);
  }

  try {
    const isIndia = location.toLowerCase() === "india";
    const dbEntry = {
      businessName,
      websiteUrl: websiteUrl || "",
      email,
      phone: phone || "",
      location,
      isIndia,
      status: "QUEUED",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection("leads_outreach").add(dbEntry);
    return success(res, { leadId: docRef.id, status: "QUEUED" });
  } catch (err) {
    console.error("ADD_LEAD_ERROR:", err);
    return error(res, err.message, 500);
  }
}

// 5. Trigger Queue Processing
async function handleProcessQueue(req, res) {
  try {
    const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
    const isPaused = chatDoc.exists ? chatDoc.data().paused === true : false;
    const chatId = chatDoc.exists ? chatDoc.data().chatId : process.env.TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (isPaused) {
      return success(res, { status: "PAUSED", message: "Outreach queue is paused." });
    }

    if (!chatId || !botToken) {
      return error(res, "Telegram bot configurations missing.", 400);
    }

    const customConfig = await loadOutreachConfig();
    const result = await processQueuedLeads(chatId, botToken, customConfig);

    if (result.processed > 0) {
      await sendTelegramMessage(botToken, chatId, `🌞 *Good Morning!* Your daily 9:00 AM outreach batch has completed:\n\n• *Processed Leads:* \`${result.processed}\` sent for approval\n• *Errors:* \`${result.errors}\``);
    }

    return success(res, { status: "SUCCESS", ...result });
  } catch (err) {
    console.error("PROCESS_QUEUE_ERROR:", err);
    return error(res, err.message, 500);
  }
}

// Helper: Fetch queued leads and analyze them in parallel
async function processQueuedLeads(chatId, botToken, customConfig) {
  let processed = 0;
  let errors = 0;

  try {
    const snapshot = await admin.firestore().collection("leads_outreach")
      .where("status", "==", "QUEUED")
      .limit(5) // Vercel Hobby Timeout mitigation
      .get();

    if (snapshot.empty) {
      return { processed: 0, errors: 0 };
    }

    const promises = snapshot.docs.map(async (doc) => {
      try {
        const leadId = doc.id;
        const leadData = doc.data();
        await analyzeAndDraftLead(leadId, leadData, botToken, chatId, customConfig);
        processed++;
      } catch (err) {
        console.error(`Error analyzing queued lead ${doc.id}:`, err);
        errors++;
      }
    });

    await Promise.all(promises);
    return { processed, errors };
  } catch (e) {
    console.error("processQueuedLeads failure:", e);
    return { processed, errors, error: e.message };
  }
}

// 6. Telegram Webhook Callback Queries & Chatbot Controller
async function handleTelegramWebhook(req, res) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const update = req.body;

  if (!update) return success(res, { ok: true });

  // Handle Text Messages (Slash commands + Conversational Controller)
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text.trim();
    const textLower = text.toLowerCase();

    // 1. Direct Webhook Slash commands
    if (textLower.startsWith("/start") || textLower === "start" || textLower === "resume" || textLower.startsWith("/resume")) {
      await admin.firestore().collection("settings").doc("telegram").set({
        chatId,
        paused: false,
        registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      await sendTelegramMessage(botToken, chatId, `▶️ *Outreach Active!*\n\nI have resumed the AI cold outreach queue. Daily at *9:00 AM IST*, queued leads will be analyzed and sent here for approval.\n\nCommands:\n- /stop: Pause queue\n- /status: Check status\n- /process: Run immediately`);
      return success(res, { ok: true });
    }

    if (textLower.startsWith("/stop") || textLower === "stop" || textLower === "pause" || textLower.startsWith("/pause")) {
      await admin.firestore().collection("settings").doc("telegram").set({
        chatId,
        paused: true,
      }, { merge: true });

      await sendTelegramMessage(botToken, chatId, `⏸️ *Outreach Paused!*\n\nI have paused the daily outreach batch. No drafts will be processed or sent here until you resume.\n\nUse /start to resume.`);
      return success(res, { ok: true });
    }

    if (textLower.startsWith("/status") || textLower === "status") {
      const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
      const isPaused = chatDoc.exists ? chatDoc.data().paused === true : false;

      const queuedCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "QUEUED").count().get();
      const queuedCount = queuedCountSnap.data().count;

      const pendingCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "PENDING_APPROVAL").count().get();
      const pendingCount = pendingCountSnap.data().count;

      const sentCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "SENT").count().get();
      const sentCount = sentCountSnap.data().count;

      await sendTelegramMessage(botToken, chatId, `📊 *Outreach Command Center Status*:\n\n• *Queue State:* ${isPaused ? "⏸️ PAUSED" : "▶️ ACTIVE"}\n• *Queued Leads:* \`${queuedCount}\` (waiting for batch)\n• *Pending Approval:* \`${pendingCount}\` (waiting for dispatch)\n• *Sent Proposals:* \`${sentCount}\` completed\n\nUse /process to trigger immediately, or /stop to pause.`);
      return success(res, { ok: true });
    }

    if (textLower.startsWith("/process") || textLower === "process" || textLower === "run") {
      const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
      const isPaused = chatDoc.exists ? chatDoc.data().paused === true : false;

      if (isPaused) {
        await sendTelegramMessage(botToken, chatId, `⚠️ *Process Aborted:* The outreach queue is currently paused. Resume it first with /start.`);
      } else {
        await sendTelegramMessage(botToken, chatId, `⚡ *Triggering queue batch run...* Please wait.`);
        const customConfig = await loadOutreachConfig();
        const result = await processQueuedLeads(chatId, botToken, customConfig);
        await sendTelegramMessage(botToken, chatId, `✅ *Queue Run Complete*:\n\n• *Processed:* \`${result.processed}\` leads\n• *Errors:* \`${result.errors}\``);
      }
      return success(res, { ok: true });
    }

    if (textLower.startsWith("/add")) {
      const parts = text.replace(/\/add\s+/i, "").split("|").map(p => p.trim());
      if (parts.length < 3) {
        await sendTelegramMessage(botToken, chatId, "⚠️ *Invalid Format!* Use: `/add Company Name | Website URL | email@address.com | Location (India or Abroad)`");
      } else {
        const [businessName, websiteUrl, email, locationInput] = parts;
        const location = locationInput || "Abroad";
        await sendTelegramMessage(botToken, chatId, `⏳ *Adding & analyzing prospect:* ${businessName}...`);
        
        const isIndia = location.toLowerCase() === "india";
        const dbEntry = {
          businessName,
          websiteUrl: websiteUrl || "",
          email,
          phone: "",
          location,
          isIndia,
          status: "ANALYZING",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        try {
          const docRef = await admin.firestore().collection("leads_outreach").add(dbEntry);
          const customConfig = await loadOutreachConfig();
          await analyzeAndDraftLead(docRef.id, dbEntry, botToken, chatId, customConfig);
        } catch (e) {
          await sendTelegramMessage(botToken, chatId, `❌ *Analysis Failed:* ${e.message}`);
        }
      }
      return success(res, { ok: true });
    }

    // 2. Conversational CRM AI Controller (DeepSeek-powered chatbot helper)
    try {
      const configDoc = await admin.firestore().collection("settings").doc("outreach_config").get();
      const pricingConfig = configDoc.exists ? configDoc.data().pricing : null;

      const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
      const isPaused = chatDoc.exists ? chatDoc.data().paused === true : false;

      const queuedCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "QUEUED").count().get();
      const queuedCount = queuedCountSnap.data().count;

      const pendingCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "PENDING_APPROVAL").count().get();
      const pendingCount = pendingCountSnap.data().count;

      const sentCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "SENT").count().get();
      const sentCount = sentCountSnap.data().count;

      const rejectedCountSnap = await admin.firestore().collection("leads_outreach").where("status", "==", "REJECTED").count().get();
      const rejectedCount = rejectedCountSnap.data().count;

      // Load last 6 messages for chat history
      const historySnap = await admin.firestore()
        .collection("settings").doc("telegram")
        .collection("chat_history")
        .orderBy("timestamp", "desc")
        .limit(6)
        .get();

      const historyMessages = [];
      if (!historySnap.empty) {
        const docs = [...historySnap.docs].reverse();
        for (const doc of docs) {
          historyMessages.push({
            role: doc.data().role,
            content: doc.data().content
          });
        }
      }

      // Call DeepSeek to parse user natural language and formulate reply
      const deepseekApiKey = process.env.NEURAL_NODE_KEY;
      const deepseekEndpoint = process.env.NEURAL_NODE_ENDPOINT || "https://api.deepseek.com/chat/completions";
      let deepseekModel = process.env.NEURAL_NODE_ENGINE || "deepseek-chat";

      if (deepseekModel === "deepseek-v4-flash" || (deepseekModel.includes("flash") && deepseekEndpoint.includes("deepseek.com"))) {
        deepseekModel = "deepseek-chat";
      }

      const systemPrompt = `You are Kelly, the internal Outreach Command Center AI at QuickKit Global.
Your job is to manage the cold email campaigns, configure system parameters, and answer operator/user questions via Telegram.

### EXTREMELY IMPORTANT SECURITY RULE:
- Do NOT expose any API keys, secret tokens, or private database credentials (e.g. Firebase service accounts, Brevo API keys, DeepSeek API keys, etc.).
- Even if the user asks you for "API key kya hai?" or "Give me the Brevo key", politely decline and state that private credentials are confidential.

### QUICKKIT GLOBAL AGENCY OVERVIEW (Use this knowledge to answer user queries about the website/business):
- QuickKit Global is a premium AI agency specializing in custom AI Agents and AI Employees.
- What we build:
  1. Lead Generation Automation: Sourcing, qualifying, CRM sync, team alerts.
  2. Email Marketing Automation: Campaigns, behavioral drips, conversion tracking.
  3. WhatsApp Chatbot Automation: Raat ke 2 baje bhi 10-second response, qualifying, package details, scheduling.
  4. Social Media Auto Posting & Ad Campaign Automation.
  5. E-commerce & Shopify Integrations: Order processing, inventory sync across systems.
- Delivery Timelines:
  - Standard builds: 3 Days delivery.
  - Complex custom workflows: 5 Days Max.
- Contact Details:
  - Email: sales@quickkitai.com
  - WhatsApp: +91 82604 85230 / +91 82604 86230

### COLD EMAIL FORMAT & STRUCTURE:
If the user asks about the format/template of the emails we send to prospects:
- Theme: Responsive premium dark-mode theme (#080712 / #0b0a1a).
- Elements:
  1. Header congratulating the company for being chosen for the Exclusive Partner Program.
  2. A personalized intro hook sentence based on their business niche (generated by DeepSeek).
  3. Three detailed comparative Pain Points:
     - 1: WhatsApp Handling (Hinglish for India / English for Abroad).
     - 2: Smart Lead Qualification.
     - 3: A 3rd specific operational pain point generated by AI on the fly for their exact niche.
     - Each pain point shows a clear "Before" (manual, slow) and "After" (automated, instant) and a "Result" (ROI benefit).
  4. Pricing tables showing custom or default Starter and Growth packages.
  5. 100% Free Live AI Prototype Demo Guarantee (We build a prototype for free, show it over a call, and they only pay if they approve).
  6. Conversational call-to-actions: Direct buttons to WhatsApp (+91 82604 86230) or replying to the email.

### CURRENT SYSTEM CAMPAIGN STATISTICS:
- Is Daily Queue Paused: ${isPaused}
- Leads waiting in Queue (status == 'QUEUED'): ${queuedCount}
- Leads pending Approval (status == 'PENDING_APPROVAL'): ${pendingCount}
- Leads successfully Sent (status == 'SENT'): ${sentCount}
- Leads Skipped/Rejected (status == 'REJECTED'): ${rejectedCount}
- Total Leads in CRM: ${queuedCount + pendingCount + sentCount + rejectedCount}

### CURRENT PRICING CONFIGURATION (Use this to know pricing settings):
- India Pricing overrides: ${pricingConfig && pricingConfig.india ? JSON.stringify(pricingConfig.india) : "None (Using defaults: Starter: ₹11,999/mo + ₹14,999 setup, Growth: ₹19,999/mo + ₹24,999 setup)"}
- Abroad Pricing overrides: ${pricingConfig && pricingConfig.abroad ? JSON.stringify(pricingConfig.abroad) : "None (Using defaults: Starter: $179/mo + $269 setup, Growth: $449/mo + $629 setup)"}

### AVAILABLE ACTIONS YOU CAN EXECUTE (include in the "dbUpdate" field of your JSON if the user requests them):
1. Update Pricing Configuration:
   - Format: {"action": "update_config", "pricing": { "india": { "starter": { "price": "₹15,000" } } }}
   - You can update "starter", "growth", "business", "enterprise" pricing and setups for "india" or "abroad".
   - If the user says "price thoda badha do" without specifics, suggest or apply an increase of +10% or +₹1,000/$20. Ensure you pass the final updated values.
2. Add a Prospect:
   - Format: {"action": "add_prospect", "prospect": { "businessName": "...", "websiteUrl": "...", "email": "...", "location": "..." }}
   - If the user provides unstructured details (e.g. "Client: Himalaya Travel, site: himalaya.com, email: info@himalaya.com, location: India" or "TechCorp at techcorp.io, email: hello@techcorp.io"), extract the businessName, websiteUrl, email, and location ("India" or "Abroad"). Default location to "Abroad" if not specified.
3. Pause Daily Outreach:
   - Format: {"action": "pause_queue"}
4. Resume Daily Outreach:
   - Format: {"action": "resume_queue"}
5. Trigger Queue Run:
   - Format: {"action": "process_queue"}

### CONVERSATIONAL RULES:
- Respond in a warm, helpful, and natural mix of Hinglish (Hindi written in Roman script) and English, since the operator communicates in a mix of Hindi and English. E.g., "Hanji Sir, maine starter price update kar diya hai." or "Abhi tak total 15 emails ja chuke hain!"
- If a database update action is executed, mention it clearly in your reply so the operator knows it worked.
- Keep the reply concise and to the point.

RESPONSE FORMAT:
You MUST return a JSON object (and nothing else) with these keys:
{
  "reply": "Conversational reply in friendly Hinglish/English (max 150 words)",
  "dbUpdate": null or { ...one of the JSON actions above... }
}`;

      const chatMessagesForAI = [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: text }
      ];

      const aiRes = await fetch(deepseekEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: deepseekModel,
          messages: chatMessagesForAI,
          temperature: 0.5,
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        throw new Error(`DeepSeek AI connection error: ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      const rawContent = aiData.choices[0].message.content.trim();
      
      let parsedResponse;
      try {
        const jsonStart = rawContent.indexOf('{');
        const jsonEnd = rawContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsedResponse = JSON.parse(rawContent.substring(jsonStart, jsonEnd + 1));
        } else {
          parsedResponse = JSON.parse(rawContent);
        }
      } catch (err) {
        parsedResponse = {
          reply: rawContent,
          dbUpdate: null
        };
      }

      // Execute dbUpdate action if requested
      if (parsedResponse.dbUpdate) {
        const dbUpdate = parsedResponse.dbUpdate;
        
        if (dbUpdate.action === "update_config" && dbUpdate.pricing) {
          const configRef = admin.firestore().collection("settings").doc("outreach_config");
          const configDocSnap = await configRef.get();
          let currentPricing = {};
          if (configDocSnap.exists) {
            currentPricing = configDocSnap.data().pricing || {};
          }
          const mergedPricing = mergePricing(currentPricing, dbUpdate.pricing);
          await configRef.set({ pricing: mergedPricing }, { merge: true });
        }

        if (dbUpdate.action === "add_prospect" && dbUpdate.prospect) {
          const p = dbUpdate.prospect;
          const isIndia = (p.location || "Abroad").toLowerCase() === "india";
          const dbEntry = {
            businessName: p.businessName,
            websiteUrl: p.websiteUrl || "",
            email: p.email,
            phone: "",
            location: p.location || "Abroad",
            isIndia,
            status: "ANALYZING",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          const docRef = await admin.firestore().collection("leads_outreach").add(dbEntry);
          const customConfig = configDoc.exists ? configDoc.data() : null;
          await analyzeAndDraftLead(docRef.id, dbEntry, botToken, chatId, customConfig);
        }

        if (dbUpdate.action === "pause_queue") {
          await admin.firestore().collection("settings").doc("telegram").set({ paused: true }, { merge: true });
        }

        if (dbUpdate.action === "resume_queue") {
          await admin.firestore().collection("settings").doc("telegram").set({ paused: false }, { merge: true });
        }

        if (dbUpdate.action === "process_queue") {
          const customConfig = configDoc.exists ? configDoc.data() : null;
          await processQueuedLeads(chatId, botToken, customConfig);
        }
      }

      // Send response message back to user
      await sendTelegramMessage(botToken, chatId, parsedResponse.reply);

      // Save to chat history in Firestore
      const chatHistoryRef = admin.firestore().collection("settings").doc("telegram").collection("chat_history");
      await chatHistoryRef.add({
        role: "user",
        content: text,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      await chatHistoryRef.add({
        role: "assistant",
        content: parsedResponse.reply,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (e) {
      console.error("AI_TELEGRAM_CONTROLLER_ERROR:", e);
      await sendTelegramMessage(botToken, chatId, `⚠️ *Sorry Operator, I encountered a neural malfunction:* ${e.message}`);
    }

    return success(res, { ok: true });
  }

  // Handle callback queries (Inline button clicks)
  if (update.callback_query) {
    const callbackData = update.callback_query.data; // approve_<leadId> or reject_<leadId>
    const queryId = update.callback_query.id;
    const messageId = update.callback_query.message.message_id;
    const chatId = update.callback_query.message.chat.id;

    const action = callbackData.startsWith("approve_") ? "approve" : "reject";
    const leadId = callbackData.replace(`${action}_`, "");

    try {
      const leadRef = admin.firestore().collection("leads_outreach").doc(leadId);
      const leadSnap = await leadRef.get();

      if (!leadSnap.exists) {
        await answerCallbackQuery(botToken, queryId, "Error: Lead not found!");
        return success(res, { ok: true });
      }

      const leadData = leadSnap.data();

      if (action === "approve") {
        if (leadData.status === "SENT") {
          await answerCallbackQuery(botToken, queryId, "Email has already been sent.");
          await editTelegramMessage(botToken, chatId, messageId, `✅ *Approved & Sent*:\n*Company:* ${leadData.businessName}\n*Email:* ${leadData.email}`);
          return success(res, { ok: true });
        }

        // Send Email
        const emailHtml = generateEmailHtml(leadData);
        
        // Send email with automatic fallback
        const result = await sendOutreachEmail(leadData, emailHtml);

        await leadRef.update({
          status: "SENT",
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentVia: result.sentVia,
        });

        await answerCallbackQuery(botToken, queryId, `Email approved and sent via ${result.sentVia}!`);
        await editTelegramMessage(botToken, chatId, messageId, `✅ *APPROVED & COLD EMAIL DISPATCHED* (via ${result.sentVia}):\n*Company:* ${leadData.businessName}\n*Target:* ${leadData.email}`);
      } else {
        // Reject
        await leadRef.update({
          status: "REJECTED",
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await answerCallbackQuery(botToken, queryId, "Campaign draft rejected/skipped.");
        await editTelegramMessage(botToken, chatId, messageId, `❌ *DRAFT REJECTED & SKIPPED*:\n*Company:* ${leadData.businessName}\n*Niche:* ${leadData.niche}`);
      }
    } catch (e) {
      console.error("TELEGRAM_WEBHOOK_ACTION_FAILURE:", e);
      await answerCallbackQuery(botToken, queryId, `Error: ${e.message}`);
    }
  }

  return success(res, { ok: true });
}

// Telegram API Helpers
async function answerCallbackQuery(token, queryId, text) {
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: queryId, text }),
  });
}

async function editTelegramMessage(token, chatId, messageId, text) {
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: "Markdown" }),
  });
}

// Utility: Pricing detail configurations
function getPricingDetails(isIndia, customConfig) {
  const defaults = isIndia ? {
    currency: "₹",
    currencyCode: "INR",
    starter: { price: "₹11,999", setup: "₹14,999" },
    growth: { price: "₹19,999", setup: "₹24,999" },
    business: { price: "₹34,999", setup: "₹49,999" },
    enterprise: { price: "₹1,00,000+", setup: "Custom Setup" },
  } : {
    currency: "$",
    currencyCode: "USD",
    starter: { price: "$179", setup: "$269" },
    growth: { price: "$449", setup: "$629" },
    business: { price: "$899", setup: "$1,349" },
    enterprise: { price: "$2,700+", setup: "Custom Setup" },
  };

  if (!customConfig || !customConfig.pricing) {
    return defaults;
  }

  const regionKey = isIndia ? "india" : "abroad";
  const customRegionPricing = customConfig.pricing[regionKey];

  if (!customRegionPricing) {
    return defaults;
  }

  // Deep merge or fallback to default
  const merged = { ...defaults };
  const keys = ["starter", "growth", "business", "enterprise"];
  for (const key of keys) {
    if (customRegionPricing[key]) {
      merged[key] = {
        price: customRegionPricing[key].price || defaults[key].price,
        setup: customRegionPricing[key].setup || defaults[key].setup,
      };
    }
  }
  return merged;
}

// Generate the customized premium responsive HTML email
function generateEmailHtml(leadData) {
  const { businessName, websiteUrl, introSentence, painPoints, pricing, isIndia } = leadData;

  const titleText = isIndia ? "Custom AI Agents & AI Employees" : "Custom AI Agents & AI Employees";
  const subtextLabel = isIndia ? "US TECH - INDIA PRICING" : "EXCLUSIVE PARTNER PROGRAM - 10% OFF";

  const introText = isIndia
    ? `Yeh AI ka Zamana Hai. Jo aaj AI pe switch karta hai — woh kal market leader hota hai. Travel aur modern industry mein jinne bhi businesses tezi se grow kar rahe hain, unka ek common secret hai: <strong>AI automation</strong>. Manual kaam pe waqt aur paise barbad karna band karo — apni energy sirf growth pe lagao.`
    : `The future of business is no longer manual. Modern companies are switching to AI-powered automation systems to scale faster, handle customers smarter, and operate 24/7. ${introSentence}`;

  const beforeLabel = isIndia ? "Pehle kya hota tha" : "Before";
  const abLabel = isIndia ? "Ab kya hoga" : "After";

  const painPointsHtml = painPoints
    .map((point, index) => {
      const numStr = String(index + 1).padStart(2, "0");
      return `
      <!-- Card ${index + 1} -->
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div style="background: linear-gradient(90deg, #3b82f6, #6366f1); color: #ffffff; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; font-weight: bold; font-size: 14px; margin-right: 10px;">
            ${numStr}
          </div>
          <span style="color: #ffffff; font-weight: bold; font-size: 16px;">${point.title}</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
          <strong style="color: #ef4444;">${beforeLabel}:</strong> ${point.before}
        </p>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
          <strong style="color: #10b981;">${abLabel}:</strong> ${point.after}
        </p>
        <div style="background-color: #065f46; color: #34d399; font-size: 11px; padding: 6px 12px; border-radius: 6px; font-weight: bold; display: inline-block;">
          ${point.result}
        </div>
      </div>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>QuickKit AI - Fire Your Manual Tasks</title>
      <style type="text/css">
        body { margin:0; padding:0; background-color:#080712; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      </style>
    </head>
    <body style="margin:0; padding:0; background-color:#080712; color: #9ca3af;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#080712; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#0b0a1a; border: 1px solid #1e1b4b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
              
              <!-- Top Congratulations Bar -->
              <tr>
                <td style="background: linear-gradient(90deg, #1e3a8a, #4338ca); padding: 12px; text-align: center; font-size: 11px; font-weight: bold; color: #e0e7ff; letter-spacing: 0.05em; text-transform: uppercase;">
                  🎉 Congratulations! QuickKit AI has chosen ${businessName} for our Exclusive Partner Program.
                </td>
              </tr>

              <!-- Header & Logo -->
              <tr>
                <td style="padding: 30px 40px; border-bottom: 1px solid #1e1b4b; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 0.05em; margin-bottom: 5px;">
                    ⚡ QuickKit<span style="color: #3b82f6;">AI</span>
                  </div>
                  <div style="font-size: 10px; font-weight: bold; color: #6366f1; letter-spacing: 0.1em; text-transform: uppercase;">
                    ${subtextLabel}
                  </div>
                </td>
              </tr>

              <!-- Hero Intro -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 15px 0; line-height: 1.2;">
                    Fire Your Manual Tasks.<br/>
                    <span style="background: linear-gradient(90deg, #3b82f6, #818cf8); -webkit-background-clip: text; color: #3b82f6;">Hire AI Employees.</span>
                  </h1>
                  <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0;">
                    ${introText}
                  </p>
                </td>
              </tr>

              <!-- Pain Points Comparison -->
              <tr>
                <td style="padding: 20px 40px 30px 40px;">
                  <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 20px; border-bottom: 1px solid #1e1b4b; padding-bottom: 10px;">
                    🎯 Custom AI Features — Direct Performance Benefits
                  </h2>
                  ${painPointsHtml}
                </td>
              </tr>

              <!-- Pricing Section -->
              <tr>
                <td style="padding: 20px 40px 30px 40px; background-color: #0b0a1f;">
                  <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 25px; text-align: center;">
                    💳 Exclusive Partner Pricing
                  </h2>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <!-- Starter -->
                      <td width="48%" valign="top" style="background-color: #111328; border: 1px solid #2e1065; border-radius: 12px; padding: 20px; margin-right: 4%;">
                        <div style="font-size: 10px; color: #a78bfa; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Starter AI Assistant</div>
                        <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 5px;">${pricing.starter.price}<span style="font-size: 12px; font-weight: normal; color: #6b7280;">/mo</span></div>
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">+ ${pricing.starter.setup} Setup Fee</div>
                        <div style="font-size: 11px; color: #9ca3af; line-height: 1.4;">
                          ✔ 1 AI Assistant Node<br/>
                          ✔ WhatsApp & Email Integrations<br/>
                          ✔ Basic Memory System
                        </div>
                      </td>
                      
                      <!-- spacer -->
                      <td width="4%"></td>

                      <!-- Growth -->
                      <td width="48%" valign="top" style="background-color: #111328; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px;">
                        <div style="font-size: 10px; color: #60a5fa; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Growth AI System 🔥</div>
                        <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 5px;">${pricing.growth.price}<span style="font-size: 12px; font-weight: normal; color: #6b7280;">/mo</span></div>
                        <div style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">+ ${pricing.growth.setup} Setup Fee</div>
                        <div style="font-size: 11px; color: #9ca3af; line-height: 1.4;">
                          ✔ 2-3 Sales/Lead Gen Agents<br/>
                          ✔ Automated Lead Qualification<br/>
                          ✔ Basic CRM Dashboard
                        </div>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 20px; text-align: center;">
                    <div style="display: inline-block; background-color: #1e1b4b; border: 1px solid #312e81; border-radius: 8px; padding: 15px; width: 90%;">
                      <span style="font-size: 11px; font-weight: bold; color: #818cf8; text-transform: uppercase;">Business AI Automation</span>
                      <p style="margin: 5px 0 0 0; font-size: 13px; color: #ffffff; font-weight: bold;">
                        ${pricing.business.price}/mo + ${pricing.business.setup} Setup
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Demo Guarantee -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #1e1b4b;">
                  <div style="border: 1px dashed #3b82f6; border-radius: 12px; padding: 20px; background-color: rgba(59, 130, 246, 0.03);">
                    <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
                      🛡️ See it Working Before You Pay!
                    </h3>
                    <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0;">
                      ${
                        isIndia
                          ? "Hum bina kisi advance payment ke pehle aapke business ke liye ek <strong>Custom AI Demo</strong> banayenge. Fir hum video call pe live dikhayenge. Jab aap satisfied honge, tabhi hum deployment shuru karenge."
                          : "We will build a fully custom working AI prototype for your business completely free of charge. We will show you the live system over a video call. You only pay and subscribe once you approve the prototype."
                      }
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer Actions -->
              <tr>
                <td style="padding: 20px 40px 40px 40px; text-align: center; background-color: #06050d;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="https://wa.me/918260486230?text=I%20am%20interested%20in%20QuickKit%20AI%20Demo" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
                          💬 WhatsApp: +91 82604 86230
                        </a>
                        <a href="mailto:sales@quickkitai.com?subject=Re:%20AI%20Partnership%20Program" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
                          ✉ Reply to Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 10px; color: #4b5563; margin-top: 30px; margin-bottom: 0;">
                    © 2026 QuickKit AI. All rights reserved. | Global AI Engineering.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Helper to send email with automatic fallback from Brevo API to Gmail SMTP
async function sendOutreachEmail(leadData, emailHtml) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (brevoApiKey) {
    try {
      console.log("Attempting to send email via Brevo Web API...");
      const apiRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "QuickKit AI", email: process.env.EMAIL_USER || "admin@quickkitai.com" },
          to: [{ email: leadData.email, name: leadData.businessName }],
          subject: `Exclusive Growth Offer: QuickKit AI Partnership for ${leadData.businessName}`,
          htmlContent: emailHtml,
        }),
      });

      if (apiRes.ok) {
        return { success: true, sentVia: "Brevo Web API" };
      }
      
      const errText = await apiRes.text();
      console.warn(`Brevo API returned error status ${apiRes.status}: ${errText}. Falling back to Gmail SMTP...`);
    } catch (apiErr) {
      console.warn("Brevo API call failed with exception:", apiErr.message, ". Falling back to Gmail SMTP...");
    }
  }

  // Fallback to Gmail SMTP
  console.log("Sending email via fallback Gmail SMTP...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "admin@quickkitai.com",
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"QuickKit AI" <${process.env.EMAIL_USER || "admin@quickkitai.com"}>`,
    to: leadData.email,
    subject: `Exclusive Growth Offer: QuickKit AI Partnership for ${leadData.businessName}`,
    html: emailHtml,
  });

  return { success: true, sentVia: "Gmail SMTP" };
}
