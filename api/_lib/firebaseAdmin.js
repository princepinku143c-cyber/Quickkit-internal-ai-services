import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
      const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
      
      if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error("🚨 Missing Critical Backend Credentials: Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment variables.");
      }

      const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("✅ Firebase Operational: Neural Node Connected.");
    } catch (e) {
      console.error("❌ Firebase Initialization Failure:", e.message);
    }
}

export const db = admin.apps.length ? admin.firestore() : null;
export default admin;
