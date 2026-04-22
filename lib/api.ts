import { auth } from './firebase';

export const apiCall = async (url: string, body?: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const idToken = await user.getIdToken();

  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.output || "API failed");
  }

  return data;
};
