import { isPlainObject, safeText } from "./input.js";

export const EXECUTION_JOBS = Object.freeze({
  uptime: { label: "Check server uptime", description: "Read-only uptime and load status." },
  disk_usage: { label: "Check disk usage", description: "Read-only usage for the root filesystem." },
  memory_usage: { label: "Check memory usage", description: "Read-only memory summary." },
  docker_status: { label: "Check Docker status", description: "Read-only Docker daemon version/status." },
  docker_containers: { label: "List Docker containers", description: "Read-only list of container names, images, and states." },
  service_status: { label: "Check an approved service", description: "Read-only systemd status for an approved service." }
});

export const ALLOWED_SERVICES = Object.freeze(["docker", "n8n", "quickkit-worker"]);

export class VpsAdapterError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = "VpsAdapterError";
    this.status = status;
  }
}

export function validateExecutionRequest(body) {
  if (!isPlainObject(body)) return { ok: false, error: "Invalid execution payload." };
  if (Object.keys(body).some((key) => !["jobId", "args", "requestId"].includes(key))) {
    return { ok: false, error: "Unexpected execution payload fields." };
  }
  const jobId = safeText(body.jobId, 80);
  if (!Object.hasOwn(EXECUTION_JOBS, jobId)) {
    return { ok: false, error: "Unsupported task. Only approved read-only tasks can run." };
  }
  const args = {};
  if (jobId === "service_status") {
    if (!isPlainObject(body.args) || Object.keys(body.args).some((key) => key !== "service")) {
      return { ok: false, error: "Service status accepts only an allowlisted service name." };
    }
    const service = safeText(body.args.service, 80);
    if (!ALLOWED_SERVICES.includes(service)) return { ok: false, error: "Service is not allowlisted." };
    args.service = service;
  } else if (body.args !== undefined && (!isPlainObject(body.args) || Object.keys(body.args).length > 0)) {
    return { ok: false, error: "This task does not accept custom arguments." };
  }
  const requestId = safeText(body.requestId, 64);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return { ok: false, error: "A valid requestId is required." };
  }
  return { ok: true, jobId, args, requestId };
}

export function validateProjectId(value) {
  const projectId = safeText(value, 128);
  return /^[A-Za-z0-9_-]{1,128}$/.test(projectId) ? projectId : "";
}

function vpsConfiguration(env = process.env) {
  const rawUrl = safeText(env.VPS_AUTOMATION_URL, 2048);
  const token = typeof env.VPS_AUTOMATION_TOKEN === "string" ? env.VPS_AUTOMATION_TOKEN : "";
  if (!rawUrl || !token) throw new VpsAdapterError("VPS automation is not configured. No server action was started.", 503);
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new VpsAdapterError("VPS automation URL is invalid.", 503); }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new VpsAdapterError("VPS automation URL must not include credentials, query parameters, or fragments.", 503);
  }
  if (parsed.protocol !== "https:" && !(env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname))) {
    throw new VpsAdapterError("VPS automation must use HTTPS outside local development.", 503);
  }
  if (token.length < 32) throw new VpsAdapterError("VPS automation token must be at least 32 characters.", 503);
  return { baseUrl: parsed.toString().replace(/\/$/, ""), token };
}

export async function callVps(path, { method = "GET", body, requestId, env = process.env, timeoutMs = 8000 } = {}) {
  const allowedPaths = new Set(["/v1/health", "/v1/jobs/execute", "/v1/deploy"]);
  if (!allowedPaths.has(path)) throw new VpsAdapterError("Unsupported VPS operation.", 400);
  const { baseUrl, token } = vpsConfiguration(env);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(Math.max(timeoutMs, 1000), 15000));
  try {
    const response = await fetch(baseUrl + path, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(requestId ? { "X-Request-ID": requestId } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
      redirect: "error"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const code = response.status >= 500 ? 502 : response.status;
      throw new VpsAdapterError(safeText(payload.error || payload.message, 300) || "VPS automation rejected the request.", code);
    }
    if (!isPlainObject(payload)) throw new VpsAdapterError("VPS automation returned an invalid response.", 502);
    return payload;
  } catch (err) {
    if (err instanceof VpsAdapterError) throw err;
    if (err?.name === "AbortError") throw new VpsAdapterError("VPS automation timed out. Check the worker before retrying.", 504);
    throw new VpsAdapterError("VPS automation is unreachable. No result was confirmed.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
