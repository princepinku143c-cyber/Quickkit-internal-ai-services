import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mailers = [
  "../quickkit-automation-agent-main/lib/mailer.ts",
  "../quickkit-automation-agent-main/functions/emailWorker.ts",
];

for (const relativePath of mailers) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const transport = source.match(/createTransport\\s*\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)/);

  assert.ok(transport, `Expected a Nodemailer transport in ${relativePath}`);
  assert.match(transport[1], /\\bdisableFileAccess\\s*:\\s*true\\b/);
  assert.match(transport[1], /\\bdisableUrlAccess\\s*:\\s*true\\b/);
  assert.doesNotMatch(source, /\\braw\\s*:/, "Do not pass Nodemailer raw-message options");
}

console.log("Nodemailer transport file/URL access hardening tests passed.");
