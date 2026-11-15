import { escapeHtml, safeText } from "../api/_lib/input.js";

function normalizeIdentity(value, fallback, maxLength = 254) {
  const normalized = safeText(value, maxLength)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || fallback;
}

/**
 * Build a safe, identity-bound credit-request notification.
 * The caller must pass identity claims from a verified Firebase ID token;
 * request-body email/name fields must never be treated as authenticated.
 */
export function buildCreditRequestNotification({ amount, email, displayName } = {}) {
  const numericAmount = typeof amount === "number"
    ? amount
    : typeof amount === "string" && amount.trim()
      ? Number(amount)
      : Number.NaN;

  const cents = Math.round(numericAmount * 100);
  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    !Number.isSafeInteger(cents) ||
    cents < 1 ||
    Math.abs(numericAmount * 100 - cents) > 1e-7
  ) {
    throw new TypeError("Amount must be a positive monetary value with at most two decimal places.");
  }

  const credits = numericAmount * 10;
  const creditCents = Math.round(credits * 100);
  if (!Number.isFinite(credits) || !Number.isSafeInteger(creditCents)) {
    throw new TypeError("Credit request amount is outside the supported range.");
  }

  const safeEmail = normalizeIdentity(email, "Not provided", 254);
  const safeDisplayName = normalizeIdentity(displayName, "QuickKit client", 120);
  const amountLabel = numericAmount.toFixed(2);
  const creditsLabel = credits.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return {
    amount: numericAmount,
    credits,
    email: safeEmail,
    displayName: safeDisplayName,
    subject: `New Credit Purchase Request ($${amountLabel})`,
    html: `
      <h3>New Credit Purchase Request</h3>
      <p><strong>Client:</strong> ${escapeHtml(safeDisplayName)} (${escapeHtml(safeEmail)})</p>
      <p><strong>Amount:</strong> $${amountLabel}</p>
      <p><strong>Credits to Inject:</strong> ${creditsLabel}</p>
      <hr/>
      <p>Please log in to the Admin Portal to approve this request and send a payment link.</p>
    `,
  };
}
