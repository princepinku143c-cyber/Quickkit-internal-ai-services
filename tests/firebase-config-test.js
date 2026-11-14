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
assert.doesNotMatch(coreSource, /console\.error\([^;\n]*e\.message/);
assert.doesNotMatch(coreSource, /console\.(?:log|info|warn|error)\([^;\n]*\bpayload\b/);
assert.ok(coreSource.includes('console.error("Firebase client initialization failed.")'));
assert.ok(coreSource.includes('console.info("[FIREBASE BRIDGE] Mock trigger invoked.")'));

const productionExample = readFileSync(new URL("../.env.production.example", import.meta.url), "utf8");
const developmentExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

for (const variable of [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
]) {
  const pattern = new RegExp("^" + variable + "=", "m");
  assert.match(productionExample, pattern, `Production template must document ${variable}`);
  assert.match(developmentExample, pattern, `Development template must document ${variable}`);
}

for (const [label, example] of [
  ["Production", productionExample],
  ["Development", developmentExample],
]) {
  const privateKeyLine = example.match(/^FIREBASE_PRIVATE_KEY=.*$/m)?.[0] || "";
  assert.ok(privateKeyLine.includes("\\n"), `${label} template must show a literal \\n newline marker`);
  assert.equal(
    (privateKeyLine.match(/\\/g) || []).length,
    1,
    `${label} template must not double-escape Firebase private-key newlines`
  );
}

const firebaseClientVariables = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_MEASUREMENT_ID",
];
for (const variable of firebaseClientVariables) {
  const pattern = new RegExp("^" + variable + "=", "m");
  assert.match(productionExample, pattern, `Production template must document Firebase client setting ${variable}`);
  assert.match(developmentExample, pattern, `Development template must document Firebase client setting ${variable}`);
  assert.ok(coreSource.includes(`import.meta.env.${variable}`), `Firebase client bootstrap must map ${variable}`);
}

assert.match(productionExample, /^CRON_SECRET=/m, "Production template must document CRON_SECRET");
assert.match(developmentExample, /^CRON_SECRET=/m, "Development template must document CRON_SECRET");

const firebaseConfig = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
assert.equal(firebaseConfig.firestore?.rules, "firestore.rules", "Firebase CLI must deploy the audited Firestore rules file.");

console.log("Firebase config guard tests passed: all seven client settings are documented and mapped, Admin credentials and cron secret are documented, Firestore rules path is pinned, and Admin diagnostics remain redacted.");
