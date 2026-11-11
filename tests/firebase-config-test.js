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
assert.match(firebaseAdminSource, /console\.error\("Firebase Admin initialization failed\."\)/);
assert.doesNotMatch(firebaseAdminSource, /error\.message/);
assert.doesNotMatch(firebaseAdminSource, /console\.error\([^;]*,\s*error\s*\)/);

const coreSource = readFileSync(new URL("../lib/firebaseCore.ts", import.meta.url), "utf8");
assert.match(coreSource, /isFirebaseConfigured = hasRequiredFirebaseClientConfig\(firebaseConfig\)/);

const productionExample = readFileSync(new URL("../.env.production.example", import.meta.url), "utf8");
for (const variable of [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
]) {
  assert.match(productionExample, new RegExp("^" + variable + "=", "m"));
}
console.log("Firebase client config guard tests passed: required fields are enforced and documented in the production environment template.");
