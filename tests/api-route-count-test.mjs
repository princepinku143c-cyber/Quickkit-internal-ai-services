import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectVercelApiEntrypoints } from "../scripts/api-route-inventory.mjs";

const fixture = mkdtempSync(join(tmpdir(), "quickkit-api-route-inventory-"));

try {
  mkdirSync(join(fixture, "nested"), { recursive: true });
  mkdirSync(join(fixture, "_lib", "nested"), { recursive: true });
  mkdirSync(join(fixture, ".private"), { recursive: true });

  for (const file of [
    "index.js",
    "nested/route.ts",
    "nested/worker.mjs",
    "_helper.js",
    "_lib/firebaseAdmin.js",
    "_lib/nested/security.cjs",
    ".private/hidden.js",
    "types.d.ts",
    "notes.md",
  ]) {
    const path = join(fixture, file);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, "// fixture\n");
  }

  assert.deepEqual(
    collectVercelApiEntrypoints(fixture),
    ["index.js", "nested/route.ts", "nested/worker.mjs"],
    "nested API routes count, while private utility paths and declaration files do not"
  );
  console.log("API route inventory tests passed: nested routes are counted and Vercel utility paths are excluded.");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
