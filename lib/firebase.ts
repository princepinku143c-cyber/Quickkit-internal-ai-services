
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// # PROJECT: Smart AI CRM (Multi-Tenant CRM)
// SINGLE DATABASE SOURCE: This app connects to the ai-crm-system Firebase project.
// SHARED CONFIG: Use ONE firebaseConfig for the entire app.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDysmepgTK_Uj4Q1_5O4xbo7mjFwSum410",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-crm-system-d28ef.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-crm-system-d28ef",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-crm-system-d28ef.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "849924322329",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:849924322329:web:de81e33ecf3b2b26aa6688",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NJCV2Z3HEW"
};

// Initialize Firebase only if config is present
let app = null;
try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase Client Stack Initialized.");
  } else {
    console.warn("⚠️ Firebase Config Missing: Running in limited mode. Please check VITE_FIREBASE_API_KEY.");
  }
} catch (e) {
  console.error("❌ Firebase Init Error:", e.message);
}

export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

/**
 * TRIGGER QUEUE SIMULATION
 * In a real app, this would be: addDoc(collection(db, 'trigger_queue'), payload)
 */
export const mockTriggerWorkflow = async (payload: any) => {
  console.log("🔥 [FIREBASE BRIDGE] Written to 'trigger_queue':", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
