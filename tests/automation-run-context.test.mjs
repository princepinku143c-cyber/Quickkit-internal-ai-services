import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../quickkit-automation-agent-main/App.tsx", import.meta.url), "utf8");
const modal = await readFile(new URL("../quickkit-automation-agent-main/components/RunModal.tsx", import.meta.url), "utf8");

assert.match(app, /<RunModal[\\s\\S]*?projectId=\\{currentProject\\?\\.id\\}/);
assert.match(modal, /projectId\\?: string;/);
assert.match(modal, /const resolvedProjectId = resumeState\\?\\.projectId \\|\\| projectId\\?\\.trim\\(\\) \\|\\| 'test-project';/);
assert.match(modal, /user\\?\\.uid \\|\\| 'guest',\\s*resolvedProjectId,/);
assert.match(modal, /projectId:\\s*resolvedProjectId,/);
assert.doesNotMatch(modal, /projectId:\\s*'test-project'/);
assert.doesNotMatch(modal, /user\\?\\.uid \\|\\| 'guest',\\s*'test-project',/);

console.log("PASS: local and cloud automation runs retain the active or resumed project ID.");
