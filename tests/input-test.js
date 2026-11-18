import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { escapeHtml, getClientIp, isPlainObject, normalizeCreditAdjustment, normalizeCreditPackage, normalizeFirestoreDocumentId, payloadTooLarge, safeMetadata, safeNumber, safeText } from "../api/_lib/input.js";
import { getMissingFirebaseClientConfig, isFirebaseClientConfigComplete } from "../lib/firebaseConfig.js";
import { normalizeProjectCreateInput } from "../api/_lib/projectInput.js";
import { getPublicSystemError } from "../api/_lib/systemErrors.js";
import { logSafeError, safeErrorType } from "../api/_lib/safeErrorLog.js";
import { checkRateLimit } from "../api/_lib/security.js";
import { fetchPublicWebsite, isPublicIpAddress, resolvePublicWebsiteTarget } from "../api/_lib/safeWebsiteFetch.js";
import { SYSTEM_ACTION_METHODS, getSystemActionMethods } from "../api/_lib/systemActionMethods.js";
import { constantTimeSecretEqual } from "../api/_lib/constantTimeSecret.js";
import outreachHandler from "../api/outreach.js";
assert.equal(isPlainObject({ a: 1 }), true);
assert.equal(isPlainObject([]), false);
assert.equal(isPlainObject(null), false);
assert.equal(safeText({ a: 1 }, 10), "");
assert.equal(safeText("  abc  ", 3), "abc");
assert.equal(safeNumber("125.5"), 125.5);
assert.equal(safeNumber("Infinity", 0), 0);
assert.deepEqual(normalizeCreditPackage(1000, 5), { credits: 1000, price: 5 });
assert.deepEqual(normalizeCreditPackage(10000, 40), { credits: 10000, price: 40 });
assert.deepEqual(normalizeCreditPackage(100, 1), { credits: 100, price: 1 });
assert.deepEqual(normalizeCreditPackage("5000", "50"), { credits: 5000, price: 50 });
for (const [credits, price] of [
  [1000, 1], [5000, 5], [5000, 10], [1.5, 1], [0, 1], [-1, 1],
  [1000000001, 10000001], [100, 0], ["", 1], [true, 1], [100, Infinity],
]) {
  assert.equal(normalizeCreditPackage(credits, price), null, "invalid credit package must be rejected");
}
assert.deepEqual(normalizeCreditAdjustment("  alice  ", 1000), { targetUserId: "alice", amount: 1000 });
assert.deepEqual(normalizeCreditAdjustment("alice", "25"), { targetUserId: "alice", amount: 25 });
for (const [userId, amount] of [
  [null, 10], ["", 10], ["   ", 10], ["alice/bob", 10], ["x".repeat(129), 10],
  ["alice", 0], ["alice", -1], ["alice", 1.5], ["alice", Infinity],
  ["alice", NaN], ["alice", ""], ["alice", "Infinity"], ["alice", "1.5"],
  ["alice", 1000000001], ["alice", true],
]) {
  assert.equal(normalizeCreditAdjustment(userId, amount), null, "invalid admin credit adjustment must be rejected");
}
assert.deepEqual(safeMetadata(["not", "an", "object"]), {});
const metadata = JSON.parse('{"allowed":"ok","count":3,"flag":true,"huge":{"nested":true},"__proto__":"blocked","has spaces":"blocked"}');
assert.deepEqual(safeMetadata(metadata), { allowed: "ok", count: 3, flag: true });
assert.equal(payloadTooLarge({ x: "a".repeat(100) }, 50), true);
assert.equal(payloadTooLarge({ x: "small" }, 100), false);
assert.equal(getClientIp({ headers: { "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.8, 203.0.113.7" } }), "203.0.113.7");
assert.equal(getClientIp({ headers: { "x-real-ip": "2001:db8::7" } }), "2001:db8::7");
assert.equal(getClientIp({ headers: { "x-forwarded-for": "198.51.100.8, 203.0.113.7" } }), "198.51.100.8");
assert.equal(
  getClientIp({ headers: { "x-real-ip": "not/an/ip", "x-forwarded-for": "198.51.100.8, 203.0.113.7" } }),
  "198.51.100.8",
  "invalid proxy IP headers must not become Firestore rate-limit document IDs",
);
assert.equal(
  getClientIp({ headers: { "x-real-ip": "not/an/ip", "x-forwarded-for": "also/not/an/ip" }, socket: { remoteAddress: "192.0.2.10" } }),
  "192.0.2.10",
  "invalid proxy headers must fall back to a valid socket address",
);
assert.equal(
  getClientIp({ headers: { "x-real-ip": "not/an/ip", "x-forwarded-for": "also/not/an/ip" } }),
  "unknown",
  "invalid IP values must never be used as rate-limit keys",
);
assert.equal(
  getClientIp({ headers: { "x-real-ip": ["203.0.113.7"] }, socket: { remoteAddress: "192.0.2.11" } }),
  "192.0.2.11",
  "non-string proxy headers must be ignored",
);
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

const productionEnvTemplate = readFileSync(new URL("../.env.production.example", import.meta.url), "utf8");
for (const requiredEnvName of [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
]) {
  assert.match(
    productionEnvTemplate,
    new RegExp(`^${requiredEnvName}=`, "m"),
    `production environment template must document ${requiredEnvName}`,
  );
}


assert.deepEqual(
  normalizeProjectCreateInput({ projectName: "QuickKit CRM", packageId: "starter", price: 1200 }),
  { projectName: "QuickKit CRM", packageId: "starter", price: 1200 },
);
assert.deepEqual(
  normalizeProjectCreateInput({ projectName: "  QuickKit CRM  ", packageId: " starter ", price: "1200.50" }),
  { projectName: "QuickKit CRM", packageId: "starter", price: 1200.5 },
);
for (const invalidProject of [
  null,
  [],
  "not-an-object",
  { projectName: "ab", packageId: "starter", price: 100 },
  { projectName: "QuickKit", packageId: "", price: 100 },
  { projectName: "QuickKit", packageId: {}, price: 100 },
  { projectName: "QuickKit", packageId: "starter", price: true },
  { projectName: "QuickKit", packageId: "starter", price: null },
  { projectName: "QuickKit", packageId: "starter", price: "" },
  { projectName: "QuickKit", packageId: "starter", price: "Infinity" },
  { projectName: "QuickKit", packageId: "starter", price: Infinity },
  { projectName: "QuickKit", packageId: "starter", price: NaN },
  { projectName: "QuickKit", packageId: "starter", price: 0 },
  { projectName: "QuickKit", packageId: "starter", price: -1 },
  { projectName: "QuickKit", packageId: "starter", price: Number.MAX_SAFE_INTEGER + 1 },
]) {
  assert.equal(normalizeProjectCreateInput(invalidProject), null, "malformed project input must be rejected");
}
const projectApiSource = readFileSync(new URL("../api/projects.js", import.meta.url), "utf8");
const projectAuthHeaderGuardIndex = projectApiSource.indexOf('if (!authHeader || !authHeader.startsWith("Bearer "))');
const projectFirebaseReadyGuardIndex = projectApiSource.indexOf("if (!admin.apps.length)");
const projectTokenVerificationIndex = projectApiSource.indexOf("await admin.auth().verifyIdToken(idToken)");
assert.ok(
  projectAuthHeaderGuardIndex >= 0
    && projectFirebaseReadyGuardIndex > projectAuthHeaderGuardIndex
    && projectFirebaseReadyGuardIndex < projectTokenVerificationIndex,
  "projects API must return service-unavailable before token verification when Firebase Admin is not initialized",
);
assert.ok(
  projectApiSource.includes('return error(res, "Project service is temporarily unavailable.", 503);'),
  "projects API must report missing Firebase Admin configuration as HTTP 503",
);
assert.ok(projectApiSource.includes("normalizeProjectCreateInput(req.body)"),
  "project creation API must use the strict input normalizer");
assert.doesNotMatch(projectApiSource, /const validPrice = Number\(price\)/,
  "project creation API must not accept unchecked numeric coercion");

const projectRateLimitIndex = projectApiSource.indexOf(
  'await checkRateLimit(admin, userId, "project-create", 5)',
);
const projectCreateIndex = projectApiSource.indexOf("return handleCreateProject(req, res, userId)");
assert.ok(
  projectRateLimitIndex >= 0 && projectRateLimitIndex < projectCreateIndex,
  "authenticated project creation must be rate-limited before writing a project",
);
assert.ok(
  projectApiSource.includes('err?.status === 429')
    && projectApiSource.includes('err?.status === 503')
    && projectApiSource.includes('res.setHeader("Retry-After", String(err.retryAfter))'),
  "project creation must preserve safe 429/503 responses and Retry-After",
);

assert.equal(normalizeFirestoreDocumentId("client-123"), "client-123");
assert.equal(normalizeFirestoreDocumentId("  client-123  "), "client-123");
for (const invalidDocumentId of [
  null,
  ["client-123"],
  "",
  "   ",
  "tenant/client-123",
  "x".repeat(129),
]) {
  assert.equal(
    normalizeFirestoreDocumentId(invalidDocumentId, 128),
    "",
    "invalid Firestore document IDs must be rejected instead of being truncated or used as paths",
  );
}
const webhookApiSource = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
assert.ok(
  webhookApiSource.includes("normalizeFirestoreDocumentId(req.query.client_id || req.query.uid, 128)"),
  "webhook tenant lookup must reject invalid or overlong Firestore document IDs",
);
assert.ok(webhookApiSource.includes("getOrCreateWebhookSubmission"),
  "webhook must use the tenant-scoped atomic lead/project idempotency helper");
assert.ok(webhookApiSource.includes('req.headers?.["idempotency-key"] ?? data.idempotencyKey'),
  "webhook must accept an optional Idempotency-Key header or body field");
assert.ok(webhookApiSource.includes("Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret, Idempotency-Key'"),
  "webhook CORS must allow the optional Idempotency-Key header");
assert.ok(webhookApiSource.includes("const budgetVal = safeNumber(data.budget)"),
  "webhook must calculate the bounded lead budget before constructing the lead");
assert.ok(webhookApiSource.includes("const custom_metadata = safeMetadata("),
  "webhook must sanitize custom metadata before writing");
assert.ok(webhookApiSource.includes("'idempotencyKey'"),
  "webhook idempotency keys must not be copied into custom metadata");
assert.ok(webhookApiSource.includes('status: created ? "LEAD_INGESTED" : "LEAD_ALREADY_RECEIVED"'),
  "webhook replays must return the existing lead/project status");

const systemApiSource = readFileSync(new URL("../api/system.js", import.meta.url), "utf8");
const addCreditsHandlerStart = systemApiSource.indexOf("async function handleAddCredits");
const addCreditsHandlerEnd = systemApiSource.indexOf("async function handleRedeemCode", addCreditsHandlerStart);
const addCreditsHandler = systemApiSource.slice(addCreditsHandlerStart, addCreditsHandlerEnd);
assert.ok(addCreditsHandler.includes("normalizeCreditAdjustment(targetUserId, amount)"),
  "admin credit adjustment must validate the target UID and whole-number amount");
assert.ok(addCreditsHandler.includes('if (!doc.exists) return "not_found"'),
  "admin credit adjustment must not dereference a missing user profile");
assert.ok(addCreditsHandler.includes("Number.isSafeInteger(current)"),
  "admin credit adjustment must reject invalid stored balances");
const outreachMethodSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
const creditWalletSource = readFileSync(new URL("../components/CreditWallet.tsx", import.meta.url), "utf8");
const creditRequestHandlerStart = systemApiSource.indexOf("async function handleCreditRequest");
const creditRequestHandlerEnd = systemApiSource.indexOf("async function handleGenerateToken", creditRequestHandlerStart);
const creditRequestHandler = systemApiSource.slice(creditRequestHandlerStart, creditRequestHandlerEnd);
assert.ok(creditRequestHandlerStart >= 0 && creditRequestHandlerEnd > creditRequestHandlerStart,
  "credit request handler must remain present");
assert.ok(creditRequestHandler.includes("normalizeCreditPackage(credits, price)"),
  "credit request API must validate the exact credits/price package");
assert.ok(creditRequestHandler.includes("authContext?.email"),
  "credit request email must come from the verified Firebase ID token");
assert.ok(creditWalletSource.includes("/api/system?action=credit-request"),
  "CreditWallet must call the implemented credit-request action");
assert.doesNotMatch(creditWalletSource, /action=trigger|addDoc|collection\(db/,
  "CreditWallet must not call an unsupported action or create duplicate client-side requests");

assert.ok(outreachMethodSource.includes('"telegram-webhook": ["POST"]'),
  "Telegram webhook must accept POST only");
assert.ok(outreachMethodSource.includes('"process-queue": ["GET", "POST"]'),
  "Vercel Cron GET and manual POST must remain supported for queue processing");
for (const action of ["analyze", "approve", "reject"]) {
  assert.ok(outreachMethodSource.includes(action + ': ["POST"]'),
    action + " must be POST-only");
}
assert.ok(outreachMethodSource.includes('"add-lead": ["POST"]'),
  "add-lead must be POST-only");
assert.ok(outreachMethodSource.includes("Object.prototype.hasOwnProperty.call(actionMethods, action)"),
  "outreach dispatch must reject inherited object properties");
assert.ok(outreachMethodSource.includes("!allowedMethods.includes(req.method)"),
  "outreach actions must reject methods outside their allowlist");
assert.ok(outreachMethodSource.includes('Access-Control-Allow-Methods", "GET,POST,OPTIONS"'),
  "outreach CORS must advertise only supported methods");

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


// Exercise the actual rate-limit transaction behavior with an isolated in-memory Firestore fake.
function createInMemoryRateLimitAdmin() {
  const documents = new Map();
  return {
    firestore() {
      return {
        collection(name) {
          return {
            doc(id) {
              return { path: `${name}/${id}` };
            },
          };
        },
        async runTransaction(callback) {
          const transaction = {
            async get(reference) {
              const stored = documents.get(reference.path);
              return { data: () => stored ? { ...stored } : undefined };
            },
            set(reference, value) {
              documents.set(reference.path, { ...value });
            },
          };
          return callback(transaction);
        },
      };
    },
  };
}

const originalDateNowForRateLimit = Date.now;
let controlledRateLimitNow = 1_000_000;
Date.now = () => controlledRateLimitNow;
try {
  const inMemoryRateLimitAdmin = createInMemoryRateLimitAdmin();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    assert.equal(
      await checkRateLimit(inMemoryRateLimitAdmin, "203.0.113.7", "webhook-auth", 30),
      true,
      "the first 30 authentication attempts in a window must be allowed",
    );
  }

  await assert.rejects(
    checkRateLimit(inMemoryRateLimitAdmin, "203.0.113.7", "webhook-auth", 30),
    (error) => error?.status === 429 && error?.retryAfter === 60,
    "the 31st attempt must be rejected with a 60-second retry window",
  );

  assert.equal(
    await checkRateLimit(inMemoryRateLimitAdmin, "203.0.113.8", "webhook-auth", 30),
    true,
    "a different source IP must have an independent rate-limit bucket",
  );
  assert.equal(
    await checkRateLimit(inMemoryRateLimitAdmin, "203.0.113.7", "different-action", 30),
    true,
    "a different action must have an independent rate-limit bucket",
  );

  controlledRateLimitNow += 60_000;
  assert.equal(
    await checkRateLimit(inMemoryRateLimitAdmin, "203.0.113.7", "webhook-auth", 30),
    true,
    "the rate-limit bucket must reset after the one-minute window expires",
  );
} finally {
  Date.now = originalDateNowForRateLimit;
}

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
    (error) => error?.status === 503 && /Rate limiting is temporarily unavailable/.test(error.message),
    "transaction failures must fail closed with HTTP 503",
  );

  const unavailableFirebaseAdmin = {
    firestore() {
      throw new Error("private Firebase Admin initialization diagnostics");
    },
  };
  await assert.rejects(
    checkRateLimit(unavailableFirebaseAdmin, "test-user", "test-action"),
    (error) => error?.status === 503 && /Rate limiting is temporarily unavailable/.test(error.message),
    "Firebase Admin initialization failures must fail closed with HTTP 503",
  );
} finally {
  console.error = previousConsoleErrorForRateLimit;
}
assert.deepEqual(
  rateLimitLogEntries,
  [
    ["[RATE_LIMIT_UNAVAILABLE]", "Error"],
    ["[RATE_LIMIT_UNAVAILABLE]", "Error"],
  ],
  "transaction and Firebase Admin initialization failures must log only a bounded error type",
);
assert.ok(
  !JSON.stringify(rateLimitLogEntries).includes("private Firestore connection and credential diagnostics")
    && !JSON.stringify(rateLimitLogEntries).includes("private Firebase Admin initialization diagnostics"),
  "raw Firestore and Firebase Admin diagnostics must not appear in rate limiter logs",
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
assert.match(
  loginSource,
  /disabled=\{loading \|\| !isFirebaseConfigured\}/,
  "email authentication must be disabled when Firebase client configuration is incomplete",
);
assert.match(
  loginSource,
  /\{!isFirebaseConfigured && \(\s*<div\s+role="status"/,
  "Login must explain why authentication is unavailable in Firebase limited mode",
);
assert.match(
  loginSource,
  /\{isFirebaseConfigured && \(\s*<>[\s\S]*?onClick=\{handleGoogleSignIn\}/,
  "Google sign-in controls must be hidden when Firebase client configuration is incomplete",
);
assert.match(
  loginSource,
  /onClick=\{\(\) => setIsForgotPassword\(true\)\}\s+disabled=\{loading \|\| !isFirebaseConfigured\}/,
  "password reset must be disabled when Firebase client configuration is incomplete",
);

const publicLookup = async (hostname, options) => {
  assert.equal(hostname, "example.com");
  assert.equal(options.all, true);
  return [{ address: "93.184.216.34", family: 4 }];
};

assert.equal(isPublicIpAddress("93.184.216.34"), true);
assert.equal(isPublicIpAddress("127.0.0.1"), false);
assert.equal(isPublicIpAddress("10.0.0.8"), false);
assert.equal(isPublicIpAddress("192.31.196.1"), false);
assert.equal(isPublicIpAddress("192.52.193.1"), false);
assert.equal(isPublicIpAddress("192.175.48.1"), false);
assert.equal(isPublicIpAddress("169.254.169.254"), false);
assert.equal(isPublicIpAddress("::1"), false);
assert.equal(isPublicIpAddress("fc00::1"), false);
assert.equal(isPublicIpAddress("fe80::1"), false);
assert.equal(isPublicIpAddress("2001:db8::1"), false);
assert.equal(isPublicIpAddress("2001:2::1"), false);
assert.equal(isPublicIpAddress("2001:10::1"), false);
assert.equal(isPublicIpAddress("2001:20::1"), false);
assert.equal(isPublicIpAddress("3fff::1"), false);
assert.equal(isPublicIpAddress("3fff:0fff:ffff::1"), false);
assert.equal(isPublicIpAddress("2001:4860:4860::8888"), true);
assert.equal(isPublicIpAddress("::ffff:127.0.0.1"), false);

const safeWebsiteTarget = await resolvePublicWebsiteTarget("example.com", { lookup: publicLookup });
assert.equal(safeWebsiteTarget.url.hostname, "example.com");
assert.equal(safeWebsiteTarget.address.address, "93.184.216.34");

for (const unsafeUrl of [
  "http://127.0.0.1",
  "http://[::1]",
  "http://localhost",
  "http://home.arpa",
  "http://router.home.arpa",
  "http://resolver.arpa",
  "http://10.in-addr.arpa",
  "http://ip6.arpa",
  "http://metadata.google.internal",
  "https://user:password@example.com",
  "https://example.com:8443",
  "file:///etc/passwd",
]) {
  assert.equal(await resolvePublicWebsiteTarget(unsafeUrl, { lookup: publicLookup }), null, unsafeUrl);
}

const privateLookup = async () => [{ address: "10.0.0.8", family: 4 }];
const mixedLookup = async () => [
  { address: "93.184.216.34", family: 4 },
  { address: "192.168.1.10", family: 4 },
];
assert.equal(await resolvePublicWebsiteTarget("https://example.com", { lookup: privateLookup }), null);
assert.equal(await resolvePublicWebsiteTarget("https://example.com", { lookup: mixedLookup }), null);

let pinnedRequest;
const publicFetchResult = await fetchPublicWebsite("https://example.com/path", {
  lookup: publicLookup,
  requestImpl: async (target, options) => {
    pinnedRequest = {
      hostname: target.url.hostname,
      address: target.address.address,
      timeoutMs: options.timeoutMs,
      maxBytes: options.maxBytes,
    };
    return { statusCode: 200, headers: { "content-type": "text/html" }, body: "<title>Public</title>" };
  },
});
assert.equal(pinnedRequest.hostname, "example.com");
assert.equal(pinnedRequest.address, "93.184.216.34");
assert.ok(pinnedRequest.timeoutMs > 0 && pinnedRequest.timeoutMs <= 3000);
assert.equal(pinnedRequest.maxBytes, 512 * 1024);
assert.equal(publicFetchResult.body, "<title>Public</title>");

// DNS resolution must not hang the prospect scraper before the HTTP deadline starts.
let lateDnsResolve;
let requestAfterDnsTimeout = false;
const dnsTimeoutStartedAt = Date.now();
const dnsTimeoutResult = await fetchPublicWebsite("https://example.com/dns-timeout", {
  lookup: () => new Promise((resolve) => {
    lateDnsResolve = resolve;
  }),
  timeoutMs: 50,
  requestImpl: async () => {
    requestAfterDnsTimeout = true;
    return { statusCode: 200, headers: {}, body: "unexpected" };
  },
});
assert.equal(dnsTimeoutResult, null);
assert.ok(Date.now() - dnsTimeoutStartedAt < 500, "DNS lookup must be bounded by the configured deadline");
assert.equal(typeof lateDnsResolve, "function");
lateDnsResolve([{ address: "93.184.216.34", family: 4 }]);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(requestAfterDnsTimeout, false, "a late DNS response must not start an HTTP request");

// A peer that continuously trickles data must not extend the scraper's total
// request deadline. The socket inactivity timeout alone is not a hard deadline.
const originalHttpGet = http.get;
let slowResponseTimer;
let slowRequestDestroyed = false;
http.get = (_url, _options, callback) => {
  const request = new EventEmitter();
  request.setTimeout = () => request;
  request.destroy = (error) => {
    slowRequestDestroyed = true;
    if (slowResponseTimer) clearInterval(slowResponseTimer);
    queueMicrotask(() => request.emit("error", error || new Error("destroyed")));
    return request;
  };
  queueMicrotask(() => {
    const response = new EventEmitter();
    response.statusCode = 200;
    response.headers = {};
    response.resume = () => {};
    response.destroy = () => {};
    callback(response);
    slowResponseTimer = setInterval(() => response.emit("data", Buffer.from("x")), 15);
  });
  return request;
};
let slowFetchResult;
try {
  slowFetchResult = await fetchPublicWebsite("http://example.com/slow", {
    lookup: publicLookup,
    timeoutMs: 90,
  });
} finally {
  if (slowResponseTimer) clearInterval(slowResponseTimer);
  http.get = originalHttpGet;
}
assert.equal(slowFetchResult, null);
assert.equal(slowRequestDestroyed, true);

assert.equal(constantTimeSecretEqual("webhook-secret", "webhook-secret"), true);
assert.equal(constantTimeSecretEqual("webhook-secret", "Webhook-secret"), false);
assert.equal(constantTimeSecretEqual("webhook-secret", "webhook-secret-extra"), false);
assert.equal(constantTimeSecretEqual("", ""), false);
assert.equal(constantTimeSecretEqual("webhook-secret", undefined), false);
assert.equal(constantTimeSecretEqual(["webhook-secret"], "webhook-secret"), false);

const telegramWebhookSource = readFileSync(new URL("../api/outreach.js", import.meta.url), "utf8");
const inboundWebhookSource = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
const secretCompareSource = readFileSync(new URL("../api/_lib/constantTimeSecret.js", import.meta.url), "utf8");
assert.ok(secretCompareSource.includes("timingSafeEqual"), "shared webhook secret comparison must use timingSafeEqual");
assert.ok(telegramWebhookSource.includes("constantTimeSecretEqual(expectedSecret, secretParam)"),
  "Telegram webhook must use the constant-time secret helper");
assert.ok(inboundWebhookSource.includes("constantTimeSecretEqual(expectedSecret, suppliedSecret)"),
  "generic inbound webhook must use the constant-time secret helper");
const inboundWebhookRateLimit = inboundWebhookSource.indexOf(
  'await checkRateLimit(admin, getClientIp(req), "webhook-auth", 30)',
);
const inboundWebhookSecretCheck = inboundWebhookSource.indexOf(
  "constantTimeSecretEqual(expectedSecret, suppliedSecret)",
);
assert.ok(
  inboundWebhookRateLimit >= 0 && inboundWebhookRateLimit < inboundWebhookSecretCheck,
  "generic inbound webhook must rate-limit source IP attempts before comparing the secret",
);
const telegramWebhookRateLimit = telegramWebhookSource.indexOf(
  'await checkRateLimit(admin, getClientIp(req), "telegram-webhook-auth", 30)',
);
const telegramWebhookSecretCheck = telegramWebhookSource.indexOf(
  "constantTimeSecretEqual(expectedSecret, secretParam)",
);
assert.ok(
  telegramWebhookRateLimit >= 0 && telegramWebhookRateLimit < telegramWebhookSecretCheck,
  "Telegram webhook must rate-limit source IP attempts before comparing the secret",
);
assert.ok(
  telegramWebhookSource.includes('return error(res, "Too many webhook attempts. Please retry shortly.", 429)'),
  "Telegram webhook must return the rate-limit status instead of masking it as HTTP 500",
);
assert.ok(
  telegramWebhookSource.includes('return error(res, "Webhook authentication is temporarily unavailable.", 503)'),
  "Telegram webhook must fail closed when its rate-limit backend is unavailable",
);

const postcssConfigSource = readFileSync(new URL("../postcss.config.js", import.meta.url), "utf8");
assert.ok(
  postcssConfigSource.includes('from "@tailwindcss/postcss"'),
  "Tailwind v4 must use the dedicated @tailwindcss/postcss plugin",
);
assert.ok(
  !/plugins:\s*\{\s*tailwindcss\s*:/.test(postcssConfigSource),
  "Tailwind core must not be registered directly as a PostCSS plugin",
);

console.log("Webhook secret comparison and public website scraper security tests passed.");


const paymentHandlerStart = systemApiSource.indexOf("async function handleVerifyToken");
const paymentHandlerEnd = systemApiSource.indexOf("\nasync function ", paymentHandlerStart + 1);
const paymentVerificationHandler = systemApiSource.slice(
  paymentHandlerStart,
  paymentHandlerEnd > paymentHandlerStart ? paymentHandlerEnd : undefined,
);
assert.ok(paymentHandlerStart >= 0, "payment verification handler must remain present");
assert.ok(paymentVerificationHandler.includes('typeof projectId !== "string"'));
assert.ok(paymentVerificationHandler.includes('typeof token !== "string"'));
assert.ok(paymentVerificationHandler.includes("token.length !== 6"));
assert.ok(paymentVerificationHandler.includes("/^[0-9A-Z]{6}$/.test(token)"));
assert.ok(
  paymentVerificationHandler.includes(
    'await checkRateLimit(admin, userId, "verify-payment-token", 5)',
  ),
  "payment token verification must rate-limit authenticated guesses and fail closed",
);
assert.ok(
  paymentVerificationHandler.includes(
    "verifyAndConsumePaymentToken(admin.firestore(), projectRef, token, userId)",
  ),
  "payment verification must pass the authenticated actor to the atomic authorization helper",
);

const paymentTokenSource = readFileSync(
  new URL("../api/_lib/paymentToken.js", import.meta.url),
  "utf8",
);
assert.ok(paymentTokenSource.includes("if (!projectSnapshot.exists) return false;"));
assert.ok(paymentTokenSource.includes('typeof storedToken !== "string"'));
assert.ok(paymentTokenSource.includes("constantTimeSecretEqual(storedToken, token)"));
assert.ok(paymentTokenSource.includes('projectSnapshot.get("userId") === actorUserId'));
assert.ok(paymentTokenSource.includes('actorSnapshot.get("role") === "admin"'));
assert.ok(paymentTokenSource.includes("if (!isOwner && !isAdmin) return false;"));
assert.ok(
  !paymentTokenSource.includes('projectSnapshot.get("paymentToken") === token'),
  "payment verification must not rely on direct token equality",
);


// Wildcard CORS must not be combined with credentialed cross-origin requests.
// The app authenticates outreach API calls with an explicit Bearer header, not cookies.
const outreachCorsHeaders = new Map();
const outreachCorsResponse = {
  statusCode: null,
  ended: false,
  setHeader(name, value) {
    outreachCorsHeaders.set(String(name).toLowerCase(), value);
    return this;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  end() {
    this.ended = true;
    return this;
  },
};
await outreachHandler({ method: "OPTIONS", query: {}, headers: {} }, outreachCorsResponse);
assert.equal(outreachCorsResponse.statusCode, 200);
assert.equal(outreachCorsResponse.ended, true);
assert.equal(outreachCorsHeaders.get("access-control-allow-origin"), "*");
assert.equal(outreachCorsHeaders.has("access-control-allow-credentials"), false);
assert.match(outreachCorsHeaders.get("access-control-allow-headers"), /Authorization/);
console.log("Outreach CORS preflight regression test passed.");


// Protected API routes must distinguish unavailable Firebase Admin configuration
// from an invalid user token. This keeps infrastructure failures as safe HTTP 503s.
const firebaseReadinessRouteCases = [
  {
    label: "AI",
    path: "../api/ai.js",
    guard: 'authHeader.startsWith("Bearer ") && !admin.apps.length',
    response: 'return error(res, "AI service is temporarily unavailable.", 503);',
  },
  {
    label: "system",
    path: "../api/system.js",
    guard: "authHeader.startsWith('Bearer ') && !admin.apps.length",
    response: 'return error(res, "System service is temporarily unavailable.", 503);',
  },
  {
    label: "outreach",
    path: "../api/outreach.js",
    guard: 'authHeader.startsWith("Bearer ") && !admin.apps.length',
    response: 'return error(res, "Outreach service is temporarily unavailable.", 503);',
  },
  {
    label: "proposal",
    path: "../api/send-proposal.js",
    guard: 'authHeader.startsWith("Bearer ") && !admin.apps.length',
    response: 'return error(res, "Proposal service is temporarily unavailable.", 503);',
  },
];

for (const routeCase of firebaseReadinessRouteCases) {
  const source = readFileSync(new URL(routeCase.path, import.meta.url), "utf8");
  const readinessIndex = source.indexOf("!admin.apps.length");
  const tokenVerificationIndex = source.indexOf("admin.auth().verifyIdToken");
  assert.ok(
    source.includes(routeCase.guard)
      && readinessIndex >= 0
      && readinessIndex < tokenVerificationIndex,
    routeCase.label + " API must check Firebase Admin readiness before verifying a bearer token",
  );
  assert.ok(
    source.includes(routeCase.response),
    routeCase.label + " API must return a safe HTTP 503 when Firebase Admin is unavailable",
  );
}


// AI provider failures must log only the HTTP status, never the raw provider response body.
const aiServiceSource = readFileSync(new URL("../api/_lib/services/aiService.js", import.meta.url), "utf8");
assert.ok(
  aiServiceSource.includes('console.error("[NEURAL_NODE_ERROR] HTTP status:", res.status)'),
  "AI provider errors must log only a bounded HTTP status",
);
assert.equal(
  aiServiceSource.includes("errData"),
  false,
  "AI provider response bodies must not be logged or retained in the error path",
);


// Google autofill must be unavailable when the browser Firebase client is incomplete.
const firebaseReadinessLeadFormSource = readFileSync(new URL("../components/LeadForm.tsx", import.meta.url), "utf8");
assert.match(
  firebaseReadinessLeadFormSource,
  /import\s*\{\s*db,\s*auth,\s*googleProvider,\s*isFirebaseConfigured\s*\}/,
  "LeadForm must import the shared Firebase readiness flag",
);
assert.match(
  firebaseReadinessLeadFormSource,
  /const handleGoogleAutofill = async \(\) => \{\s*if \(!isFirebaseConfigured\) return;/,
  "Google autofill must fail closed when Firebase client configuration is incomplete",
);
assert.match(
  firebaseReadinessLeadFormSource,
  /\{isFirebaseConfigured\s*&&\s*!auth\.currentUser\s*&&\s*<>/,
  "Google sign-in UI must be hidden when Firebase client configuration is incomplete",
);
