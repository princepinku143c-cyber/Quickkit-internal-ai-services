
import admin from './_lib/firebaseAdmin.js';
import nodemailer from 'nodemailer';
import { askAI } from '../services/aiService.js';
import { buildCreditRequestNotification } from '../services/creditRequestNotification.js';
import { checkRateLimit } from './_lib/security.js';
import { escapeHtml, getClientIp, isPlainObject, payloadTooLarge, safeMetadata, safeNumber, safeText } from './_lib/input.js';


const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const actionMethods = {
        'stats': 'GET',
        'add-credits': 'POST',
        'redeem-code': 'POST',
        'credit-request': 'POST',
        'generate-payment-token': 'POST',
        'verify-payment-token': 'POST',
        'project-quote': 'POST',
        'project-update': 'POST',
        'project-status': 'POST',
        'lead': 'POST'
    };
    const expectedMethod = actionMethods[action];
    if (expectedMethod && req.method !== expectedMethod) {
        res.setHeader('Allow', `${expectedMethod}, OPTIONS`);
        return error(res, 'Method Not Allowed', 405);
    }
    const authHeader = req.headers.authorization;

    let userId = null;
    let userData = null;
    let authIdentity = { email: '', displayName: '' };

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;
            authIdentity = {
                email: typeof decodedToken.email === 'string' ? decodedToken.email : '',
                displayName: typeof decodedToken.name === 'string' ? decodedToken.name : ''
            };
            const userSnap = await admin.firestore().collection('users').doc(userId).get();
            userData = userSnap.data();
        } catch {
            // Do not disclose Firebase token-verification diagnostics to API callers.
            console.warn("SYSTEM_API_AUTH_FAILED");
            return error(res, "Authentication failed.", 401);
        }
    }

    const actionMap = {
        'stats': getStats,
        'add-credits': handleAddCredits,
        'redeem-code': handleRedeemCode,
        'credit-request': handleCreditRequest,
        'generate-payment-token': handleGenerateToken,
        'verify-payment-token': handleVerifyToken,
        'project-quote': handleProjectQuote,
        'project-update': handleProjectUpdate,
        'project-status': handleProjectStatus,
        'lead': handleLead
    };

    if (actionMap[action]) {
        // Require auth for all actions except 'lead'
        if (action !== 'lead' && !userId) {
            return error(res, "Unauthorized", 401);
        }

        // Admin only actions
        const adminActions = ['stats', 'add-credits', 'generate-payment-token', 'project-quote', 'project-update'];
        if (adminActions.includes(action) && userData?.role !== 'admin') {
            return error(res, "Forbidden: Admin access required", 403);
        }
        return await actionMap[action](req, res, userId, authIdentity);
    }

    return error(res, "Invalid Action", 400);
};

async function handleLead(req, res, userId) {
    const data = req.body;
    if (!isPlainObject(data)) return error(res, 'Invalid lead payload', 400);
    if (payloadTooLarge(data)) return error(res, 'Lead payload is too large', 413);
    try {
        await checkRateLimit(admin, getClientIp(req), 'system-lead', 5);
        const leadRef = admin.firestore().collection('leads').doc();
        const projectRef = admin.firestore().collection('projects').doc();
        const leadData = {
            name: safeText(data.name, 120) || 'Guest',
            email: safeText(data.email, 254),
            phone: safeText(data.phone, 48),
            businessName: safeText(data.businessName, 160) || 'Unknown Company',
            projectName: safeText(data.projectName, 180) || 'Custom Build',
            price: safeNumber(data.price ?? data.budget),
            budget: safeNumber(data.budget ?? data.price),
            requirement: safeText(data.requirement || data.notes, 3000),
            niche_type: safeText(data.niche_type, 80),
            notes: safeText(data.notes, 4000),
            custom_metadata: safeMetadata(data.custom_metadata),
            userId: userId || null,
            source: userId ? 'crm' : 'public-chat',
            status: 'NEW',
            createdAt: new Date().toISOString()
        };
        await leadRef.set(leadData);

        // Asynchronously call the askAI service to draft a welcome email
        const leadId = leadRef.id;
        const leadName = leadData.name;
        const projectName = leadData.projectName;
        (async () => {
            try {
                const prompt = `Write a short, highly professional 3-sentence welcome email for a new lead named ${leadName} inquiring about ${projectName}. Offer to schedule a quick call.`;
                const draft = await askAI([{ role: "user", content: prompt }]);
                await admin.firestore().collection('leads').doc(leadId).update({
                    aiDraftReply: draft
                });
                console.log(`🤖 AI Draft successfully generated for lead ${leadId}`);
            } catch {
                console.error("SYSTEM_LEAD_AI_DRAFT_FAILED");
            }
        })();

        await projectRef.set({
            userId: userId || null,
            clientEmail: leadData.email,
            clientName: leadData.name || leadData.businessName || 'Guest',
            projectName: leadData.projectName,
            businessName: leadData.businessName,
            status: 'pending',
            progress: 0,
            price: leadData.price,
            advancePaid: false,
            createdAt: new Date().toISOString()
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🚀 New Lead/Project: ${data.projectName || 'Custom Build'}`,
            html: `
                <h3>New Lead Submission</h3>
                <p><strong>Name:</strong> ${escapeHtml(leadData.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(leadData.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(leadData.phone)}</p>
                <p><strong>Project:</strong> ${escapeHtml(leadData.projectName)}</p>
                <p><strong>Requirements:</strong> ${escapeHtml(leadData.requirement || 'N/A')}</p>
                <p><strong>Price:</strong> ${leadData.price}</p>
            `
        });

        // Odoo CRM Integration (Wrapped in try-catch to keep it fault-tolerant)
        try {
            const odooUrl = process.env.ODOO_URL;
            const odooDb = process.env.ODOO_DB;
            const odooUsername = process.env.ODOO_USERNAME;
            const odooApiKey = process.env.ODOO_API_KEY;

            if (odooUrl && odooDb && odooUsername && odooApiKey) {
                // Step A: Authenticate
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
                const uid = authData.result;
                
                if (uid) {
                    // Step B: Create crm.lead
                    let clientNiche = "Unknown";
                    const targetUid = userId || null;
                    if (targetUid) {
                        try {
                            const userSnap = await admin.firestore().collection('users').doc(targetUid).get();
                            if (userSnap.exists) {
                                clientNiche = userSnap.data().industryType || "Unknown";
                            }
                        } catch {
                            console.error("SYSTEM_LEAD_USER_LOOKUP_FAILED");
                        }
                    }

                    const leadDescription = `Project: ${data.projectName || 'Custom Build'}\nRequirements: ${data.requirement || data.notes || 'N/A'}\n\n--- CRM Mappings ---\nClient_ID: ${targetUid || 'Guest'}\nNiche: ${clientNiche}`;
                    
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
                                    uid,
                                    odooApiKey,
                                    "crm.lead",
                                    "create",
                                    [{
                                        name: `${data.name || 'New Lead'} - ${data.projectName || 'Custom Build'}`,
                                        contact_name: data.name,
                                        email_from: data.email,
                                        phone: data.phone,
                                        description: leadDescription
                                    }]
                                ]
                            },
                            id: Date.now() + 1
                        })
                    });
                    console.log("✅ Lead successfully synced to Odoo CRM.");
                } else {
                    console.error("❌ Odoo Authentication failed (invalid UID returned).");
                }
            } else {
                console.warn("⚠️ Odoo environment variables are incomplete.");
            }
        } catch {
            console.error("SYSTEM_LEAD_ODOO_SYNC_FAILED");
        }

        return success(res, { status: "LEAD_CREATED", projectId: projectRef.id });
    } catch (e) {
        const status = Number.isInteger(e?.status) ? e.status : 500;
        const retryAfter = Number.isFinite(e?.retryAfter) ? Math.max(1, Math.ceil(e.retryAfter)) : null;
        const message = status === 429 && retryAfter
            ? `Rate limit exceeded. Retry after ${retryAfter}s.`
            : status === 503
                ? "Lead submission is temporarily unavailable."
                : "Unable to submit lead right now.";
        console.error("SYSTEM_LEAD_SUBMIT_FAILED");
        return error(res, message, status);
    }
}

async function getStats(req, res, userId) {
    try {
        const leads = await admin.firestore().collection('leads').count().get();
        const projects = await admin.firestore().collection('projects').count().get();
        return success(res, { leads: leads.data().count, projects: projects.data().count });
    } catch {
        console.error("SYSTEM_STATS_FAILED");
        return error(res, "Unable to retrieve system statistics right now.", 500);
    }
}

async function handleAddCredits(req, res, adminId) {
    const { targetUserId, amount } = req.body;
    if (!targetUserId || !amount) return error(res, "Missing params", 400);

    try {
        const userRef = admin.firestore().collection('users').doc(targetUserId);
        await admin.firestore().runTransaction(async (t) => {
            const doc = await t.get(userRef);
            const current = doc.data().credits || 0;
            t.update(userRef, { credits: current + Number(amount) });
        });
        return success(res, { status: "CREDITS_ADDED" });
    } catch {
        console.error("SYSTEM_ADD_CREDITS_FAILED");
        return error(res, "Unable to add credits right now.", 500);
    }
}

async function handleRedeemCode(req, res, userId) {
    const { code } = req.body;
    if (!code) return error(res, "Code required", 400);

    try {
        const promoRef = admin.firestore().collection('promo_codes').doc(code.toUpperCase());
        const userRef = admin.firestore().collection('users').doc(userId);

        const result = await admin.firestore().runTransaction(async (t) => {
            const promoDoc = await t.get(promoRef);
            if (!promoDoc.exists) throw new Error("Invalid promo code.");

            const promoData = promoDoc.data();
            const usedBy = promoData.usedBy || [];

            if (usedBy.length >= promoData.maxUses) throw new Error("Promo code has reached maximum usage.");
            if (usedBy.includes(userId)) throw new Error("You have already redeemed this code.");

            const userDoc = await t.get(userRef);
            const currentCredits = userDoc.data().credits || 0;

            t.update(userRef, { credits: currentCredits + Number(promoData.amount) });
            t.update(promoRef, { usedBy: [...usedBy, userId] });

            return { amount: promoData.amount };
        });

        return success(res, { amount: result.amount, status: "CODE_REDEEMED" });
    } catch (e) {
        const safePromoMessages = new Map([
            ["Invalid promo code.", "Invalid promo code."],
            ["Promo code has reached maximum usage.", "Promo code has reached maximum usage."],
            ["You have already redeemed this code.", "You have already redeemed this code."]
        ]);
        const safeMessage = safePromoMessages.get(typeof e?.message === "string" ? e.message : "");
        if (safeMessage) return error(res, safeMessage, 400);
        console.error("SYSTEM_REDEEM_CODE_FAILED");
        return error(res, "Unable to redeem code right now.", 500);
    }
}

async function handleCreditRequest(req, res, userId, authIdentity = {}) {
    const amount = req.body && req.body.amount;
    let notification;
    try {
        notification = buildCreditRequestNotification({
            amount,
            email: authIdentity.email,
            displayName: authIdentity.displayName
        });
    } catch {
        return error(res, "A valid positive amount is required.", 400);
    }

    try {
        const requestRef = admin.firestore().collection('payment_requests').doc();
        await requestRef.set({
            userId,
            userEmail: notification.email,
            displayName: notification.displayName,
            price: notification.amount,
            credits: notification.credits,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // Notify admin using verified Firebase identity claims and escaped HTML.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit Billing" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: notification.subject,
            html: notification.html
        });

        return success(res, { status: "REQUEST_SENT" });
    } catch {
        console.error("SYSTEM_CREDIT_REQUEST_FAILED");
        return error(res, "Unable to send credit request right now.", 500);
    }
}

async function handleGenerateToken(req, res, adminId) {
    const { projectId } = req.body;
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        await admin.firestore().collection('projects').doc(projectId).update({
            paymentToken: token,
            paymentTokenGeneratedAt: new Date().toISOString()
        });
        return success(res, { token });
    } catch {
        console.error("SYSTEM_GENERATE_PAYMENT_TOKEN_FAILED");
        return error(res, "Unable to generate payment token right now.", 500);
    }
}

async function handleVerifyToken(req, res, userId) {
    const { projectId, token } = req.body || {};
    if (typeof projectId !== 'string' || !projectId.trim() ||
        typeof token !== 'string' || !token.trim()) {
        return error(res, "Project ID and payment token are required", 400);
    }

    try {
        const db = admin.firestore();
        const projectRef = db.collection('projects').doc(projectId);
        const [userSnap, projectSnap] = await Promise.all([
            db.collection('users').doc(userId).get(),
            projectRef.get()
        ]);

        if (!projectSnap.exists) {
            return error(res, "Project not found", 404);
        }

        const isAdmin = userSnap.data()?.role === 'admin';
        const projectData = projectSnap.data() || {};
        if (!isAdmin && projectData.userId !== userId) {
            return error(res, "Unauthorized project access", 403);
        }

        if (typeof projectData.paymentToken !== 'string' || projectData.paymentToken !== token) {
            return error(res, "Invalid Token", 400);
        }

        await projectRef.update({
            status: 'accepted',
            advancePaid: true,
            paymentToken: null
        });
        return success(res, { status: "VERIFIED" });
    } catch {
        console.error("SYSTEM_VERIFY_PAYMENT_TOKEN_FAILED");
        return error(res, "Unable to verify payment token right now.", 500);
    }
}

async function handleProjectQuote(req, res, adminId) {
    const { projectId, quote, clientEmail, projectName } = req.body;
    try {
        const projectRef = admin.firestore().collection('projects').doc(projectId);
        await projectRef.update({
            status: 'quoted',
            quote: { ...quote, timestamp: new Date().toISOString() },
            updatedAt: new Date().toISOString()
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit Engineering" <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Project Proposal: ${projectName}`,
            html: `
                <h2>Architectural Proposal for ${projectName}</h2>
                <p><strong>Investment:</strong> $${quote.price}</p>
                <p><strong>Estimated Timeline:</strong> ${quote.timeline}</p>
                <p><strong>Notes:</strong> ${quote.notes}</p>
                <p>Please log in to your dashboard to accept this proposal and begin the build.</p>
            `
        });

        return success(res, { status: "QUOTE_SENT" });
    } catch {
        console.error("SYSTEM_PROJECT_QUOTE_FAILED");
        return error(res, "Unable to send the project quote right now.", 500);
    }
}

async function handleProjectUpdate(req, res, adminId) {
    const { projectId, progress, message, clientEmail, projectName } = req.body;
    try {
        const projectRef = admin.firestore().collection('projects').doc(projectId);
        await projectRef.update({
            progress: Number(progress),
            lastUpdate: message,
            updatedAt: new Date().toISOString()
        });

        await projectRef.collection('history').add({
            message,
            percentage: Number(progress),
            timestamp: new Date().toISOString()
        });

        if (progress % 25 === 0 || progress === 100) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: `"QuickKit Engineering" <${process.env.EMAIL_USER}>`,
                to: clientEmail,
                subject: `Progress Update: ${projectName} (${progress}%)`,
                html: `<p>Your project <strong>${projectName}</strong> is now <strong>${progress}%</strong> complete.</p><p>Latest update: <em>${message}</em></p>`
            });
        }

        return success(res, { status: "UPDATED" });
    } catch {
        console.error("SYSTEM_PROJECT_UPDATE_FAILED");
        return error(res, "Unable to update the project right now.", 500);
    }
}

async function handleProjectStatus(req, res, userId) {
    const { projectId, status } = req.body;
    
    try {
        const userSnap = await admin.firestore().collection('users').doc(userId).get();
        const isAdmin = userSnap.data()?.role === 'admin';

        // Security: Clients can only "accept" or request revisions
        const clientAllowedStatuses = ['accepted', 'revision_requested'];
        if (!isAdmin && !clientAllowedStatuses.includes(status)) {
            return error(res, "Unauthorized status transition", 403);
        }

        const projectRef = admin.firestore().collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return error(res, "Project not found", 404);
        }

        const projectData = projectSnap.data();
        if (!isAdmin && projectData.userId !== userId) {
            return error(res, "Unauthorized project access", 403);
        }

        await projectRef.update({ status, updatedAt: new Date().toISOString() });
        
        if (status === 'accepted') {
            await projectRef.collection('history').add({
                message: "Client accepted the quote. Build node initialized.",
                percentage: 0,
                timestamp: new Date().toISOString()
            });
        }
        return success(res, { status: "STATE_TRANSITIONED" });
    } catch {
        console.error("SYSTEM_PROJECT_STATUS_FAILED");
        return error(res, "Unable to update the project status right now.", 500);
    }
}
