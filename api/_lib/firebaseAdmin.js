import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const credentials = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let app = getApps()[0] || null;

if (!app) {
  if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
    console.error("Firebase Admin credentials are not configured for this environment.");
  } else {
    try {
      app = initializeApp({
        credential: cert(credentials),
        projectId: credentials.projectId,
      });
      console.log("Firebase Admin initialized.");
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error instanceof Error ? error.message : error);
    }
  }
}

function firestore() {
  if (!app) throw new Error("Firebase Admin is not configured for this environment.");
  return getFirestore(app);
}
firestore.FieldValue = FieldValue;

const admin = {
  get apps() {
    return getApps();
  },
  auth() {
    if (!app) throw new Error("Firebase Admin is not configured for this environment.");
    return getAuth(app);
  },
  firestore,
};

export const db = app ? getFirestore(app) : null;
export default admin;
