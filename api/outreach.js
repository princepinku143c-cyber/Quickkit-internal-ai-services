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
    if (action === "telegram-webhook") return handleTelegramWebhook(req, res);

    return error(res, "Invalid Action", 400);
  } catch (err) {
    console.error("OUTREACH_CRASH:", err);
    return error(res, err.message, 500);
  }
}

// 1. Analyze Prospect, generate pain points and email draft, push to Telegram
async function handleAnalyze(req, res) {
  const { businessName, websiteUrl, email, phone, location, nicheNotes } = req.body;

  if (!businessName || !email || !location) {
    return error(res, "Business Name, Email, and Location (India/Abroad) are required.", 400);
  }

  try {
    // Determine pricing and currency based on location
    const isIndia = location.toLowerCase() === "india";
    const pricing = getPricingDetails(isIndia);

    // Call DeepSeek to analyze the niche & website to extract the 3rd dynamic pain point and generate specific context
    const deepseekApiKey = process.env.NEURAL_NODE_KEY;
    const deepseekEndpoint = process.env.NEURAL_NODE_ENDPOINT || "https://api.deepseek.com/chat/completions";
    let deepseekModel = process.env.NEURAL_NODE_ENGINE || "deepseek-chat";

    if (!deepseekApiKey) {
      throw new Error("Missing DeepSeek API credentials.");
    }

    // Handle user naming confusion (e.g., deepseek-v4-flash) by mapping to official deepseek-chat
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

    // Build the 3 pain points structure
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

    // Build outreach database entry
    const dbEntry = {
      businessName,
      websiteUrl: websiteUrl || "",
      email,
      phone: phone || "",
      location,
      isIndia,
      niche: parsedAI.niche || "Business Automation",
      introSentence: parsedAI.introSentence || "",
      painPoints,
      pricing,
      status: "PENDING_APPROVAL",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save lead to outreach sub-collection
    const docRef = await admin.firestore().collection("leads_outreach").add(dbEntry);
    const leadId = docRef.id;

    // Send notification to Telegram for human approval
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatDoc = await admin.firestore().collection("settings").doc("telegram").get();
    const chatId = chatDoc.exists ? chatDoc.data().chatId : process.env.TELEGRAM_CHAT_ID;

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

    return success(res, { leadId, status: "PENDING_APPROVAL", analysis: dbEntry });
  } catch (err) {
    console.error("ANALYZE_ERROR:", err);
    return error(res, err.message, 500);
  }
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

    // Send email using Brevo SMTP (Nodemailer) or Brevo Transactional API
    const brevoApiKey = process.env.BREVO_API_KEY;
    let sentVia = "Brevo SMTP";

    if (brevoApiKey) {
      // Send via Brevo API V3
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

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Brevo API Dispatch Error: ${apiRes.status} - ${errText}`);
      }
      sentVia = "Brevo Web API";
    } else {
      // Fallback: SMTP transporter
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
    }

    // Update database status
    await admin.firestore().collection("leads_outreach").doc(id).update({
      status: "SENT",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentVia,
    });

    return success(res, { status: "SENT", leadId: id });
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

// 4. Telegram Webhook Callback Queries
async function handleTelegramWebhook(req, res) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const update = req.body;

  if (!update) return success(res, { ok: true });

  // If a standard text message is received (e.g. /start), register chat ID
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text.trim();

    if (text.startsWith("/start") || text.toLowerCase() === "hello") {
      // Save Chat ID to settings
      await admin.firestore().collection("settings").doc("telegram").set({
        chatId,
        registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🤖 *QuickKit AI Outreach Controller Initialized!*\n\nThis Chat ID (\`${chatId}\`) has been successfully registered in your Firestore Settings. You will now receive cold email drafts here for validation.`,
            parse_mode: "Markdown",
          }),
        });
      }
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
        const brevoApiKey = process.env.BREVO_API_KEY;

        if (brevoApiKey) {
          await fetch("https://api.brevo.com/v3/smtp/email", {
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
        } else {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
          await transporter.sendMail({
            from: `"QuickKit AI" <${process.env.EMAIL_USER}>`,
            to: leadData.email,
            subject: `Exclusive Growth Offer: QuickKit AI Partnership for ${leadData.businessName}`,
            html: emailHtml,
          });
        }

        await leadRef.update({
          status: "SENT",
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await answerCallbackQuery(botToken, queryId, "Email approved and sent!");
        await editTelegramMessage(botToken, chatId, messageId, `✅ *APPROVED & COLD EMAIL DISPATCHED*:\n*Company:* ${leadData.businessName}\n*Target:* ${leadData.email}`);
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
function getPricingDetails(isIndia) {
  if (isIndia) {
    return {
      currency: "₹",
      currencyCode: "INR",
      starter: { price: "₹11,999", setup: "₹14,999" },
      growth: { price: "₹19,999", setup: "₹24,999" },
      business: { price: "₹34,999", setup: "₹49,999" },
      enterprise: { price: "₹1,00,000+", setup: "Custom Setup" },
    };
  }
  // US / Global Outreach (10% Discount from Default rates)
  return {
    currency: "$",
    currencyCode: "USD",
    starter: { price: "$179", setup: "$269" },
    growth: { price: "$449", setup: "$629" },
    business: { price: "$899", setup: "$1,349" },
    enterprise: { price: "$2,700+", setup: "Custom Setup" },
  };
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
