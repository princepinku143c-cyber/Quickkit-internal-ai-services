import assert from "node:assert/strict";
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

console.log("Cron authorization regression tests passed.");
