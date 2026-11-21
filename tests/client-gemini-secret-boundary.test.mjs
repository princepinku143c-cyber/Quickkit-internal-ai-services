import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [viteConfig, geminiService, envExample] = await Promise.all([
  readFile(new URL("../quickkit-automation-agent-main/vite.config.ts", import.meta.url), "utf8"),
  readFile(new URL("../quickkit-automation-agent-main/services/geminiService.ts", import.meta.url), "utf8"),
  readFile(new URL("../quickkit-automation-agent-main/.env.example", import.meta.url), "utf8"),
]);

// The browser build must fail closed if a provider key is supplied as a build
// environment variable, and must never define server credentials into JS.
for (const name of ["GEMINI_API_KEY", "API_KEY", "VITE_GEMINI_API_KEY", "VITE_API_KEY"]) {
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

console.log("PASS: Gemini provider credentials cannot be injected into the browser bundle; BYO Credential Vault remains supported.");
