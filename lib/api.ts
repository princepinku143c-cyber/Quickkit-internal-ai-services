import type { Auth } from "firebase/auth";
import { auth, isFirebaseConfigured } from './firebase';

type ApiCallOptions = {
  allowGuest?: boolean;
};

export const apiCall = async (url: string, body?: any, options: ApiCallOptions = {}) => {
  const user = isFirebaseConfigured ? (auth as Auth).currentUser : null;
  if (!user && !options.allowGuest) {
    throw new Error("Operator Verification Required. Please log in.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers.Authorization = `Bearer ${idToken}`;
  }

  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(raw.message || raw.error || "Connection issue. Please retry.");
  }

  // Handle both direct and wrapped responses for legacy compatibility
  if (raw.success === true && raw.data !== undefined) {
    return raw.data;
  }

  return raw;
};
