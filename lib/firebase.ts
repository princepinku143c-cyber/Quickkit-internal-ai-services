
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// # PROJECT: Smart AI CRM (Multi-Tenant CRM)
// SINGLE DATABASE SOURCE: This app connects to the ai-crm-system Firebase project.
// SHARED CONFIG: Use ONE firebaseConfig for the entire app.

const firebaseConfig = {
  apiKey: "AIzaSyDysmepgTK_Uj4Q1_5O4xbo7mjFwSum410",
  authDomain: "ai-crm-system-d28ef.firebaseapp.com",
  projectId: "ai-crm-system-d28ef",
  storageBucket: "ai-crm-system-d28ef.firebasestorage.app",
  messagingSenderId: "849924322329",
  appId: "1:849924322329:web:de81e33ecf3b2b26aa6688",
  measurementId: "G-NJCV2Z3HEW"
};

// Initialize Firebase only if config is present (prevents crash in demo mode)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : {};
export const db = app ? getFirestore(app) : {};
export const googleProvider = new GoogleAuthProvider();

/**
 * TRIGGER QUEUE SIMULATION
 * In a real app, this would be: addDoc(collection(db, 'trigger_queue'), payload)
 */
export const mockTriggerWorkflow = async (payload: any) => {
  console.log("🔥 [FIREBASE BRIDGE] Written to 'trigger_queue':", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
