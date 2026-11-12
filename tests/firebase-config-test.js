import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasRequiredFirebaseClientConfig } from "../lib/firebaseConfig.js";

const completeConfig = {
  apiKey: "test-api-key",
  authDomain: "quickkit-test.firebaseapp.com",
  projectId: "quickkit-test",
  appId: "1:123456789:web:test",
  storageBucket: "",
  messagingSenderId: "",
  measurementId: "",
};

assert.equal(hasRequiredFirebaseClientConfig(completeConfig), true);
for (const field of ["apiKey", "authDomain", "projectId", "appId"]) {
  assert.equal(
    hasRequiredFirebaseClientConfig({ ...completeConfig, [field]: "" }),
    false,
    `Missing required Firebase field should disable initialization: ${field}`
  );
}
assert.equal(hasRequiredFirebaseClientConfig(null), false);
assert.equal(hasRequiredFirebaseClientConfig(undefined), false);

// Firebase Admin initialization diagnostics must never print certificate/parser details.
const firebaseAdminSource = readFileSync(new URL("../api/_lib/firebaseAdmin.js", import.meta.url), "utf8");
assert.ok(firebaseAdminSource.includes('console.error("Firebase Admin initialization failed.")'));
assert.equal(firebaseAdminSource.includes("error.message"), false);
assert.equal(firebaseAdminSource.includes("console.error(\"Firebase Admin initialization failed.\", error)"), false);

const coreSource = readFileSync(new URL("../lib/firebaseCore.ts", import.meta.url), "utf8");
assert.ok(coreSource.includes("isFirebaseConfigured = hasRequiredFirebaseClientConfig(firebaseConfig)"));

const productionExample = readFileSync(new URL("../.env.production.example", import.meta.url), "utf8");
for (const variable of [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "CRON_SECRET",
]) {
  assert.match(
    productionExample,
    new RegExp("^" + variable + "=", "m"),
    `Production environment template must document ${variable}`
  );
}

const developmentExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
assert.match(developmentExample, /^CRON_SECRET=/m);

console.log("Firebase config guard tests passed: required client fields, server Admin credentials, and cron secret are documented; Admin diagnostics remain redacted.");
