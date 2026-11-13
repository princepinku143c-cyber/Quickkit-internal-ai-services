
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { hasRequiredFirebaseClientConfig } from "./firebaseConfig";

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

// Initialize Firebase only if config is present (prevents crash in demo mode)
export const isFirebaseConfigured = hasRequiredFirebaseClientConfig(firebaseConfig);

export let app = null;
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase Client Stack Initialized.");
  } else {
    console.warn("⚠️ Firebase client configuration is incomplete. Required fields: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID. Running in limited mode.");
  }
} catch (e: any) {
  console.error("Firebase client initialization failed.");
}

export const auth = app ? getAuth(app) : ({ currentUser: null, onAuthStateChanged: () => {} } as any);
export const googleProvider = new GoogleAuthProvider();

/**
 * TRIGGER QUEUE SIMULATION
 * In a real app, this would be: addDoc(collection(db, 'trigger_queue'), payload)
 */
export const mockTriggerWorkflow = async (payload: any) => {
  console.info("[FIREBASE BRIDGE] Mock trigger invoked; payload omitted.");
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
