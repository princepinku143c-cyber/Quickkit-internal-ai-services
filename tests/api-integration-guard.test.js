import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const integrationScript = join(projectRoot, "tests", "api-test.js");

const vercelConfig = JSON.parse(await readFile(join(projectRoot, "vercel.json"), "utf8"));
const spaFallback = vercelConfig.rewrites?.find((rule) =>
  rule.destination === "/index.html" && typeof rule.source === "string" && rule.source.includes("(?!")
);
assert.ok(spaFallback, "Vercel SPA fallback rewrite must remain explicitly configured.");
const spaFallbackPattern = new RegExp("^" + spaFallback.source + "$");
assert.equal(spaFallbackPattern.test("/api/aeo"), false, "AEO API requests must never fall through to the SPA index.");
assert.equal(spaFallbackPattern.test("/api"), false, "The bare API root must never fall through to the SPA index.");
assert.equal(spaFallbackPattern.test("/api/unknown"), false, "Unknown API paths must not return the SPA index as HTML.");
assert.equal(spaFallbackPattern.test("/a-client-side-route"), true, "Client-side application routes must continue to use the SPA fallback.");
const isolatedCwd = await mkdtemp(join(tmpdir(), "quickkit-api-guard-"));

function runGuard(overrides = {}) {
  const env = {
    ...process.env,
    TEST_BASE_URL: "",
    TEST_WEBHOOK_SECRET: "",
    TEST_WEBHOOK_UID: "",
    ALLOW_REMOTE_API_TESTS: "",
    ...overrides,
  };
  return spawnSync(process.execPath, [integrationScript], {
    cwd: isolatedCwd,
    env,
    encoding: "utf8",
    timeout: 5000,
  });
}

function outputOf(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

try {
  const missingTarget = runGuard();
  assert.equal(missingTarget.status, 2, outputOf(missingTarget));
  assert.match(outputOf(missingTarget), /Set TEST_BASE_URL/);
  assert.doesNotMatch(outputOf(missingTarget), /Running Test [ABC]/);

  const productionTarget = runGuard({
    TEST_BASE_URL: "https://quickkitai.com",
    TEST_WEBHOOK_SECRET: "unit-test-only",
    TEST_WEBHOOK_UID: "staging-user",
    ALLOW_REMOTE_API_TESTS: "1",
  });
  assert.equal(productionTarget.status, 2, outputOf(productionTarget));
  assert.match(outputOf(productionTarget), /Refusing to run mutating API integration tests against the production domain/);
  assert.doesNotMatch(outputOf(productionTarget), /Running Test [ABC]/);

  const unapprovedRemoteTarget = runGuard({
    TEST_BASE_URL: "https://staging.example.invalid",
    TEST_WEBHOOK_SECRET: "unit-test-only",
    TEST_WEBHOOK_UID: "staging-user",
  });
  assert.equal(unapprovedRemoteTarget.status, 2, outputOf(unapprovedRemoteTarget));
  assert.match(outputOf(unapprovedRemoteTarget), /Remote API tests require ALLOW_REMOTE_API_TESTS=1/);
  assert.doesNotMatch(outputOf(unapprovedRemoteTarget), /Running Test [ABC]/);

  console.log("API integration safety-guard tests passed; no API requests were sent.");
} finally {
  await rm(isolatedCwd, { recursive: true, force: true });
}
