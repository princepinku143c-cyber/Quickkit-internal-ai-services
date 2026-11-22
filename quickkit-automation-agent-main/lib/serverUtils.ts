import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK (Shared Singleton) using the modular Admin SDK API.
let app = getApps()[0];
if (!app) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            app = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
        } else {
            app = initializeApp();
        }
    } catch (e) {
        console.error("Firebase Admin Init Error:", e);
        throw e;
    }
}

const db = getFirestore(app);

/**
 * Checks if a user's plan has expired and downgrades them if necessary.
 */
export async function checkPlanExpiry(userId: string) {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  const user = userDoc.data();

  if (!user) return;

  if (user.plan?.tier !== 'FREE' && user.plan?.expiresAt && Date.now() > user.plan.expiresAt) {
    await userRef.update({
      'plan.tier': "FREE",
      'plan.credits': 5,
      'plan.monthlyLimit': 5,
      'plan.expiresAt': 0,
      // Sync root for legacy
      tier: "FREE",
      credits: 5,
      monthlyLimit: 5
    });
  }
}

/**
 * Throws error if user is not an Admin.
 */
export async function requireAdmin(userId: string) {
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists || (userDoc.data()?.role !== "ADMIN" && userDoc.data()?.role !== "OWNER")) {
    throw new Error("Access denied. Admin privileges required.");
  }
}

/**
 * Validates a coupon code on the server.
 */
export async function validateCoupon(code: string, tier: string, currency: string) {
    const cleanCode = code.toUpperCase().trim();

    const snapshot = await db.collection("coupons")
        .where('code', '==', cleanCode)
        .where('active', '==', true)
        .get();

    if (snapshot.empty) return null;

    const promo = snapshot.docs[0].data();

    if (promo.expiresAt && promo.expiresAt < Date.now()) return null;
    if (promo.used >= promo.maxUses) return null;
    if (!promo.validPlans.includes(tier)) return null;
    if (promo.currency && promo.currency !== currency) return null;

    return promo;
}
