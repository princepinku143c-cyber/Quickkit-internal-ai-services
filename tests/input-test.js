import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { escapeHtml, getClientIp, isPlainObject, payloadTooLarge, safeMetadata, safeNumber, safeText } from "../api/_lib/input.js";
import { getMissingFirebaseClientConfig, isFirebaseClientConfigComplete } from "../lib/firebaseConfig.js";
import { getPublicSystemError } from "../api/_lib/systemErrors.js";
assert.equal(isPlainObject({ a: 1 }), true);
assert.equal(isPlainObject([]), false);
assert.equal(isPlainObject(null), false);
assert.equal(safeText({ a: 1 }, 10), "");
assert.equal(safeText("  abc  ", 3), "abc");
assert.equal(safeNumber("125.5"), 125.5);
assert.equal(safeNumber("Infinity", 0), 0);
assert.deepEqual(safeMetadata(["not", "an", "object"]), {});
const metadata = JSON.parse('{"allowed":"ok","count":3,"flag":true,"huge":{"nested":true},"__proto__":"blocked","has spaces":"blocked"}');
assert.deepEqual(safeMetadata(metadata), { allowed: "ok", count: 3, flag: true });
assert.equal(payloadTooLarge({ x: "a".repeat(100) }, 50), true);
assert.equal(payloadTooLarge({ x: "small" }, 100), false);
assert.equal(getClientIp({ headers: { "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.8, 203.0.113.7" } }), "203.0.113.7");
assert.equal(getClientIp({ headers: { "x-forwarded-for": "198.51.100.8, 203.0.113.7" } }), "198.51.100.8");
assert.equal(escapeHtml("<img src=\"x\" onerror='x'>"), "&lt;img src=&quot;x&quot; onerror=&#39;x&#39;&gt;");
const completeFirebaseClientConfig = {
  apiKey: "public-key",
  authDomain: "quickkit-preview.firebaseapp.com",
  projectId: "quickkit-preview",
  appId: "1:123456789:web:abcdef",
};
assert.equal(isFirebaseClientConfigComplete(completeFirebaseClientConfig), true);
assert.deepEqual(getMissingFirebaseClientConfig(completeFirebaseClientConfig), []);
assert.deepEqual(
  getMissingFirebaseClientConfig({ apiKey: "public-key" }),
  ["authDomain", "projectId", "appId"],
);
for (const requiredField of ["apiKey", "authDomain", "projectId", "appId"]) {
  const incomplete = { ...completeFirebaseClientConfig, [requiredField]: "   " };
  assert.equal(isFirebaseClientConfigComplete(incomplete), false, requiredField + " must be required");
  assert.ok(getMissingFirebaseClientConfig(incomplete).includes(requiredField));
}
assert.equal(isFirebaseClientConfigComplete(null), false);

const systemApiSource = readFileSync(new URL("../api/system.js", import.meta.url), "utf8");
assert.match(
  systemApiSource,
  /catch\s*\{\s*\/\/ Do not expose Firebase token-verification details to API callers\.\s*return error\(res, "Authentication failed", 401\);/s,
  "invalid Firebase bearer tokens must receive a generic authentication error",
);
assert.doesNotMatch(
  systemApiSource,
  /Authentication Failed:\s*"\s*\+\s*e\.message/,
  "Firebase verification details must never be echoed to callers",
);

assert.ok(
  systemApiSource.includes("const adminActions = ['stats',"),
  "global lead/project aggregate counts must be admin-only",
);


const vpsAutomationSource = readFileSync(new URL("../vps-automation/server.js", import.meta.url), "utf8");
assert.ok(
  vpsAutomationSource.includes("process.env.VPS_AUTOMATION_TOKEN"),
  "VPS automation must read its bearer token from the server environment",
);
assert.ok(
  vpsAutomationSource.includes("timingSafeEqual"),
  "VPS automation token comparisons must use a constant-time comparison",
);
assert.ok(
  !vpsAutomationSource.includes('const AUTH_TOKEN = "')
    && !vpsAutomationSource.includes("const AUTH_TOKEN = '"),
  "VPS automation must not contain a hardcoded bearer token",
);

assert.equal(
  existsSync(new URL("../scratch/test-firebase.js", import.meta.url)),
  false,
  "the scratch Firebase test containing a service-account key must remain absent",
);


const outreachApiSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
assert.doesNotMatch(
  outreachApiSource,
  /return error\(res, err\.message, 500\)/,
  "outreach API must not return internal exception messages to HTTP callers",
);
assert.doesNotMatch(
  outreachApiSource,
  /error:\s*(?:e|err)\.message|\$\{e\.message\}/,
  "outreach queue and Telegram responses must not expose raw internal exception messages",
);
assert.doesNotMatch(
  outreachApiSource,
  /\$\{targetUrl\}/,
  "scraper failure logs must not print user-supplied URLs that may contain credentials or tokens",
);

const firebaseAdminSource = readFileSync(new URL("../api/_lib/firebaseAdmin.js", import.meta.url), "utf8");
assert.match(
  firebaseAdminSource,
  /Firebase Admin initialization failed\. Check server-side Firebase Admin configuration\./,
  "Firebase Admin initialization failures must log a generic operator-facing message",
);
assert.doesNotMatch(
  firebaseAdminSource,
  /Firebase Admin initialization failed:\s*.*(?:error\.message|:\s*error)/s,
  "Firebase Admin initialization must not log raw exception details that may contain credential diagnostics",
);

assert.equal(
  existsSync(new URL("../api/services", import.meta.url)),
  false,
  "helper modules must not live in api/services because Vercel treats non-underscore API files as routes",
);
assert.equal(
  existsSync(new URL("../api/_lib/services/aiService.js", import.meta.url)),
  true,
  "AI service helper must remain available under the underscore-prefixed private library directory",
);
assert.equal(
  existsSync(new URL("../api/_lib/services/leadService.js", import.meta.url)),
  true,
  "lead service helper must remain available under the underscore-prefixed private library directory",
);


const internalSystemError = new Error("Firestore permission denied: internal project diagnostics");
assert.deepEqual(
  getPublicSystemError(internalSystemError),
  { status: 500, message: "Request could not be completed." },
  "unexpected system API errors must not expose internal exception details",
);
assert.deepEqual(
  getPublicSystemError(Object.assign(new Error("rate limit details"), { status: 429 })),
  { status: 429, message: "Too many requests. Please try again later." },
);
assert.deepEqual(
  getPublicSystemError(Object.assign(new Error("backend diagnostics"), { status: 503 })),
  { status: 503, message: "Service temporarily unavailable. Please try again later." },
);
assert.deepEqual(
  getPublicSystemError(new Error("Invalid promo code."), "Unable to redeem promo code."),
  { status: 400, message: "Invalid promo code." },
  "known promo validation errors must retain their safe client-facing message",
);
assert.deepEqual(
  getPublicSystemError(new Error("private Firestore path"), "Unable to redeem promo code."),
  { status: 500, message: "Unable to redeem promo code." },
);
assert.ok(
  !systemApiSource.includes("return error(res, e.message"),
  "system API must never return raw exception messages",
);
for (const rawErrorLog of [
  "console.error(\`❌ Failed to generate AI draft for lead \${leadId}:\`, err);",
  'console.error("Failed to fetch user niche for tagging:", userErr);',
  'console.error("❌ Failed to sync lead to Odoo CRM:", odooError);',
]) {
  assert.ok(!systemApiSource.includes(rawErrorLog), "system API must not log raw downstream exception objects");
}

console.log("Security input-helper, API auth-redaction, and source-credential regression tests passed.");
