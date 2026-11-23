
import { db, auth } from './firebase';
import { Blueprint, UserPlan, PlanTier, CouponData, ExecutionLog, ExecutionState, Nexus, Synapse, Region, AdminPromo } from '../types';
import firebase from 'firebase/compat/app';

// --- ARCHITECT MEMORY SYSTEM ---
export const saveArchitectMemory = async (prompt: string, nexuses: Nexus[], synapses: Synapse[]) => {
    const userId = auth?.currentUser?.uid;
    if (!db || !userId) return;
    if (nexuses.length < 3) return;
    try {
        await db.collection('architect_memory').add({
            userId,
            userPrompt: prompt.slice(0, 8000),
            blueprintSummary: `Workflow with ${nexuses.length} nodes`,
            fullBlueprint: { nexuses, synapses },
            createdAt: Date.now(),
            likes: 1
        });
    } catch (e) { console.warn("Failed to save memory:", e); }
};

export const getArchitectMemories = async (limit: number = 5): Promise<string> => {
    const userId = auth?.currentUser?.uid;
    if (!db || !userId) return "";
    try {
        const snapshot = await db.collection('architect_memory')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        if (snapshot.empty) return "";
        let contextString = "\n### LEARNED PATTERNS:\n";
        snapshot.forEach(doc => {
            const data = doc.data();
            contextString += `- USER: "${data.userPrompt}" -> BLUEPRINT: ${data.blueprintSummary}\n`;
        });
        return contextString;
    } catch (e) { return ""; }
};

// --- QUOTA & LOGS ---
export const updateDailyUsage = async (userId: string): Promise<{ allowed: boolean, count: number, reason?: 'unavailable' }> => {
    // Preserve the existing guest and local development bypasses.
    if (userId === 'guest' || userId === 'dev-bypass-user-999') return { allowed: true, count: 0 };

    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
        return { allowed: false, count: 0, reason: 'unavailable' };
    }

    try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch('/api/usage/daily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({}),
        });
        if (!response.ok) return { allowed: false, count: 0, reason: 'unavailable' };

        const payload = await response.json();
        const quota = payload?.data;
        if (
            payload?.success !== true
            || !quota
            || typeof quota.allowed !== 'boolean'
            || !Number.isSafeInteger(quota.count)
            || quota.count < 0
        ) {
            return { allowed: false, count: 0, reason: 'unavailable' };
        }
        return { allowed: quota.allowed, count: quota.count };
    } catch {
        // Missing API access, invalid responses, and network failures all fail closed.
        return { allowed: false, count: 0, reason: 'unavailable' };
    }
};

export const checkRateLimit = async (userId: string, limit: number, windowSec: number): Promise<{ allowed: boolean }> => {
    return { allowed: true }; // Simplified for now
};

export const createCloudRun = async (state: ExecutionState) => {
    if (!db) return;
    await db.collection('active_runs').doc(state.runId).set({ ...state, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
};

export const saveRunState = async (state: ExecutionState) => {
    if (!db) return;
    await db.collection('active_runs').doc(state.runId).set({ ...state, lastUpdateTime: Date.now() }, { merge: true });
};

export const clearRunState = async (runId: string) => {
    if (!db) return;
    await db.collection('active_runs').doc(runId).delete();
};

export const subscribeToRun = (runId: string, callback: (state: ExecutionState) => void) => {
    if (!db) return () => {};
    return db.collection('active_runs').doc(runId).onSnapshot(doc => {
        if (doc.exists) callback(doc.data() as ExecutionState);
    });
};

export const saveExecutionLog = async (userId: string, log: ExecutionLog) => {
    if (!db) return;
    await db.collection('execution_logs').add({ ...log, userId: userId || 'guest', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
};

export const subscribeToLogs = (userId: string, callback: (logs: ExecutionLog[]) => void) => {
    if (!db) return () => {};
    return db.collection('execution_logs').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(20).onSnapshot(snapshot => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExecutionLog)));
    });
};

export const getUserBlueprints = async (userId: string): Promise<Blueprint[]> => {
    if (!db) return [];
    const snapshot = await db.collection('blueprints').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blueprint));
};

// --- DYNAMIC COUPON VALIDATION (REAL FIRESTORE) ---
export const validateCoupon = async (code: string, tier: PlanTier, region: Region): Promise<CouponData> => {
    if (!db) throw new Error("Database not connected");
    const cleanCode = code.toUpperCase().trim();
    
    const snapshot = await db.collection('coupons').where('code', '==', cleanCode).limit(1).get();

    if (snapshot.empty) throw new Error("Invalid promo code.");
    
    const doc = snapshot.docs[0];
    const promo = doc.data() as AdminPromo;

    if (!promo.active) throw new Error("This promo code has been disabled.");
    if (promo.used >= promo.maxUses) throw new Error("Promo code limit reached.");
    if (promo.expiresAt && Date.now() > promo.expiresAt) throw new Error("Promo code expired.");
    
    // Check Tier
    if (promo.validPlans && !promo.validPlans.includes(tier)) {
        throw new Error(`This code is only valid for ${promo.validPlans.join('/')} plans.`);
    }

    // Check Region
    if (promo.currency) {
        if (region === 'IN' && promo.currency !== 'INR') throw new Error("This code cannot be used in India.");
        if (region === 'GLOBAL' && promo.currency !== 'USD') throw new Error("This code is for India region only.");
    }

    return { 
        code: cleanCode, 
        discountType: promo.type, 
        discountValue: promo.value,
        validTiers: promo.validPlans || ['PRO'],
        requiredAutoPay: true 
    };
};

export const redeemCoupon = async (code: string) => {
    if (!db) return;
    const snapshot = await db.collection('coupons').where('code', '==', code).limit(1).get();
    if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
            used: firebase.firestore.FieldValue.increment(1)
        });
    }
};
