export const ALLOWED_SERVICES = Object.freeze(["docker", "n8n", "quickkit-worker"]);

export const TASKS = Object.freeze({
  uptime: { label: "Server uptime", command: "uptime", args: [] },
  disk_usage: { label: "Disk usage", command: "df", args: ["-h", "/"] },
  memory_usage: { label: "Memory usage", command: "free", args: ["-h"] },
  docker_status: { label: "Docker daemon status", command: "docker", args: ["info", "--format", "{{.ServerVersion}}"] },
  docker_containers: { label: "Docker containers", command: "docker", args: ["ps", "--format", "{{.Names}}\\t{{.Status}}\\t{{.Image}}"] }
});

export class PolicyError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function validateJobRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new PolicyError("Invalid task payload.");
  if (Object.keys(body).some((key) => !["jobId", "args", "requestId"].includes(key))) {
    throw new PolicyError("Unexpected task payload fields.");
  }
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const args = body.args === undefined ? {} : body.args;
  if (!args || typeof args !== "object" || Array.isArray(args)) throw new PolicyError("Task args must be an object.");
  if (jobId === "service_status") {
    if (Object.keys(args).some((key) => key !== "service") || !ALLOWED_SERVICES.includes(args.service)) {
      throw new PolicyError("Service is not allowlisted.");
    }
    return { jobId, command: "systemctl", args: ["is-active", "--", args.service], service: args.service, label: "Approved service status" };
  }
  if (!Object.hasOwn(TASKS, jobId)) throw new PolicyError("Unsupported task. Arbitrary shell commands are disabled.");
  if (Object.keys(args).length > 0) throw new PolicyError("This task does not accept custom arguments.");
  return { jobId, ...TASKS[jobId] };
}

export function validateRequestId(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validateIdentity(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => !["projectId", "userId", "requestId"].includes(key))) {
    throw new PolicyError("Unexpected deployment payload fields.");
  }
  const { projectId, userId, requestId } = input;
  if (typeof projectId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(projectId)) throw new PolicyError("Invalid project ID.");
  if (typeof userId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(userId)) throw new PolicyError("Invalid user ID.");
  if (!validateRequestId(requestId)) throw new PolicyError("A valid requestId is required.");
  return { projectId, userId, requestId };
}

export function cleanOutput(value, maxLength = 12000) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, maxLength);
}

export function parseDeploymentResult(stdout, allowedHosts) {
  let result;
  try { result = JSON.parse(String(stdout || "")); } catch { throw new PolicyError("Deployment runner did not return valid JSON.", 502); }
  if (!result || result.status !== "SUCCEEDED" || typeof result.url !== "string") {
    throw new PolicyError("Deployment runner did not confirm a successful deployment.", 502);
  }
  let url;
  try { url = new URL(result.url); } catch { throw new PolicyError("Deployment runner returned an invalid URL.", 502); }
  const hosts = String(allowedHosts || "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || (url.port && url.port !== "443") || !hosts.length || !hosts.includes(url.hostname.toLowerCase())) {
    throw new PolicyError("Deployment URL must use HTTPS and match QUICKKIT_ALLOWED_DEPLOY_HOSTS.", 502);
  }
  return { status: "SUCCEEDED", url: url.toString(), deploymentId: cleanOutput(result.deploymentId || "", 128) };
}
