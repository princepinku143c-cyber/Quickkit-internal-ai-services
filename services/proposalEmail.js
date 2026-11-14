import { escapeHtml, safeText } from "../api/_lib/input.js";

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function normalizeText(value, maxLength) {
  return safeText(value, maxLength)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate proposal fields and render all caller-controlled values as HTML text.
 * The returned recipient is a plain mailbox address, not a display-name header.
 */
export function buildProposalEmail(payload = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Proposal payload must be an object.");
  }

  const { email, name, price, features } = payload;
  if (typeof email !== "string" || email.length > 254 || /[\r\n]/.test(email)) {
    throw new TypeError("A valid recipient email is required.");
  }
  const to = email.trim();
  if (!EMAIL_PATTERN.test(to)) {
    throw new TypeError("A valid recipient email is required.");
  }

  const displayName = normalizeText(name, 120);
  const priceLabel = normalizeText(price, 40);
  if (!displayName || !priceLabel) {
    throw new TypeError("Proposal name and price are required.");
  }
  if (!Array.isArray(features) || features.length > 20) {
    throw new TypeError("Proposal features must contain no more than 20 items.");
  }

  const safeFeatures = features.map((feature) => {
    if (typeof feature !== "string" && typeof feature !== "number") {
      throw new TypeError("Proposal features must be text values.");
    }
    const normalized = normalizeText(feature, 240);
    if (!normalized) throw new TypeError("Proposal features cannot be empty.");
    return normalized;
  });

  const featureItems = safeFeatures.map((feature) =>
    '<li style="margin-bottom: 8px;"><strong>' + escapeHtml(feature) + "</strong></li>"
  ).join("");

  const html = [
    '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">',
    '<h2 style="color: #2563eb;">Your Custom AI System Blueprint</h2>',
    "<p>Hi ", escapeHtml(displayName), ",</p>",
    "<p>Our architectural team has reviewed your requirements. We’ve designed a custom AI engineering system specifically for your business:</p>",
    '<ul style="background: #f8fafc; padding: 20px 40px; border-radius: 8px; border: 1px solid #e2e8f0;">',
    featureItems,
    "</ul>",
    '<div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #2563eb;">',
    '<h3 style="margin: 0 0 10px 0;">Estimated Fixed Build Cost: $', escapeHtml(priceLabel), "</h3>",
    '<p style="margin: 0; font-size: 14px; color: #475569;"><em>This pricing is customized exactly based on your scoped requirements to ensure maximum ROI.</em></p>',
    "</div>",
    '<p style="margin-top: 30px;">To begin development and secure your VPS node, please complete the initial $299 engineering advance.</p>',
    '<a href="https://quickkitai.com/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Initialize Build Process</a>',
    '<p style="margin-top: 40px; font-size: 12px; color: #64748b;">Best regards,<br/>QuickKit AI Architect Team<br/>support@quickkitai.com</p>',
    "</div>"
  ].join("");

  return { to, html };
}
