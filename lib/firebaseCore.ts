
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

export let app = null;
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    console.log("âœ… Firebase Client Stack Initialized.");
  } else {
    console.warn("âš ï¸ Firebase Config Missing: Running in limited mode. Please check VITE_FIREBASE_API_KEY.");
  }
} catch (e: any) {
  console.error("âŒ Firebase Init Error:", e.message);
}

export const auth = app ? getAuth(app) : ({ currentUser: null, onAuthStateChanged: () => {} } as any);
export const googleProvider = new GoogleAuthProvider();

/**
 * TRIGGER QUEUE SIMULATION
 * In a ¶»§q«^