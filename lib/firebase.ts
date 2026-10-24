import { getFirestore } from "firebase/firestore";
import { app } from "./firebaseCore";
export * from "./firebaseCore";

export const db = app ? getFirestore(app) : ({} as any);
