import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../api/webhook.js", import.meta.url), "utf8");
const errorCalls = [...source.matchAll(/console\\.error\\(\\s*([^)]+)\\)/g)]
  .map((match) => match[1].trim());

assert.deepEqual(
  errorCalls.sort(),
  [
    '"WEBHOOK_AI_DRAFT_FAILED"',
    '"WEBHOOK_ODOO_AUTH_FAILED"',
    '"WEBHOOK_ODOO_SYNC_FAILED"',
    '"WEBHOOK_PROCESSING_FAILED"',
  ].sort(),
  "Webhook error logs must use fixed event labels and must not serialize exception details."
);
assert.doesNotMatch(source, /console\\.error\\([^)]*(?:\\.message|JSON\\.stringify|err|odooErr)\\b/);
console.log("Webhook security tests passed: AI, Odoo, and request failures log fixed event labels only.");
