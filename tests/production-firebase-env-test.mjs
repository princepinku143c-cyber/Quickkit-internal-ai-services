import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
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
const { privateKey: generatedPrivateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const { privateKey: nonRsaPrivateKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const placeholders = {
  ...Object.fromEntries(required.map((name) => [name, "test-only-" + name])),
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-test@test-firebase-project.iam.gserviceaccount.com",
  // Deliberately use escaped newlines to exercise Vercel environment normalization.
  // Generate a disposable RSA PKCS#8 key for the test; never log or persist its material.
  FIREBASE_PRIVATE_KEY: generatedPrivateKey.replace(/\n/g, "\\n"),
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

const unparseablePemResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nnot-base64!\n-----END PRIVATE KEY-----",
});
assert.equal(unparseablePemResult.status, 1);
assert.match(unparseablePemResult.stderr, /FIREBASE_PRIVATE_KEY/);
assert.doesNotMatch(unparseablePemResult.stderr, /not-base64/);

const nonRsaPrivateKeyResult = runGuard({
  ...matchingProjectConfig,
  VERCEL_ENV: "production",
  FIREBASE_PRIVATE_KEY: nonRsaPrivateKey,
});
assert.equal(nonRsaPrivateKeyResult.status, 1);
assert.match(nonRsaPrivateKeyResult.stderr, /FIREBASE_PRIVATE_KEY/);
assert.doesNotMatch(nonRsaPrivateKeyResult.stderr, /BEGIN PRIVATE KEY|END PRIVATE KEY/);

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
