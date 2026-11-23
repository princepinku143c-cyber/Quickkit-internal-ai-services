import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getMissingFirebaseClientConfig, isFirebaseClientConfigComplete } from "../lib/firebaseConfig.js";

const completeClientConfig = {
  apiKey: "test-api-key",
  authDomain: "quickkitai-test.firebaseapp.com",
  projectId: "demo-quickkitai",
  appId: "1:1234567890:web:test",
};

// Auth/Firestore startup requires all four identity fields; optional telemetry
// and storage fields must not accidentally disable an otherwise valid client.
assert.deepEqual(getMissingFirebaseClientConfig(completeClientConfig), []);
assert.equal(isFirebaseClientConfigComplete(completeClientConfig), true);
assert.equal(
  isFirebaseClientConfigComplete({
    ...completeClientConfig,
    storageBucket: undefined,
    messagingSenderId: undefined,
    measurementId: undefined,
  }),
  true,
);

for (const requiredKey of ["apiKey", "authDomain", "projectId", "appId"]) {
  const incompleteConfig = { ...completeClientConfig, [requiredKey]: "   " };
  assert.ok(getMissingFirebaseClientConfig(incompleteConfig).includes(requiredKey));
  assert.equal(isFirebaseClientConfigComplete(incompleteConfig), false);
}

assert.deepEqual(
  getMissingFirebaseClientConfig(null),
  ["apiKey", "authDomain", "projectId", "appId"],
);

const rootConfigPath = fileURLToPath(new URL("../firebase.json", import.meta.url));
const nestedConfigPath = fileURLToPath(new URL("../quickkit-automation-agent-main/firebase.json", import.meta.url));

const [rootConfig, nestedConfig] = await Promise.all([
  readFile(rootConfigPath, "utf8").then(JSON.parse),
  readFile(nestedConfigPath, "utf8").then(JSON.parse),
]);

assert.equal(rootConfig.firestore?.rules, "firestore.rules", "Root Firebase config must use its own Firestore rules file.");
assert.equal(nestedConfig.firestore?.rules, "firestore.rules", "Nested automation config must use its own Firestore rules file.");
assert.equal(nestedConfig.firestore?.indexes, "firestore.indexes.json", "Nested automation config must use its own composite indexes file.");
assert.equal(rootConfig.emulators?.firestore?.port, 8080, "Root Firestore Emulator port must match the CI test setup.");

const rootRulesPath = resolve(dirname(rootConfigPath), rootConfig.firestore.rules);
const nestedRulesPath = resolve(dirname(nestedConfigPath), nestedConfig.firestore.rules);
const nestedIndexesPath = resolve(dirname(nestedConfigPath), nestedConfig.firestore.indexes);

assert.notEqual(rootRulesPath, nestedRulesPath, "Root and nested applications must not resolve to the same Firestore rules file.");
await Promise.all([access(rootRulesPath), access(nestedRulesPath), access(nestedIndexesPath)]);

const nestedIndexes = JSON.parse(await readFile(nestedIndexesPath, "utf8"));
assert.ok(Array.isArray(nestedIndexes.indexes), "Nested Firestore indexes must contain an indexes array.");
assert.ok(Array.isArray(nestedIndexes.fieldOverrides), "Nested Firestore indexes must contain a fieldOverrides array.");

// Neither Firebase project commits a default CLI alias. This keeps clean checkouts
// from silently targeting a remembered project: deployment commands must pass
// an explicit --project value for the intended environment.
const projectAliasPaths = [
  resolve(dirname(rootConfigPath), ".firebaserc"),
  resolve(dirname(nestedConfigPath), ".firebaserc"),
];
for (const aliasPath of projectAliasPaths) {
  await assert.rejects(
    access(aliasPath),
    (error) => error?.code === "ENOENT",
    `Firebase project aliases must remain uncommitted; use an explicit --project target (${aliasPath}).`,
  );
}

console.log("PASS: root and nested Firebase configs resolve to separate existing rules; no default project aliases are committed; nested indexes and CI emulator port are valid.");
