import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isAdminAppBoundToProject, selectAdminAppForProject } from "../api/_lib/firebaseProjectBinding.js";

const matchingApp = { options: { projectId: "quickkit-preview" } };
const mismatchedApp = { options: { projectId: "quickkit-production" } };
const unboundApp = { options: {} };

assert.equal(isAdminAppBoundToProject("quickkit-preview", "quickkit-preview"), true);
assert.equal(isAdminAppBoundToProject("quickkit-production", "quickkit-preview"), false);
assert.equal(isAdminAppBoundToProject(undefined, "quickkit-preview"), false);
assert.equal(isAdminAppBoundToProject("quickkit-preview", undefined), true);
assert.equal(isAdminAppBoundToProject(" quickkit-preview ", "quickkit-preview "), true);

assert.deepEqual(
  selectAdminAppForProject([mismatchedApp, matchingApp], "quickkit-preview"),
  { app: matchingApp, blocked: false },
  "A matching existing app must be selected even when another project app appears first.",
);
assert.deepEqual(
  selectAdminAppForProject([mismatchedApp], "quickkit-preview"),
  { app: null, blocked: true },
  "A configured target must not silently reuse an app bound to another project.",
);
assert.deepEqual(
  selectAdminAppForProject([unboundApp], "quickkit-preview"),
  { app: null, blocked: true },
  "An explicitly configured target must reject an existing app with unknown project binding.",
);
assert.deepEqual(
  selectAdminAppForProject([], "quickkit-preview"),
  { app: null, blocked: false },
  "No existing app allows normal initialization with the configured credentials.",
);
assert.deepEqual(
  selectAdminAppForProject([mismatchedApp], " "),
  { app: mismatchedApp, blocked: false },
  "An absent explicit target preserves existing ADC/app discovery behavior.",
);

const rootAdmin = await readFile(new URL("../api/_lib/firebaseAdmin.js", import.meta.url), "utf8");
assert.ok(
  rootAdmin.includes("selectAdminAppForProject(getApps(), credentials.projectId)"),
  "Root Firebase Admin must select an app bound to the configured project.",
);
assert.ok(
  rootAdmin.includes("if (!app && !adminAppSelection.blocked)"),
  "Root Firebase Admin must fail closed instead of initializing after an unverified existing app.",
);
assert.match(
  rootAdmin,
  /get apps\(\)\s*\{\s*return app \? \[app\] : \[\];/,
  "The public apps list must expose only the validated app.",
);
assert.match(
  rootAdmin,
  /projectId: process\.env\.FIREBASE_PROJECT_ID\?\.trim\(\)/,
  "The configured Firebase project ID must be normalized before binding.",
);

console.log("Root Firebase Admin project-binding regression tests passed.");
