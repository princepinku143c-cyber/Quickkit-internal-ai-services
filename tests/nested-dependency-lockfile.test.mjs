import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package.json", import.meta.url),
  "utf8",
));
const lock = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/package-lock.json", import.meta.url),
  "utf8",
));

assert.equal(lock.lockfileVersion, 3);
assert.equal(manifest.overrides?.["@grpc/grpc-js"], "^1.14.6");
assert.deepEqual(lock.packages?.[""]?.dependencies, manifest.dependencies);
assert.deepEqual(lock.packages?.[""]?.devDependencies, manifest.devDependencies);

const remediationWorkflow = await readFile(
  new URL("../.github/workflows/nested-dependency-remediation-preview.yml", import.meta.url),
  "utf8",
);
assert.ok(
  remediationWorkflow.includes('if [ "$AUDIT_FIX_OUTCOME" != "success" ]; then'),
  "the remediation workflow must refuse to commit if npm audit fix fails or is skipped",
);
assert.ok(
  remediationWorkflow.includes("Number.isInteger(v.high)")
    && remediationWorkflow.includes("Number.isInteger(v.critical)")
    && remediationWorkflow.includes("(v.high || 0) !== 0")
    && remediationWorkflow.includes("(v.critical || 0) !== 0"),
  "the remediation workflow must validate audit metadata and refuse high/critical advisories",
);

assert.ok(
  remediationWorkflow.includes("if: ${{ always() && !cancelled() }}"),
  "the remediation workflow must not commit after a cancelled run",
);

function compareVersions(actual, minimum) {
  const parse = (value) => value.split(".").map((part) => Number.parseInt(part, 10));
  const a = parse(actual);
  const b = parse(minimum);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const delta = (a[i] || 0) - (b[i] || 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

const patchedMinimums = {
  "@grpc/grpc-js": "1.14.6",
  axios: "1.19.1",
  protobufjs: "7.6.5",
  "proxy-addr": "2.0.8",
  "websocket-driver": "0.7.5",
  "react-router": "7.14.2",
  vite: "6.4.4",
  qs: "6.17.1",
};

for (const [name, minimum] of Object.entries(patchedMinimums)) {
  const actual = lock.packages?.[`node_modules/${name}`]?.version;
  assert.equal(typeof actual, "string", `Missing locked package: ${name}`);
  assert.ok(
    compareVersions(actual, minimum) >= 0,
    `${name} must be at least ${minimum}; found ${actual}`,
  );
}

console.log("Nested dependency lockfile security regression tests passed.");
