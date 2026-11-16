
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMissingFirebaseClientConfig } from "./firebaseConfig.js";

// # PROJECT: Smart AI CRM (Multi-Tenant CRM)
// SINGLE DATABASE SOURCE: This app connects to the ai-crm-system Firebase project.
// SHARED CONFIG: Use ONE firebaseConfig for the entire app.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Require the complete client identity before initializing Firebase. A lone API key
// is not enough for Auth/Firestore; incomplete deployments must stay in limited mode.
const missingFirebaseConfig = getMissingFirebaseClientConfig(firebaseConfig);
export const isFirebaseConfigured = missingFirebaseConfig.length === 0;

export let app = null;
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase Client Stack Initialized.");
  } else {
    console.warn(
      `⚠️ Firebase client config incomplete: running in limited mode. Missing: ${missingFirebaseConfig.join(", ")}.`
    );
  }
} catch (e: any) {
  console.error("❌ Firebase Init Error:", e.message);
}

export const auth = app ? getAuth(app) : ({ currentUser: null, onAuthStateChanged: () => {} } as any);
export const googleProvider = new GoogleAuthProvider();

/**
 * TRIGGER QUEUE SIMULATION
 * In a real app, this would be: addDoc(collection(db, 'trigger_queue'), payload)
 */
export const mockTriggerWorkflow = async (payload: any) => {
  console.log("🔥 [FIREBASE BRIDGE] Written to 'trigger_queue':", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
