import { readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDirectory = join(repositoryRoot, "api");
const supportedRouteExtensions = new Set([".js", ".mjs", ".cjs", ".ts"]);
const hobbyFunctionLimit = 12;

const routeFiles = readdirSync(apiDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && supportedRouteExtensions.has(extname(entry.name).toLowerCase()))
  .map((entry) => entry.name)
  .sort();

console.log(`Vercel Hobby API entrypoints: ${routeFiles.length}/${hobbyFunctionLimit}`);
for (const file of routeFiles) {
  console.log(`- api/${file}`);
}

if (routeFiles.length === 0) {
  console.error("No direct API entrypoints were found; check the route inventory.");
  process.exitCode = 1;
} else if (routeFiles.length > hobbyFunctionLimit) {
  console.error(
    `API entrypoint limit exceeded: found ${routeFiles.length}, maximum is ${hobbyFunctionLimit}.`
  );
  process.exitCode = 1;
}
