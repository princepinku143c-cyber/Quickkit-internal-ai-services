import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));

const approvals = manifest.allowScripts ?? {};
assert.deepEqual(
  approvals,
  { "@google/genai@1.52.0": true },
  "Only the reviewed no-op @google/genai preinstall may be approved, pinned to the exact locked version.",
);

const genai = lock.packages?.["node_modules/@google/genai"];
assert.equal(genai?.version, "1.52.0");
assert.equal(genai?.hasInstallScript, true);
assert.match(genai?.resolved ?? "", /^https:\/\/registry\.npmjs\.org\/@google\/genai\/-/);
assert.match(genai?.integrity ?? "", /^sha512-/);

for (const packageName of ["@firebase/util", "esbuild", "protobufjs"]) {
  assert.ok(
    !Object.keys(approvals).some((entry) => entry === packageName || entry.startsWith(packageName + "@")),
    `${packageName} must remain unapproved until its install script is reviewed.`,
  );
}

console.log("Root dependency install-script approval policy tests passed.");
