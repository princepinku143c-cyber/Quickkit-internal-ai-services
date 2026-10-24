import assert from "node:assert/strict";
import {
  ALLOWED_SERVICES, PolicyError, TASKS, cleanOutput, parseDeploymentResult,
  validateIdentity, validateJobRequest, validateRequestId
} from "../vps-automation/policy.js";

const requestId = "2b18fa7e-6c81-4c08-8d67-2a7a9ef87f51";
for (const jobId of Object.keys(TASKS)) {
  const spec = validateJobRequest({ jobId, requestId });
  assert.equal(spec.jobId, jobId);
  assert.ok(Array.isArray(spec.args));
  assert.ok(spec.command);
}
assert.deepEqual(validateJobRequest({ jobId: "service_status", args: { service: "docker" }, requestId }).args,
  ["is-active", "--", "docker"]);
assert.ok(ALLOWED_SERVICES.includes("n8n"));
assert.throws(() => validateJobRequest({ jobId: "exec", args: { command: "id" }, requestId }), PolicyError);
assert.throws(() => validateJobRequest({ jobId: "uptime", args: { shell: "id" }, requestId }), PolicyError);
assert.throws(() => validateJobRequest({ jobId: "uptime", requestId, userId: "forged" }), PolicyError);
assert.throws(() => validateJobRequest({ jobId: "service_status", args: { service: "n8n; echo blocked" }, requestId }), PolicyError);
assert.throws(() => validateJobRequest({ jobId: "service_status", args: { service: "docker", extra: "x" }, requestId }), PolicyError);
assert.equal(validateRequestId(requestId), true);
assert.equal(validateRequestId("x"), false);
assert.deepEqual(validateIdentity({ projectId: "app_123", userId: "user_456", requestId }), {
  projectId: "app_123", userId: "user_456", requestId
});
assert.throws(() => validateIdentity({ projectId: "../etc", userId: "u", requestId }), PolicyError);
assert.throws(() => validateIdentity({ projectId: "p", userId: "u", requestId, config: { task: "id" } }), PolicyError);
assert.equal(cleanOutput("a".repeat(100), 10).length, 10);
assert.deepEqual(parseDeploymentResult(
  JSON.stringify({ status: "SUCCEEDED", url: "https://agents.example.com/app-1", deploymentId: "dep-1" }),
  "agents.example.com"
), { status: "SUCCEEDED", url: "https://agents.example.com/app-1", deploymentId: "dep-1" });
assert.throws(() => parseDeploymentResult(
  JSON.stringify({ status: "SUCCEEDED", url: "https://evil.example/app" }), "agents.example.com"
), PolicyError);
assert.throws(() => parseDeploymentResult(
  JSON.stringify({ status: "SUCCEEDED", url: "http://agents.example.com/app" }), "agents.example.com"
), PolicyError);
assert.throws(() => parseDeploymentResult(
  JSON.stringify({ status: "SUCCESS", url: "https://agents.example.com/app" }), "agents.example.com"
), PolicyError);
console.log("VPS worker policy tests passed.");
