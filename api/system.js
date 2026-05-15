
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}

const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const authHeader = req.headers.authorization;

    let userId = null;
    let userData = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;
            const userSnap = await admin.firestore().collection('users').doc(userId).get();
            userData = userSnap.data();
        } catch (e) {
            return error(res, "Authentication Failed: " + e.message, 401);
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
        const adminActions = ['add-credits', 'generate-payment-token', 'project-quote', 'project-update'];
        if (adminActions.includes(action) && userData?.role !== 'admin') {
            return error(res, "Forbidden: Admin access required", 403);
        }
        return await actionMap[action](req, res, userId);
    }

    return error(res, "Invalid Action", 400);
};

async function handleLead(req, res, userId) {
    const data = req.body;
    try {
        const leadRef = admin.firestore().collection('leads').doc();
        const projectRef = admin.firestore().collection('projects').doc();

        await leadRef.set({
            ...data,
            userId: userId || data.userId || null,
            createdAt: new Date().toISOString()
        });

        await projectRef.set({
            userId: userId || data.userId || null,
            clientEmail: data.email,
            clientName: data.name || data.businessName || 'Guest',
            projectName: data.projectName || 'Custom Build',
            businessName: data.businessName || 'Unknown',
            status: 'pending',
            progress: 0,
            price: data.price || 0,
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
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Project:</strong> ${data.projectName || 'Custom Build'}</p>
                <p><strong>Requirements:</strong> ${data.requirement || data.notes || 'N/A'}</p>
                <p><strong>Price:</strong> $${data.price || 0}</p>
            `
        });

        return success(res, { status: "LEAD_CREATED", projectId: projectRef.id });
    } catch (e) {
        return error(res, e.message, 500);
    }
}

async function getStats(req, res, userId) {
    try {
        const leads = await admin.firestore().collection('leads').count().get();
        const projects = await admin.firestore().collection('projects').count().get();
        return success(res, { leads: leads.data().count, projects: projects.data().count });
    } catch (e) {
        return error(res, e.message, 500);
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
    } catch (e) {
        return error(res, e.message, 500);
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
        return error(res, e.message, 400);
    }
}

async function handleCreditRequest(req, res, userId) {
    const { amount, email, displayName } = req.body;
    if (!amount) return error(res, "Amount required", 400);

    try {
        const requestRef = admin.firestore().collection('payment_requests').doc();
        await requestRef.set({
            userId,
            userEmail: email,
            displayName,
            price: Number(amount),
            credits: Number(amount) * 10,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // 📧 Notify Admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"QuickKit Billing" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self/admin
            subject: `💳 New Credit Request: ${displayName} ($${amount})`,
            html: `
                <h3>New Credit Purchase Request</h3>
                <p><strong>Client:</strong> ${displayName} (${email})</p>
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>Credits to Inject:</strong> ${amount * 10}</p>
                <hr/>
                <p>Please log in to the Admin Portal to approve this request and send a payment link.</p>
            `
        });

        return success(res, { status: "REQUEST_SENT" });
    } catch (e) {
        return error(res, e.message, 500);
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
    } catch (e) {
        return error(res, e.message, 500);
    }
}

async function handleVerifyToken(req, res, userId) {
    const { projectId, token } = req.body;
    try {
        const projectRef = admin.firestore().collection('projects').doc(projectId);
        const snap = await projectRef.get();
        if (snap.data().paymentToken === token) {
            await projectRef.update({ 
                status: 'accepted', 
                advancePaid: true,
                paymentToken: null 
            });
            return success(res, { status: "VERIFIED" });
        }
        return error(res, "Invalid Token", 400);
    } catch (e) {
        return error(res, e.message, 500);
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
    } catch (e) {
        return error(res, e.message, 500);
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
    } catch (e) {
        return error(res, e.message, 500);
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
        return error(res, e.message, 500);
    }
}
