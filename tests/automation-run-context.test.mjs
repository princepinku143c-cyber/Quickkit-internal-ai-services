import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../quickkit-automation-agent-main/App.tsx", import.meta.url), "utf8");
const modal = await readFile(new URL("../quickkit-automation-agent-main/components/RunModal.tsx", import.meta.url), "utf8");
const engine = await readFile(new URL("../quickkit-automation-agent-main/services/executionEngine.ts", import.meta.url), "utf8");

assert.ok(app.includes("projectId={currentProject?.id}"), "App must pass the active project ID to RunModal.");
assert.ok(modal.includes("projectId?: string;"), "RunModal must accept an optional project ID.");
assert.ok(
  modal.includes("const resolvedProjectId = resumeState?.projectId || projectId?.trim() || 'test-project';"),
  "Resumed runs must retain their saved project ID; new runs must use the active project ID.",
);
assert.ok(
  modal.includes("user?.uid || 'guest',\n          resolvedProjectId,"),
  "Local workflow execution must receive the resolved project ID.",
);
assert.ok(
  modal.includes("projectId: resolvedProjectId,"),
  "Cloud run documents must store the resolved project ID.",
);
assert.ok(!modal.includes("projectId: 'test-project'"), "Cloud runs must not hardcode the placeholder project ID.");
assert.ok(
  !modal.includes("user?.uid || 'guest',\n          'test-project',"),
  "Local runs must not hardcode the placeholder project ID.",
);

assert.ok(modal.includes("Cloud runs require an authenticated account."), "Cloud runs must require a signed-in user.");
assert.ok(modal.includes("Cloud runs require a saved project."), "Cloud runs must reject the placeholder project.");
assert.ok(engine.includes("const isPersistableProjectId ="), "Local runs without a saved project must not persist placeholder checkpoints.");
assert.ok(engine.includes("if (!isPersistableProjectId(this.state.projectId)) return;"), "Checkpoint writes must require a real project ID.");
assert.ok(engine.includes("if (isPersistableProjectId(this.state.projectId)) {"), "Checkpoint cleanup must require a real project ID.");

console.log("PASS: local and cloud automation runs retain the active project; cloud runs require authentication and a saved owner project.");
