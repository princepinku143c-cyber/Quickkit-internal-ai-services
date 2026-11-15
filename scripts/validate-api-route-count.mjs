import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectVercelApiEntrypoints } from "./api-route-inventory.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDirectory = join(repositoryRoot, "api");
const hobbyFunctionLimit = 12;
const routeFiles = collectVercelApiEntrypoints(apiDirectory);

console.log(`Vercel Hobby API entrypoints: ${routeFiles.length}/${hobbyFunctionLimit}`);
for (const file of routeFiles) {
  console.log(`- api/${file}`);
}

if (routeFiles.length === 0) {
  console.error("No API entrypoints were found; check the route inventory.");
  process.exitCode = 1;
} else if (routeFiles.length > hobbyFunctionLimit) {
  console.error(
    `API entrypoint limit exceeded: found ${routeFiles.length}, maximum is ${hobbyFunctionLimit}.`
  );
  process.exitCode = 1;
}
