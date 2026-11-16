import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { escapeHtml, getClientIp, isPlainObject, payloadTooLarge, safeMetadata, safeNumber, safeText } from "../api/_lib/input.js";
import { getMissingFirebaseClientConfig, isFirebaseClientConfigComplete } from "../lib/firebaseConfig.js";
import { getPublicSystemError } from "../api/_lib/systemErrors.js";
import { logSafeError, safeErrorType } from "../api/_lib/safeErrorLog.js";
import { checkRateLimit } from "../api/_lib/security.js";
import { SYSTEM_ACTION_METHODS, getSystemActionMethods } from "../api/_lib/systemActionMethods.js";
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

const expectedSystemActions = [
  "stats", "add-credits", "redeem-code", "credit-request",
  "generate-payment-token", "verify-payment-token", "project-quote",
  "project-update", "project-status", "lead",
];
assert.deepEqual(
  Object.keys(SYSTEM_ACTION_METHODS).sort(),
  [...expectedSystemActions].sort(),
  "every system API action must have an explicit HTTP method policy",
);
assert.deepEqual(getSystemActionMethods("stats"), ["GET", "POST"],
  "stats remains compatible with GET and POST callers");
for (const action of expectedSystemActions.filter((name) => name !== "stats")) {
  assert.deepEqual(getSystemActionMethods(action), ["POST"], action + " must be POST-only");
}
assert.equal(getSystemActionMethods("__proto__"), null, "prototype properties are not valid actions");
assert.equal(getSystemActionMethods("constructor"), null, "inherited constructor is not a valid action");
assert.ok(systemApiSource.includes("Object.prototype.hasOwnProperty.call(actionMap, action)"),
  "system API dispatch must reject inherited object properties");
assert.ok(systemApiSource.includes("const allowedMethods = getSystemActionMethods(action)"),
  "system API must consult the explicit method policy");
assert.ok(systemApiSource.includes("!allowedMethods.includes(req.method)"),
  "system API must reject methods not allowed for the selected action");
assert.match(systemApiSource, /Access-Control-Allow-Methods', 'GET,POST,OPTIONS'/,
  "CORS must advertise only the methods the system API supports");
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

const aiApiSource = readFileSync(new URL("../api/ai.js", import.meta.url), "utf8");
assert.ok(
  !aiApiSource.includes("return error(res, e.message"),
  "AI API must not return raw provider or infrastructure exceptions",
);
assert.ok(
  !aiApiSource.includes('console.error("AI_CLUSTER_CRASH:", err);')
    && !aiApiSource.includes('console.error("KELLY_ERROR:", e);'),
  "AI API must not log raw identity or provider exception objects",
);
assert.ok(
  aiApiSource.includes('return error(res, "Too many requests. Please try again later.", 429);')
    && aiApiSource.includes('return error(res, "AI service temporarily unavailable. Please try again later.", 503);'),
  "AI API must preserve safe rate-limit and unavailable responses",
);


const safeError = new Error("private provider response and request diagnostics");
assert.equal(safeErrorType(safeError), "Error");
assert.equal(safeErrorType({ name: "TypeError", message: "private details" }), "TypeError");
assert.equal(safeErrorType({ name: "token-value\\nforged" }), "Error");
const originalConsoleError = console.error;
const capturedSafeLogs = [];
console.error = (...args) => capturedSafeLogs.push(args);
try {
  logSafeError("OUTREACH_CRASH", safeError);
  logSafeError("untrusted context\\nvalue", { name: "private-message" });
} finally {
  console.error = originalConsoleError;
}
assert.deepEqual(
  capturedSafeLogs,
  [["[OUTREACH_CRASH]", "Error"], ["[API_ERROR]", "Error"]],
  "safe error logging must emit only a bounded context and error class, never message or stack",
);

const errorLogSources = [
  ["outreach", readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8")],
  ["webhook", readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8")],
  ["projects", readFileSync(new URL("../api/projects.js", import.meta.url), "utf8")],
  ["proposal", readFileSync(new URL("../api/send-proposal.js", import.meta.url), "utf8")],
  ["lead-submit", readFileSync(new URL("../api/lead-submit.js", import.meta.url), "utf8")],
];
for (const [label, source] of errorLogSources) {
  assert.doesNotMatch(
    source,
    /console\.(?:error|warn)\s*\([^;\n]*,\s*(?:err|e|error|odooErr|apiErr)\s*\)/,
    label + " API must not log raw exception objects",
  );
  assert.doesNotMatch(
    source,
    /console\.(?:error|warn)\s*\([^;\n]*\.message/,
    label + " API must not log raw exception messages",
  );
}
assert.ok(!errorLogSources[0][1].includes("errText"), "outreach provider error bodies must not be logged");
assert.ok(!errorLogSources[4][1].includes("lastError: String(error?.message"),
  "customer-readable lead metadata must not persist raw email provider diagnostics");

const proposalApiSource = readFileSync(new URL("../api/send-proposal.js", import.meta.url), "utf8");
assert.ok(proposalApiSource.includes('import { escapeHtml } from "./_lib/input.js";'));
assert.ok(proposalApiSource.includes("const safeName = escapeHtml(name);"));
assert.ok(proposalApiSource.includes("const safePrice = escapeHtml(price);"));
assert.ok(proposalApiSource.includes("const safeFeatures = features.map((feature) => escapeHtml(feature));"));
assert.ok(proposalApiSource.includes("Hi ${safeName},"));
assert.ok(proposalApiSource.includes("&#36;${safePrice}"));
assert.ok(proposalApiSource.includes("${safeFeatures.map((feature)"));
assert.ok(!proposalApiSource.includes("Hi ${name},"), "proposal email must not interpolate raw recipient name");
assert.ok(!proposalApiSource.includes("${f}</strong>"), "proposal email must not interpolate raw feature text");
assert.ok(!proposalApiSource.includes("Build Cost: ${price}"), "proposal email must not interpolate raw price text");

// Google lead-form sign-in may provision a missing client profile, but must never
// merge role: "client" into an existing profile (which could downgrade an admin).
const leadFormSource = readFileSync(new URL("../components/LeadForm.tsx", import.meta.url), "utf8");
const googleAutofillHandler = leadFormSource.match(/const handleGoogleAutofill\s*=\s*async\s*\(\)\s*=>\s*\{([\s\S]*?)\n\s*\};/);
assert.ok(googleAutofillHandler, "LeadForm Google autofill handler must remain present");
assert.match(googleAutofillHandler[1], /const userSnap\s*=\s*await getDoc\(userRef\)/,
  "Google autofill must check whether a profile already exists before writing");
assert.match(googleAutofillHandler[1], /if\s*\(\s*!userSnap\.exists\(\)\s*\)\s*\{[\s\S]*?await setDoc\(userRef/,
  "Google autofill may create a client profile only when the profile is missing");
assert.match(googleAutofillHandler[1], /role\s*:\s*['"]client['"]/,
  "new Google profiles must receive only the client role");
assert.doesNotMatch(googleAutofillHandler[1], /\{\s*merge\s*:\s*true\s*\}/,
  "Google autofill must not merge defaults into an existing profile");




// Admin and customer email templates must HTML-encode every untrusted field
// before interpolation. This covers the legacy system API alongside send-proposal.
function extractHandler(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0, label + " handler must remain present");
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start, label + " handler boundary must remain present");
  return source.slice(start, end);
}

function assertEmailTemplateEscapes(handlerSource, label, safeFields, rawFields) {
  const marker = "html: `";
  const start = handlerSource.indexOf(marker);
  assert.ok(start >= 0, label + " HTML email template must remain present");
  const end = handlerSource.indexOf("`", start + marker.length);
  assert.ok(end > start, label + " HTML email template must be closed");
  const html = handlerSource.slice(start + marker.length, end);

  for (const field of safeFields) {
    assert.ok(html.includes("${" + field + "}"), label + " must interpolate escaped " + field);
  }
  for (const field of rawFields) {
    assert.ok(!html.includes("${" + field + "}"), label + " must not interpolate raw " + field);
  }
}

assertEmailTemplateEscapes(
  extractHandler(systemApiSource, "async function handleCreditRequest", "async function handleGenerateToken", "credit request"),
  "credit request",
  ["safeDisplayName", "safeEmail", "safeAmount", "safeCredits"],
  ["displayName", "email", "amount", "amount * 10"],
);
assertEmailTemplateEscapes(
  extractHandler(systemApiSource, "async function handleProjectQuote", "async function handleProjectUpdate", "project quote"),
  "project quote",
  ["safeProjectName", "safePrice", "safeTimeline", "safeNotes"],
  ["projectName", "quote.price", "quote.timeline", "quote.notes"],
);
assertEmailTemplateEscapes(
  extractHandler(systemApiSource, "async function handleProjectUpdate", "async function handleProjectStatus", "project update"),
  "project update",
  ["safeProjectName", "safeProgress", "safeMessage"],
  ["projectName", "progress", "message"],
);


// Rate-limit backend diagnostics must never be copied into application logs.
const previousConsoleErrorForRateLimit = console.error;
const rateLimitLogEntries = [];
console.error = (...args) => rateLimitLogEntries.push(args);
try {
  const failingRateLimitAdmin = {
    firestore() {
      return {
        collection: () => ({ doc: () => ({}) }),
        runTransaction: async () => {
          throw new Error("private Firestore connection and credential diagnostics");
        },
      };
    },
  };

  await assert.rejects(
    checkRateLimit(failingRateLimitAdmin, "test-user", "test-action"),
    /Rate limiting is temporarily unavailable/,
  );
} finally {
  console.error = previousConsoleErrorForRateLimit;
}
assert.deepEqual(
  rateLimitLogEntries,
  [["[RATE_LIMIT_UNAVAILABLE]", "Error"]],
  "rate limiter logs must contain only the bounded error type, never backend exception details",
);
assert.ok(
  !JSON.stringify(rateLimitLogEntries).includes("private Firestore connection and credential diagnostics"),
  "raw Firestore diagnostics must not appear in rate limiter logs",
);


// Client authentication must never carry an admin allowlist or call
// provisioning actions that are not implemented by the server API.
const loginSource = readFileSync(new URL("../components/Login.tsx", import.meta.url), "utf8");
assert.doesNotMatch(
  loginSource,
  /targetEmails|setup-admin/,
  "admin promotion must not be controlled by a client-side email allowlist",
);
assert.doesNotMatch(
  loginSource,
  /welcome-email/,
  "the client must not call an unimplemented welcome-email action",
);
assert.doesNotMatch(
  loginSource,
  /role\s*:\s*["']admin["']/,
  "client authentication must never assign an admin role",
);
