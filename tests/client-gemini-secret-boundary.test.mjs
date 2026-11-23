import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const [viteConfig, geminiService, envExample, integrationsView] = await Promise.all([
  readFile(new URL("../quickkit-automation-agent-main/vite.config.ts", import.meta.url), "utf8"),
  readFile(new URL("../quickkit-automation-agent-main/services/geminiService.ts", import.meta.url), "utf8"),
  readFile(new URL("../quickkit-automation-agent-main/.env.example", import.meta.url), "utf8"),
  readFile(new URL("../components/IntegrationsView.tsx", import.meta.url), "utf8"),
]);

// The browser build must fail closed if a provider key is supplied as a build
// environment variable, and must never define server credentials into JS.
const forbiddenNames = ["GEMINI_API_KEY", "API_KEY", "VITE_GEMINI_API_KEY", "VITE_API_KEY"];
for (const name of forbiddenNames) {
  assert.ok(viteConfig.includes(name), `Vite build guard must reject ${name}.`);
}
assert.match(viteConfig, /Refusing to build a browser bundle with Gemini credential/);
assert.doesNotMatch(viteConfig, /define\s*:/);
assert.doesNotMatch(viteConfig, /process\.env\.(?:GEMINI_API_KEY|API_KEY)/);

// The client may use a user-owned Credential Vault key, never a platform env key.
assert.match(geminiService, /nexus_credentials/);
assert.doesNotMatch(geminiService, /process\.env\.(?:GEMINI_API_KEY|API_KEY)/);
assert.match(geminiService, /return "";/);
assert.doesNotMatch(envExample, /^VITE_GEMINI_API_KEY=/m);
assert.match(envExample, /in-app Credential Vault/);

// Exercise Vite itself, not just source-text assertions. A build supplied with
// any platform Gemini credential name must stop in config evaluation before
// emitting a browser bundle. Only dummy values are passed to this child process.
const sentinel = "quickkit-test-only-gemini-sentinel";
const viteCli = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const automationDir = fileURLToPath(new URL("../quickkit-automation-agent-main/", import.meta.url));
const guardedBuild = spawnSync(process.execPath, [viteCli, "build", "--config", "vite.config.ts"], {
  cwd: automationDir,
  env: {
    ...process.env,
    GEMINI_API_KEY: sentinel,
    API_KEY: sentinel,
    VITE_GEMINI_API_KEY: sentinel,
    VITE_API_KEY: sentinel,
  },
  encoding: "utf8",
  timeout: 20000,
});
const buildOutput = (guardedBuild.stdout || "") + (guardedBuild.stderr || "");
assert.notEqual(guardedBuild.status, 0, "Vite must reject a browser build with platform Gemini credentials.");
assert.match(buildOutput, /Refusing to build a browser bundle with Gemini credential/);
for (const name of forbiddenNames) {
  assert.ok(buildOutput.includes(name), `Vite rejection must identify ${name} without revealing its value.`);
}
assert.ok(!buildOutput.includes(sentinel), "The dummy credential value must not appear in build output.");


 // Root CRM provider credentials must not be collected or persisted in a
 // browser-readable Firestore profile until a tenant-isolated server vault exists.
 assert.doesNotMatch(integrationsView, /data\.integrations|setDoc\(docRef,\s*\{\s*integrations:/);
 assert.doesNotMatch(integrationsView, /Secure Credentials Vault|API keys are stored directly in your Firebase sandbox|Save Keys/);
 assert.doesNotMatch(integrationsView, /type:\s*['"]password['"]/);
 assert.match(integrationsView, /tenant-isolated credential vault/);
 assert.match(integrationsView, /Do not paste API keys here/);
 assert.match(integrationsView, /Server setup required/);
 assert.match(integrationsView, /webhookSecret/, "per-user webhook secret flow remains available");

console.log("PASS: Gemini provider credentials cannot enter the browser bundle; root CRM provider credentials are not collected or stored in client Firestore; per-user webhook secret flow remains available.");
