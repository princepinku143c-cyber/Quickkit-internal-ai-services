import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const supportedRouteExtensions = new Set([".js", ".mjs", ".cjs", ".ts"]);

/**
 * Collect Vercel API entrypoints recursively.
 *
 * Vercel treats underscore-prefixed and dot-prefixed paths as utility files,
 * not Serverless Functions. TypeScript declaration files are also excluded.
 */
export function collectVercelApiEntrypoints(apiDirectory) {
  const routeFiles = [];

  function visit(directory, relativeSegments = []) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      // Match Vercel's private utility-path convention at every path level.
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

      const entryPath = join(directory, entry.name);
      const nextSegments = [...relativeSegments, entry.name];

      if (entry.isDirectory()) {
        visit(entryPath, nextSegments);
        continue;
      }

      if (
        entry.isFile()
        && !entry.name.endsWith(".d.ts")
        && supportedRouteExtensions.has(extname(entry.name).toLowerCase())
      ) {
        routeFiles.push(nextSegments.join("/"));
      }
    }
  }

  visit(apiDirectory);
  return routeFiles.sort();
}
