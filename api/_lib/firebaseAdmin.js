import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { selectAdminAppForProject } from "./firebaseProjectBinding.js";

const credentials = {
  projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const adminAppSelection = selectAdminAppForProject(getApps(), credentials.projectId);
let app = adminAppSelection.app;

if (adminAppSelection.blocked) {
  console.error("Firebase Admin existing app does not match the configured project; refusing to reuse it.");
}

if (!app && !adminAppSelection.blocked) {
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
      console.error("Firebase Admin initialization failed. Check server-side Firebase Admin configuration.");
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
    return app ? [app] : [];
  },
  auth() {
    if (!app) throw new Error("Firebase Admin is not configured for this environment.");
    return getAuth(app);
  },
  firestore,
};

export const db = app ? getFirestore(app) : null;
export default admin;
