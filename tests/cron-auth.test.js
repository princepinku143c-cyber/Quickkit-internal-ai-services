import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { hasValidCronAuthorization } from "../api/_lib/cronAuth.js";

const secret = "test-cron-secret-with-sufficient-entropy";

assert.equal(hasValidCronAuthorization(`Bearer ${secret}`, secret), true);
assert.equal(hasValidCronAuthorization("Bearer wrong-secret", secret), false);
assert.equal(hasValidCronAuthorization(`Bearer ${secret}`, ""), false);
assert.equal(hasValidCronAuthorization(`Bearer ${secret}`, undefined), false);
assert.equal(hasValidCronAuthorization(undefined, secret), false);
assert.equal(hasValidCronAuthorization(`Basic ${secret}`, secret), false);
assert.equal(hasValidCronAuthorization([`Bearer ${secret}`], secret), false);
assert.equal(hasValidCronAuthorization(`Bearer ${secret} `, secret), false);

const outreachSource = await readFile(new URL("../api/outreach.js", import.meta.url), "utf8");
assert.equal(/x-vercel-cron/i.test(outreachSource), false, "outreach must not trust a caller-supplied cron marker header");
assert.ok(
  outreachSource.includes("hasValidCronAuthorization(authHeader, process.env.CRON_SECRET)"),
  "outreach queue processing must require the configured cron bearer secret",
);

console.log("Cron authorization regression tests passed.");
