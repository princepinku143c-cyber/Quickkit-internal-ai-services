import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
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

// Every deployed API entrypoint must opt out of shared caching. These handlers
// carry user data, credentials, account state, or privileged operational output.
// Keep this guard in the existing CI test so a new route cannot silently omit it.
const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDirectory = join(repositoryRoot, "api");
const routeFiles = collectVercelApiEntrypoints(apiDirectory);
const noStoreHeader = /res\.setHeader\(\s*["']Cache-Control["']\s*,\s*["'][^"']*no-store[^"']*["']\s*\)/;
const setCorsHeadersWithNoStore = /const\s+setCorsHeaders\s*=\s*\(res\)\s*=>\s*\{[\s\S]*?res\.setHeader\(\s*["']Cache-Control["']\s*,\s*["'][^"']*no-store[^"']*["']\s*\)[\s\S]*?\};/;

for (const routeFile of routeFiles) {
  const source = readFileSync(join(apiDirectory, routeFile), "utf8");
  const defaultExportIndex = source.indexOf("export default");
  assert.notEqual(
    defaultExportIndex,
    -1,
    `API route api/${routeFile} must expose a default request handler.`
  );

  // All current route handlers are function or arrow-function exports. Locate
  // the handler body so helper functions declared above it cannot satisfy the
  // cache guard unless the handler actually invokes that helper.
  const handlerBodyStart = source.indexOf("{", defaultExportIndex);
  assert.notEqual(
    handlerBodyStart,
    -1,
    `API route api/${routeFile} must expose a block-bodied request handler.`
  );
  const handlerBody = source.slice(handlerBodyStart + 1);
  const directHeader = handlerBody.match(noStoreHeader);
  const helperCall = handlerBody.match(/\bsetCorsHeaders\s*\(\s*res\s*\)/);
  const helperDefinition = source.match(setCorsHeadersWithNoStore);
  const helperDefinedBeforeHandler = helperDefinition
    && helperDefinition.index < defaultExportIndex;
  const cacheGuardIndex = directHeader?.index
    ?? (helperDefinedBeforeHandler && helperCall ? helperCall.index : -1);

  assert.notEqual(
    cacheGuardIndex,
    -1,
    `API route api/${routeFile} must set Cache-Control: no-store in its handler or call a verified no-store CORS helper.`
  );

  // The cache policy must be installed before method handling or any response
  // can exit early (including OPTIONS and unsupported-method responses).
  const firstMethodOrResponse = handlerBody.search(
    /\breq\.method\b|\bres\.(?:status|json|end|send|writeHead|redirect)\s*\(/
  );
  assert.ok(
    firstMethodOrResponse === -1 || cacheGuardIndex < firstMethodOrResponse,
    `API route api/${routeFile} must apply Cache-Control: no-store before method checks and response paths.`
  );
}

console.log(`API cache policy tests passed: all ${routeFiles.length} Vercel API entrypoints install no-store before method handling or responses.`);
