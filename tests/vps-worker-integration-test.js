import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const token = "test-token-" + "x".repeat(48);
const port = 18000 + (process.pid % 10000);
const baseUrl = "http://127.0.0.1:" + port;
const worker = spawn(process.execPath, ["vps-automation/server.js"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "test",
    PORT: String(port),
    VPS_AUTOMATION_TOKEN: token,
    QUICKKIT_DEPLOY_SCRIPT: "",
    QUICKKIT_ALLOWED_DEPLOY_HOSTS: ""
  },
  stdio: ["ignore", "pipe", "pipe"]
});
let stderr = "";
worker.stderr.setEncoding("utf8");
worker.stderr.on("data", (chunk) => { stderr += chunk.slice(0, 4000); });

async function request(path, options = {}) {
  return fetch(baseUrl + path, { ...options, signal: AbortSignal.timeout(2500) });
}
try {
  let ready = false;
  for (let index = 0; index < 40; index += 1) {
    if (worker.exitCode !== null) throw new Error("VPS worker exited before starting: " + stderr);
    try {
      const response = await request("/health");
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(100);
  }
  assert.equal(ready, true, "VPS worker should start and expose public liveness.");
  const publicHealth = await request("/health");
  assert.equal((await publicHealth.json()).status, "UP");

  const unauthenticated = await request("/v1/health");
  assert.equal(unauthenticated.status, 401);
  const health = await request("/v1/health", { headers: { Authorization: "Bearer " + token } });
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.status, "CONNECTED");
  assert.deepEqual(healthBody.capabilities, ["read-only-jobs"]);
  assert.equal(healthBody.deploymentConfigured, false);

  const validTask = await request("/v1/jobs/execute", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "uptime", args: {}, requestId: "2b18fa7e-6c81-4c08-8d67-2a7a9ef87f51" })
  });
  assert.equal(validTask.status, 200);
  const result = await validTask.json();
  assert.equal(result.status, "SUCCEEDED");
  assert.equal(result.jobId, "uptime");
  assert.ok(typeof result.output === "string");

  const arbitraryCommand = await request("/v1/jobs/execute", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "exec", command: "id", requestId: "2b18fa7e-6c81-4c08-8d67-2a7a9ef87f51" })
  });
  assert.equal(arbitraryCommand.status, 400);

  const deployNotConfigured = await request("/v1/deploy", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: "test_project", userId: "test_user", requestId: "2b18fa7e-6c81-4c08-8d67-2a7a9ef87f51" })
  });
  assert.equal(deployNotConfigured.status, 503);
  assert.match((await deployNotConfigured.json()).error, /not configured/i);

  console.log("VPS worker HTTP integration tests passed (auth, health, read-only task, command rejection, deployment fails closed).");
} finally {
  worker.kill("SIGTERM");
}
