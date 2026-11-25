import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));
const nestedManifest = JSON.parse(await readFile(new URL("../quickkit-automation-agent-main/package.json", import.meta.url), "utf8"));
const nestedLock = JSON.parse(await readFile(new URL("../quickkit-automation-agent-main/package-lock.json", import.meta.url), "utf8"));

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


const nestedApprovals = nestedManifest.allowScripts ?? {};
assert.deepEqual(
  nestedApprovals,
  {},
  "The nested automation app must not approve install scripts until each exact package version is separately reviewed.",
);

const unapprovedScriptPackages = {
  "@firebase/util": "1.15.3",
  esbuild: "0.25.12",
  fsevents: "2.3.3",
  protobufjs: "7.6.6",
};

for (const [packageName, version] of Object.entries(unapprovedScriptPackages)) {
  for (const [scope, packageLock, scopeApprovals] of [
    ["root", lock, approvals],
    ["nested", nestedLock, nestedApprovals],
  ]) {
    const entry = packageLock.packages?.[`node_modules/${packageName}`];
    assert.equal(entry?.version, version, `${scope} ${packageName} must remain pinned to the reviewed version.`);
    assert.equal(entry?.hasInstallScript, true, `${scope} ${packageName} install-script metadata must remain visible.`);
    assert.ok(
      !Object.keys(scopeApprovals).some((approval) => approval === packageName || approval.startsWith(packageName + "@")),
      `${scope} ${packageName} must remain unapproved until its exact install script is reviewed.`,
    );
  }
}

console.log("Root dependency install-script approval policy tests passed.");
