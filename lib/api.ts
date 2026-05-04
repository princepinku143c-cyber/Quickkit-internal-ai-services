import { auth } from './firebase';

export const apiCall = async (url: string, body?: any, options: { allowGuest?: boolean } = {}) => {
  const user = auth.currentUser;
  
  if (!user && !options.allowGuest) {
    throw new Error("Operator Verification Required. Please log in.");
  }

  const headers: any = {
    "Content-Type": "application/json"
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers["Authorization"] = `Bearer ${idToken}`;
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
