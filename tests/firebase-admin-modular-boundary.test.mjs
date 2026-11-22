import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workerFiles = [
  "../quickkit-automation-agent-main/functions/emailWorker.ts",
  "../quickkit-automation-agent-main/functions/paymentWorker.ts",
  "../quickkit-automation-agent-main/functions/worker.ts",
  "../quickkit-automation-agent-main/api/billing/razorpay/webhook.ts",
  "../quickkit-automation-agent-main/lib/serverUtils.ts",
];

for (const relativePath of workerFiles) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  assert.match(source, /from ["']firebase-admin\/app["']/,
    `Expected modular firebase-admin/app import in ${relativePath}`);
  assert.match(source, /from ["']firebase-admin\/firestore["']/,
    `Expected modular firebase-admin/firestore import in ${relativePath}`);
  assert.doesNotMatch(source, /import\s+(?:\*\s+as\s+admin|admin)\s+from\s+["']firebase-admin["']/,
    `Legacy Firebase Admin namespace import remains in ${relativePath}`);
  assert.doesNotMatch(source, /\badmin\.(?:apps|initializeApp|credential|firestore|auth|messaging)\b/,
    `Legacy Firebase Admin namespace API remains in ${relativePath}`);
}

const manifest = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package.json", import.meta.url), "utf8",
));
const lock = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package-lock.json", import.meta.url), "utf8",
));
const adminVersion = lock.packages?.["node_modules/firebase-admin"]?.version;
const functionsPeer = lock.packages?.["node_modules/firebase-functions"]?.peerDependencies?.["firebase-admin"];
assert.equal(manifest.dependencies["firebase-admin"], "^14.5.1");
assert.equal(manifest.engines?.node, ">=22");
assert.ok(adminVersion, "Expected Firebase Admin in the nested lockfile");
const [major, minor, patch] = adminVersion.split(".").map(Number);
assert.ok(
  major > 14 || (major === 14 && (minor > 5 || (minor === 5 && patch >= 1))),
  `Expected patched Firebase Admin >=14.5.1, received ${adminVersion}`,
);
assert.ok(functionsPeer?.includes("^14.0.0"),
  "firebase-functions must declare compatibility with Firebase Admin 14");
assert.equal(manifest.dependencies.nodemailer, "^10.6.1");
const nodemailerVersion = lock.packages?.["node_modules/nodemailer"]?.version;
assert.equal(nodemailerVersion, "10.6.1");

console.log("Firebase Admin modular API/runtime and patched dependency regression tests passed.");
