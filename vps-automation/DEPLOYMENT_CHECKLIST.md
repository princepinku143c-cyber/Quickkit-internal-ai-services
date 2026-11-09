# VPS deployment checklist

This checklist is for an operator preparing the QuickKit worker. It does not deploy anything by itself.

## 1. Prepare the worker host

- Use a dedicated, non-root service account and keep the worker behind HTTPS (typically a reverse proxy).
- Install Node.js 20 or newer.
- Copy `vps-automation/` to a dedicated worker directory and run `npm ci --omit=dev`.
- Generate a random token with at least 32 characters. Store it in the worker service manager, not in Git.
- Keep the worker bound to loopback if the reverse proxy is on the same host; otherwise bind only to a private interface and restrict the firewall.

## 2. Configure the API gateway

Set these Vercel environment variables in the intended environment:

- `VPS_AUTOMATION_URL`: HTTPS base URL of the worker, without credentials or query parameters.
- `VPS_AUTOMATION_TOKEN`: the same random token configured on the worker.

Redeploy the Vercel environment after configuring them. Use a dedicated preview/staging environment first.

## 3. Validate connection and read-only tasks

- Call the authenticated VPS test from the AI terminal and confirm the reported worker version.
- Run only the approved read-only checks: uptime, disk, memory, Docker status/containers, or status for an explicitly allowlisted service.
- Confirm invalid jobs and missing credentials fail closed.
- Verify server-side credit reservation, replay/idempotency, and refund behavior against a dedicated staging Firebase project/user. Do not run mutating tests against production data.

## 4. Enable deployment only after review

Real deployment remains disabled unless both `QUICKKIT_DEPLOY_SCRIPT` and `QUICKKIT_ALLOWED_DEPLOY_HOSTS` are configured on the worker. The executable must resolve inside `QUICKKIT_DEPLOY_ROOT`, validate project ownership/configuration, implement request-ID idempotency, and return a success JSON response only after the resulting deployment is actually healthy.

- Review the deployment runner and its privilege boundary.
- Ensure returned URLs are HTTPS and their hostnames exactly match `QUICKKIT_ALLOWED_DEPLOY_HOSTS`.
- Prove duplicate requests do not create duplicate deployments.
- Test failure, timeout, host mismatch, and rollback paths in staging.
- Only then consider enabling the same worker for production.

## Important

A successful build or local worker integration test does not mean a real VPS is connected. A real deployment is not verified until the connection test succeeds against the configured worker and the reviewed deployment runner completes an isolated staging deployment.