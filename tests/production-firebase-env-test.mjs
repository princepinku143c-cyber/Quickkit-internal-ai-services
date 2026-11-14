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
const placeholders = {
  ...Object.fromEntries(required.map((name) => [name, "test-only-" + name])),
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-test@test-firebase-project.iam.gserviceaccount.com",
  // Deliberately use escaped newlines to exercise Vercel environment normalization.
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nTEST-ONLY-PRIVATE-KEY-MATERIAL\\n-----END PRIVATE KEY-----",
};

const matchingProjectConfig = {
  ...placeholders,
  VITE_FIREBASE_PROJECT_ID: "test-firebase-project",
  FIREBASE_PROJECT_ID: "test-firebase-project",
};

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
assert.doesNotMatch(missingResult.stderr, /test-only-|PRIVATE-KEY-MATERIAL/);

const completeResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
});
assert.equal(completeResult.status, 0, completeResult.stderr);
assert.equal(completeResult.stderr, "");

const malformedEmailResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
  FIREBASE_CLIENT_EMAIL: "not-a-service-account",
});
assert.equal(malformedEmailResult.status, 1);
assert.match(malformedEmailResult.stderr, /FIREBASE_CLIENT_EMAIL/);
assert.doesNotMatch(malformedEmailResult.stderr, /not-a-service-account/);

const malformedPrivateKeyResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
  FIREBASE_PRIVATE_KEY: "not-a-pem-private-key",
});
assert.equal(malformedPrivateKeyResult.status, 1);
assert.match(malformedPrivateKeyResult.stderr, /FIREBASE_PRIVATE_KEY/);
assert.doesNotMatch(malformedPrivateKeyResult.stderr, /not-a-pem-private-key/);

const mismatchedProjectResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
  FIREBASE_PROJECT_ID: "different-test-firebase-project",
});
assert.equal(mismatchedProjectResult.status, 1);
assert.match(mismatchedProjectResult.stderr, /Production Firebase project configuration mismatch/);
assert.match(mismatchedProjectResult.stderr, /VITE_FIREBASE_PROJECT_ID/);
assert.match(mismatchedProjectResult.stderr, /FIREBASE_PROJECT_ID/);
assert.doesNotMatch(
  mismatchedProjectResult.stderr,
  /test-firebase-project|different-test-firebase-project|PRIVATE-KEY-MATERIAL/
);

console.log("Production Firebase build guard tests passed: preview builds remain unaffected; missing, malformed, or cross-project production configuration fails closed; escaped PEM newlines are normalized; diagnostics contain variable names only.");
