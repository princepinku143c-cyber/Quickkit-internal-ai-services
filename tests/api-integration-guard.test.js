import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const integrationScript = join(projectRoot, "tests", "api-test.js");
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
