
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// # PROJECT: Smart AI CRM (Multi-Tenant CRM)
// SINGLE DATABASE SOURCE: This app connects to the ai-crm-system Firebase project.
// SHARED CONFIG: Use ONE firebaseConfig for the entire app.

const firebaseConfig = {
  apiKey: "AIzaSyC0c0orE9oK7JZMwswRviBB0cWdnVnwdD4",
  authDomain: "ai-crm-system.firebaseapp.com",
  projectId: "ai-crm-system",
  storageBucket: "ai-crm-system.firebasestorage.app",
  messagingSenderId: "639362646888",
  appId: "1:639362646888:web:5a917cd44032eb5989ccdd",
  measurementId: "G-HD73Q2TQHW"
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
