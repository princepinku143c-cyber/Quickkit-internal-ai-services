import assert from "node:assert/strict";
import { callVps, validateExecutionRequest, validateProjectId, VpsAdapterError } from "../api/_lib/vpsClient.js";

const id = "2b18fa7e-6c81-4c08-8d67-2a7a9ef87f51";
assert.deepEqual(validateExecutionRequest({ jobId: "uptime", requestId: id }), {
  ok: true, jobId: "uptime", args: {}, requestId: id
});
assert.deepEqual(validateExecutionRequest({ jobId: "service_status", args: { service: "docker" }, requestId: id }), {
  ok: true, jobId: "service_status", args: { service: "docker" }, requestId: id
});
assert.equal(validateExecutionRequest({ jobId: "shell", command: "id", requestId: id }).ok, false);
assert.equal(validateExecutionRequest({ jobId: "uptime", command: "id", requestId: id }).ok, false);
assert.equal(validateExecutionRequest({ jobId: "service_status", args: { service: "../../etc" }, requestId: id }).ok, false);
assert.equal(validateExecutionRequest({ jobId: "service_status", args: { service: "docker", extra: "x" }, requestId: id }).ok, false);
assert.equal(validateExecutionRequest({ jobId: "disk_usage", args: { path: "/" }, requestId: id }).ok, false);
assert.equal(validateExecutionRequest({ jobId: "uptime", requestId: "not-a-uuid" }).ok, false);
assert.equal(validateProjectId("project_123-abc"), "project_123-abc");
assert.equal(validateProjectId("../../etc/passwd"), "");
assert.equal(validateProjectId(""), "");

const missingEnv = { NODE_ENV: "test" };
await assert.rejects(() => callVps("/v1/health", { env: missingEnv }), (e) => e instanceof VpsAdapterError && e.status === 503);
await assert.rejects(() => callVps("/private", { env: missingEnv }), (e) => e instanceof VpsAdapterError && e.status === 400);
await assert.rejects(() => callVps("/v1/health", {
  env: { NODE_ENV: "production", VPS_AUTOMATION_URL: "http://example.com", VPS_AUTOMATION_TOKEN: "a".repeat(40) }
}), (e) => e instanceof VpsAdapterError && e.status === 503);

const previousFetch = globalThis.fetch;
let observed;
globalThis.fetch = async (url, options) => {
  observed = { url, options };
  return new Response(JSON.stringify({ status: "CONNECTED", version: "2.0.0" }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
};
try {
  const token = "a".repeat(48);
  const result = await callVps("/v1/health", {
    env: { NODE_ENV: "test", VPS_AUTOMATION_URL: "http://127.0.0.1:3000", VPS_AUTOMATION_TOKEN: token }
  });
  assert.equal(result.status, "CONNECTED");
  assert.equal(observed.url, "http://127.0.0.1:3000/v1/health");
  assert.equal(observed.options.headers.Authorization, "Bearer " + token);
  assert.equal(observed.options.redirect, "error");
} finally {
  globalThis.fetch = previousFetch;
}
console.log("VPS client validation tests passed.");
