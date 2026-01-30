
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// # PROJECT: Nexus Client Portal (Multi-Tenant CRM)
// SINGLE DATABASE SOURCE: This app connects to the existing NexusStream Firebase project.
// SHARED CONFIG: Use ONE firebaseConfig for the entire app.

const firebaseConfig = {
  // TODO: Paste your firebaseConfig string here immediately
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_PROJECT_ID.appspot.com",
  // messagingSenderId: "YOUR_SENDER_ID",
  // appId: "YOUR_APP_ID"
};

// Initialize Firebase only if config is present (prevents crash in demo mode)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : {};
export const db = app ? getFirestore(app) : {};

/**
 * TRIGGER QUEUE SIMULATION
 * In a real app, this would be: addDoc(collection(db, 'trigger_queue'), payload)
 */
export const mockTriggerWorkflow = async (payload: any) => {
  console.log("🔥 [FIREBASE BRIDGE] Written to 'trigger_queue':", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
