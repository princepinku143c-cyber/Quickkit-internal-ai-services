import assert from "node:assert/strict";
import { generatePaymentToken } from "../api/_lib/paymentToken.js";

for (let index = 0; index < 1000; index += 1) {
  const token = generatePaymentToken();
  assert.match(token, /^[0-9A-Z]{6}$/, "payment tokens must remain six uppercase base-36 characters");
}

console.log("Cryptographically secure payment-token format tests passed (1,000 samples).");
