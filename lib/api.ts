import { auth } from './firebase';

export const apiCall = async (url: string, body?: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Operator Verification Required. Please log in.");

  const idToken = await user.getIdToken();

  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(raw.message || raw.error || "Neural link communication failure.");
  }

  // Handle both direct and wrapped responses for legacy compatibility
  if (raw.success === true && raw.data !== undefined) {
    return raw.data;
  }

  return raw;
};
