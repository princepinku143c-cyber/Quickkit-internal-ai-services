import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { escapeHtml, getClientIp, isPlainObject, payloadTooLarge, safeMetadata, safeNumber, safeText } from "../api/_lib/input.js";
import { getMissingFirebaseClientConfig, isFirebaseClientConfigComplete } from "../lib/firebaseConfig.js";
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
assert.match(
  vpsAutomationSource,
  vpsAutomationSource.includes("process.env.VPS_AUTOMATION_TOKEN"),
  "VPS automation must read its bearer token from the server environment",
);
assert.match(
  vpsAutomationSource,
  /timingSafeEqual/,
  "VPS automation token comparisons must use a constant-time comparison",
);
assert.doesNotMatch(
  vpsAutomationSource,
  /const\\s+AUTH_TOKEN\\s*=\\s*["'`][^"'`]+["'`]/,
  "VPS automation must not contain a hardcoded bearer token",
);

assert.equal(
  existsSync(new URL("../scratch/test-firebase.js", import.meta.url)),
  false,
  "the scratch Firebase test containing a service-account key must remain absent",
);

console.log("Security input-helper, API auth-redaction, and source-credential regression tests passed.");
