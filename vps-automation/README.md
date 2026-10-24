# QuickKit VPS Automation Worker

The worker exposes authenticated, bounded operations. It deliberately does not expose a generic shell or arbitrary command endpoint.

## Capabilities

- GET /health: public liveness only; reveals no configuration.
- GET /v1/health: authenticated worker connectivity check.
- POST /v1/jobs/execute: allowlisted read-only jobs: uptime, disk_usage, memory_usage, docker_status, docker_containers, and service_status for docker, n8n, or quickkit-worker.
- POST /v1/deploy: invokes only a configured executable deployment runner inside QUICKKIT_DEPLOY_ROOT. It reports success only if the runner exits successfully and returns JSON with status SUCCEEDED and an HTTPS URL on the configured host allowlist.

## Install

Use a dedicated non-root OS account where possible. Do not expose the service directly to the public internet without a firewall/reverse proxy and TLS. Configure a high-entropy VPS_AUTOMATION_TOKEN shared with the Vercel environment variable of the same name. Set VPS_AUTOMATION_URL in Vercel to the HTTPS base URL of this worker. Keep both secrets out of source control and never log them.

Install Node.js 20+, then run npm ci --omit=dev in this directory. Copy .env.example to .env and fill in secrets through the production service manager rather than committing them. The worker binds to 127.0.0.1 by default; keep that default when a reverse proxy on the same machine forwards traffic locally. If the reverse proxy is elsewhere, bind only to a private interface and restrict traffic at the firewall.

The worker uses a small JSON body limit, response headers, rate limiting, constant-time token comparison, execution timeouts, bounded output and shell=false. Restrict inbound traffic to the API gateway/reverse proxy where feasible.

## Deployment runner contract

Deployment is intentionally disabled unless both QUICKKIT_DEPLOY_SCRIPT and QUICKKIT_ALLOWED_DEPLOY_HOSTS are configured. The executable must resolve to a file inside the real path of QUICKKIT_DEPLOY_ROOT. It receives only validated project, user and request IDs as arguments plus the same identity JSON on stdin. It must implement its own idempotency using requestId, validate that the requested project is configured, and output one JSON object only after verifying the real deployment is ready.

Example runner JSON output:
{"status":"SUCCEEDED","url":"https://agents.example.com/project-123","deploymentId":"deploy-123"}

The returned URL hostname must exactly match one of the comma-separated QUICKKIT_ALLOWED_DEPLOY_HOSTS entries. The runner must not accept end-user shell commands or arbitrary project paths. Deployment remains unavailable until a real reviewed runner and the host allowlist are configured.
