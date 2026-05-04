import { auth } from './firebase';

export const apiCall = async (url: string, body?: any) => {
  const user = auth.currentUser;
  let idToken = null;
  
  if (user) {
    idToken = await user.getIdToken();
  }

  const headers: any = {
    "Content-Type": "application/json"
  };

  if (idToken) {
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
