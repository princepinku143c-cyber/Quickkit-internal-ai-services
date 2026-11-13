import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("../scripts/validate-production-firebase-env.mjs", import.meta.url)
);
const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
const placeholders = Object.fromEntries(
  required.map((name) => [name, `test-only-${name}`])
);

function runGuard(overrides) {
  return spawnSync(process.execPath, [scriptPath], {
    encoding: "utf8",
    env: { ...process.env, ...overrides },
  });
}

const previewResult = runGuard({
  VERCEL_ENV: "preview",
  ...Object.fromEntries(required.map((name) => [name, ""])),
});
assert.equal(previewResult.status, 0, previewResult.stderr);

const missingResult = runGuard({
  ...placeholders,
  VERCEL_ENV: "production",
  VITE_FIREBASE_AUTH_DOMAIN: "",
  FIREBASE_PRIVATE_KEY: "   ",
});
assert.equal(missingResult.status, 1);
assert.match(missingResult.stderr, /VITE_FIREBASE_AUTH_DOMAIN/);
assert.match(missingResult.stderr, /FIREBASE_PRIVATE_KEY/);
assert.doesNotMatch(missingResult.stderr, /test-only-/);

const completeResult = runGuard({
  ...placeholders,
  VERCEL_ENV: "production",
});
assert.equal(completeResult.status, 0, completeResult.stderr);
assert.equal(completeResult.stderr, "");

console.log("Production Firebase build guard tests passed: preview builds remain unaffected, incomplete production config fails closed, and diagnostics contain names only.");
