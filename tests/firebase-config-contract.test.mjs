import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

console.log("PASS: root and nested Firebase configs resolve to separate existing Firestore rules; nested indexes and CI emulator port are valid.");
