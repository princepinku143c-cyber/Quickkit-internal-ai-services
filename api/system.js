
import admin from './_lib/firebaseAdmin.js';
import nodemailer from 'nodemailer';
import { askAI } from './_lib/services/aiService.js';
import { checkRateLimit } from './_lib/security.js';
import { escapeHtml, getClientIp, isPlainObject, normalizeCreditAdjustment, normalizeCreditPackage, payloadTooLarge, safeMetadata, safeNumber, safeText } from './_lib/input.js';
import { getPublicSystemError } from './_lib/systemErrors.js';
import { getSystemActionMethods } from './_lib/systemActionMethods.js';
import { generatePaymentToken, verifyAndConsumePaymentToken } from './_lib/paymentToken.js';


const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const authHeader = req.headers.authorization;

    let userId = null;
    let userData = null;
    let authContext = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;
            authContext = {
                email: typeof decodedToken.email === "string" ? decodedToken.email : null,
                name: typeof decodedToken.name === "string" ? decodedToken.name : null
            };
            const userSnap = await admin.firestore().collection('users').doc(userId).get();
            userData = userSnap.data();
        } catch {
            // Do not expose Firebase token-verification details to API callers.
            return error(res, "Authentication failed", 401);
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

    if (!Object.prototype.hasOwnProperty.call(actionMap, action)) {
        return error(res, "Invalid Action", 400);
    }

    const allowedMethods = getSystemActionMethods(action);
    if (!allowedMethods || !allowedMethods.includes(req.method)) {
        res.setHeader('Allow', `${(allowedMethods || []).concat('OPTIONS').join(', ')}`);
        return error(res, 'Method Not Allowed', 405);
    }

    if (Object.prototype.hasOwnProperty.call(actionMap, action)) {
        // Require auth for all actions except 'lead'
        if (action !== 'lead' && !userId) {
            return error(res, "Unauthorized", 401);
        }

        // Admin only actions
        const adminActions = ['stats', 'add-credits', 'generate-payment-token', 'project-quote', 'project-update'];
        if (adminActions.includes(action) && userData?.role !== 'admin') {
            return error(res, "Forbidden: Admin access required", 403);
        }
        return await actionMap[action](req, res, userId, authContext);
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
            } catch (err) {
                console.error(`AI draft generation failed for lead ${leadId}.`);
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
                        } catch (userErr) {
                            console.error("Failed to fetch user niche for tagging.");
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
        } catch (odooError) {
            console.error("Odoo CRM sync failed.");
        }

        return success(res, { status: "LEAD_CREATED", projectId: projectRef.id });
    } catch (e) {
        const publicError = getPublicSystemError(e, "Unable to submit lead right now.");
        return error(res, publicError.message, publicError.status);
    }
}

async function getStats(req, res, userId) {
    try {
        const leads = await admin.firestore().collection('leads').count().get();
        const projects = await admin.firestore().collection('projects').count().get();
        return success(res, { leads: leads.data().count, projects: projects.data().count });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
    }
}

async function handleAddCredits(req, res, adminId) {
    const { targetUserId, amount } = req.body || {};
    const adjustment = normalizeCreditAdjustment(targetUserId, amount);
    if (!adjustment) return error(res, "Invalid credit adjustment", 400);

    try {
        const userRef = admin.firestore().collection('users').doc(adjustment.targetUserId);
        const result = await admin.firestore().runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) return "not_found";

            const current = doc.data()?.credits ?? 0;
            if (
                !Number.isSafeInteger(current) || current < 0
                || current > Number.MAX_SAFE_INTEGER - adjustment.amount
            ) {
                return "invalid_balance";
            }

            t.update(userRef, { credits: current + adjustment.amount });
            return "updated";
        });

        if (result === "not_found") return error(res, "Target user not found", 404);
        if (result !== "updated") return error(res, "Credit balance cannot be updated", 409);
        return success(res, { status: "CREDITS_ADDED" });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
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
        const publicError = getPublicSystemError(e, "Unable to redeem promo code.");
        return error(res, publicError.message, publicError.status);
    }
}

async function handleCreditRequest(req, res, userId, authContext) {
    const { credits, price } = req.body || {};
    const creditPackage = normalizeCreditPackage(credits, price);
    const email = typeof authContext?.email === "string" ? authContext.email.trim() : "";
    if (!creditPackage) return error(res, "Invalid credit package", 400);
    if (!email) return error(res, "Account email required", 403);

    const displayName = safeText(authContext?.name, 120) || "Client";

    try {
        const requestRef = admin.firestore().collection('payment_requests').doc();
        await requestRef.set({
            userId,
            userEmail: email,
            displayName,
            price: creditPackage.price,
            credits: creditPackage.credits,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        const safeDisplayName = escapeHtml(displayName);
        const safeEmail = escapeHtml(email);
        const safeAmount = escapeHtml(creditPackage.price);
        const safeCredits = escapeHtml(creditPackage.credits);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit Billing" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `💳 New Credit Request: ${displayName} ($${creditPackage.price})`,
            html: `
                <h3>New Credit Purchase Request</h3>
                <p><strong>Client:</strong> ${safeDisplayName} (${safeEmail})</p>
                <p><strong>Amount:</strong> $${safeAmount}</p>
                <p><strong>Credits to Inject:</strong> ${safeCredits}</p>
                <hr/>
                <p>Please log in to the Admin Portal to approve this request and send a payment link.</p>
            `
        });

        return success(res, { status: "REQUEST_SENT" });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
    }
}

async function handleGenerateToken(req, res, adminId) {
    const { projectId } = req.body;
    const token = generatePaymentToken();
    try {
        await admin.firestore().collection('projects').doc(projectId).update({
            paymentToken: token,
            paymentTokenGeneratedAt: new Date().toISOString()
        });
        return success(res, { token });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
    }
}

async function handleVerifyToken(req, res, userId) {
    const { projectId, token } = req.body || {};
    if (
        typeof projectId !== "string" || !projectId.trim()
        || typeof token !== "string" || !token.trim()
        || token.length !== 6 || !/^[0-9A-Z]{6}$/.test(token)
    ) {
        return error(res, "Invalid Token", 400);
    }

    try {
        // Limit authenticated token guesses; fail closed if the limiter backend is unavailable.
        await checkRateLimit(admin, userId, "verify-payment-token", 5);
        const projectRef = admin.firestore().collection('projects').doc(projectId);
        const verified = await verifyAndConsumePaymentToken(admin.firestore(), projectRef, token, userId);
        if (!verified) {
            return error(res, "Invalid Token", 400);
        }
        return success(res, { status: "VERIFIED" });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
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

        const safeProjectName = escapeHtml(projectName);
        const safePrice = escapeHtml(quote?.price);
        const safeTimeline = escapeHtml(quote?.timeline);
        const safeNotes = escapeHtml(quote?.notes);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit Engineering" <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Project Proposal: ${projectName}`,
            html: `
                <h2>Architectural Proposal for ${safeProjectName}</h2>
                <p><strong>Investment:</strong> $${safePrice}</p>
                <p><strong>Estimated Timeline:</strong> ${safeTimeline}</p>
                <p><strong>Notes:</strong> ${safeNotes}</p>
                <p>Please log in to your dashboard to accept this proposal and begin the build.</p>
            `
        });

        return success(res, { status: "QUOTE_SENT" });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
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

        const safeProjectName = escapeHtml(projectName);
        const safeProgress = escapeHtml(progress);
        const safeMessage = escapeHtml(message);

        if (progress % 25 === 0 || progress === 100) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: `"QuickKit Engineering" <${process.env.EMAIL_USER}>`,
                to: clientEmail,
                subject: `Progress Update: ${projectName} (${progress}%)`,
                html: `<p>Your project <strong>${safeProjectName}</strong> is now <strong>${safeProgress}%</strong> complete.</p><p>Latest update: <em>${safeMessage}</em></p>`
            });
        }

        return success(res, { status: "UPDATED" });
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
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
    } catch (e) {
        const publicError = getPublicSystemError(e);
        return error(res, publicError.message, publicError.status);
    }
}
