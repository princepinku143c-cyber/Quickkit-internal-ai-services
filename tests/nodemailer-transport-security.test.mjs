import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mailers = [
  "../quickkit-automation-agent-main/lib/mailer.ts",
  "../quickkit-automation-agent-main/functions/emailWorker.ts",
];

for (const relativePath of mailers) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const transport = source.match(/createTransport\s*\(\s*\{([\s\S]*?)\}\s*\)/);

  assert.ok(transport, `Expected a Nodemailer transport in ${relativePath}`);
  assert.match(transport[1], /\bdisableFileAccess\s*:\s*true\b/);
  assert.match(transport[1], /\bdisableUrlAccess\s*:\s*true\b/);
  assert.doesNotMatch(source, /\braw\s*:/, "Do not pass Nodemailer raw-message options");
}


const nestedPackage = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package.json", import.meta.url),
  "utf8",
));
const nestedLock = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package-lock.json", import.meta.url),
  "utf8",
));
assert.equal(nestedPackage.dependencies.nodemailer, "^10.6.1");
assert.equal(nestedPackage.engines?.node, ">=20");
const lockedNodemailer = nestedLock.packages?.["node_modules/nodemailer"]?.version;
assert.ok(lockedNodemailer, "Expected Nodemailer to be present in the nested lockfile");
const [lockedMajor, lockedMinor, lockedPatch] = lockedNodemailer.split(".").map(Number);
assert.ok(
  lockedMajor > 10 || (lockedMajor === 10 && (lockedMinor > 6 || (lockedMinor === 6 && lockedPatch >= 1))),
  `Expected patched Nodemailer >=10.6.1, received ${lockedNodemailer}`,
);

console.log("Nodemailer transport file/URL access hardening tests passed.");
