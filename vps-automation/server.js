import express from "express";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, timingSafeEqual } from "node:crypto";
import { access, realpath } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { PolicyError, cleanOutput, parseDeploymentResult, validateIdentity, validateJobRequest, validateRequestId } from "./policy.js";

const execFileAsync = promisify(execFile);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const AUTH_TOKEN = process.env.VPS_AUTOMATION_TOKEN || "";
const MAX_OUTPUT = 12_000;
const TASK_TIMEOUT_MS = 7_000;
const DEPLOY_TIMEOUT_MS = Math.min(Math.max(Number(process.env.QUICKKIT_DEPLOY_TIMEOUT_MS || 12_000), 1_000), 15_000);

if (AUTH_TOKEN.length < 32) {
  console.error("VPS_AUTOMATION_TOKEN must be configured with at least 32 characters.");
  process.exit(1);
}

app.disable("x-powered-by");
app.set("trust proxy", false);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(express.json({ limit: "16kb", strict: true, type: "application/json" }));

const windows = new Map();
function workerRateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.socket.remoteAddress || "unknown";
  let entry = windows.get(ip);
  if (!entry || now - entry.startedAt >= 60_000) entry = { startedAt: now, count: 0 };
  entry.count += 1;
  windows.set(ip, entry);
  if (windows.size > 5000) {
    for (const [key, value] of windows) if (now - value.startedAt >= 60_000) windows.delete(key);
  }
  if (entry.count > 120) return res.status(429).json({ error: "Worker rate limit exceeded." });
  next();
}

function sameToken(supplied) {
  if (typeof supplied !== "string" || supplied.length > 4096) return false;
  const expectedHash = createHash("sha256").update(AUTH_TOKEN).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash) && supplied.length === AUTH_TOKEN.length;
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!sameToken(token)) return res.status(401).json({ error: "Unauthorized." });
  next();
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

async function runApprovedTask(spec) {
  try {
    const { stdout, stderr } = await execFileAsync(spec.command, spec.args, {
      timeout: TASK_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT,
      windowsHide: true,
      encoding: "utf8",
      shell: false,
      env: { PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", LANG: "C", LC_ALL: "C" }
    });
    return { output: cleanOutput(stdout || stderr || "(No output)"), exitCode: 0 };
  } catch (err) {
    if (spec.jobId === "service_status" && [3, 4, "3", "4"].includes(err.code)) {
      return { output: cleanOutput(err.stdout || "inactive"), exitCode: Number(err.code) };
    }
    if (err.code === "ENOENT") throw new PolicyError("A required system utility is unavailable on this VPS.", 503);
    if (err.killed || err.code === "ETIMEDOUT") throw new PolicyError("Task timed out. No arbitrary command was executed.", 504);
    throw new PolicyError("Approved read-only task failed. Check utility installation and worker logs.", 502);
  }
}

async function runDeploymentRunner(identity) {
  const configuredRoot = process.env.QUICKKIT_DEPLOY_ROOT || "/opt/quickkit/scripts";
  const configuredScript = process.env.QUICKKIT_DEPLOY_SCRIPT || "";
  const allowedHosts = process.env.QUICKKIT_ALLOWED_DEPLOY_HOSTS || "";
  if (!configuredScript || !allowedHosts.trim()) {
    throw new PolicyError("Deployment runner or deployment host allowlist is not configured.", 503);
  }

  let rootReal;
  let scriptReal;
  try {
    rootReal = await realpath(configuredRoot);
    scriptReal = await realpath(configuredScript);
    await access(scriptReal, fsConstants.X_OK);
  } catch {
    throw new PolicyError("Configured deployment runner is missing or not executable.", 503);
  }
  const relative = path.relative(rootReal, scriptReal);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PolicyError("Deployment runner must be inside QUICKKIT_DEPLOY_ROOT.", 503);
  }

  const runner = spawn(scriptReal, ["--project-id", identity.projectId, "--user-id", identity.userId, "--request-id", identity.requestId], {
    cwd: rootReal,
    shell: false,
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"],
    env: { PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", LANG: "C", LC_ALL: "C", HOME: process.env.HOME || "/root" }
  });
  let stdout = "";
  let stderr = "";
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    runner.kill("SIGKILL");
  }, DEPLOY_TIMEOUT_MS);
  runner.stdout.setEncoding("utf8");
  runner.stderr.setEncoding("utf8");
  runner.stdout.on("data", (chunk) => { if (stdout.length < MAX_OUTPUT) stdout += chunk.slice(0, MAX_OUTPUT - stdout.length); });
  runner.stderr.on("data", (chunk) => { if (stderr.length < 3000) stderr += chunk.slice(0, 3000 - stderr.length); });
  runner.stdin.on("error", () => {});
  runner.stdin.end(JSON.stringify(identity));
  try {
    const exitCode = await new Promise((resolve, reject) => {
      runner.once("error", reject);
      runner.once("close", (code) => resolve(code));
    });
    if (timedOut) throw new PolicyError("Deployment runner timed out. Inspect runner logs before retrying.", 504);
    if (exitCode !== 0) {
      console.error("Deployment runner failed:", cleanOutput(stderr, 2000));
      throw new PolicyError("Deployment runner failed. No successful deployment was confirmed.", 502);
    }
    return parseDeploymentResult(stdout, allowedHosts);
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/health", (_req, res) => res.status(200).json({ status: "UP", version: "2.0.0" }));

app.get("/v1/health", workerRateLimit, authenticate, (_req, res) => {
  const deploymentConfigured = Boolean(
    process.env.QUICKKIT_DEPLOY_SCRIPT &&
    process.env.QUICKKIT_ALLOWED_DEPLOY_HOSTS &&
    process.env.QUICKKIT_ALLOWED_DEPLOY_HOSTS.split(",").map((host) => host.trim()).some(Boolean)
  );
  res.status(200).json({
    status: "CONNECTED",
    version: "2.0.0",
    capabilities: ["read-only-jobs", ...(deploymentConfigured ? ["deployment-runner-configured"] : [])],
    deploymentConfigured
  });
});

app.post("/v1/jobs/execute", workerRateLimit, authenticate, asyncRoute(async (req, res) => {
  const job = validateJobRequest(req.body);
  if (!validateRequestId(req.body.requestId)) throw new PolicyError("A valid requestId is required.");
  const result = await runApprovedTask(job);
  return res.status(200).json({
    status: "SUCCEEDED",
    jobId: job.jobId,
    label: job.label,
    output: result.output,
    exitCode: result.exitCode,
    requestId: req.body.requestId,
    completedAt: new Date().toISOString()
  });
}));

app.post("/v1/deploy", workerRateLimit, authenticate, asyncRoute(async (req, res) => {
  const identity = validateIdentity(req.body || {});
  const result = await runDeploymentRunner(identity);
  return res.status(200).json({ ...result, requestId: identity.requestId, completedAt: new Date().toISOString() });
}));

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError) return res.status(400).json({ error: "Invalid JSON payload." });
  const status = Number.isInteger(err?.status) ? err.status : 500;
  if (status >= 500) console.error("VPS worker request failed:", cleanOutput(err?.message || "unknown error", 500));
  return res.status(status).json({ error: status >= 500 ? cleanOutput(err?.message || "Worker request failed.", 300) : err.message });
});

app.listen(PORT, HOST, () => {
  console.log("QuickKit VPS automation worker listening on " + HOST + ":" + PORT + "; arbitrary shell execution is disabled.");
});

export { app };
