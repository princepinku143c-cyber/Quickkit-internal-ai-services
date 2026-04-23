
import fetch from "node-fetch";

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

const BASE_URL = PAYPAL_MODE === 'live' 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

export async function getPayPalAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials in environment variables.");
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await res.json();
  if (data.error) throw new Error(`PayPal Auth Error: ${data.error_description}`);
  
  return data.access_token;
}

export { BASE_URL };
