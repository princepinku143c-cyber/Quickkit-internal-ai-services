import assert from "node:assert/strict";
import { generateAeoQaPairs, parseAeoQaPairs } from "../api/services/opencodeService.js";

const originalFetch = globalThis.fetch;
const originalKey = process.env.OPENCODE_API_KEY;
const originalModel = process.env.OPENCODE_MODEL;
const originalUrl = process.env.OPENCODE_API_URL;
try {
  assert.deepEqual(parseAeoQaPairs('[{"question":"Q?","answer":"A."}]', 1), [{ question: "Q?", answer: "A." }]);
  assert.deepEqual(parseAeoQaPairs('```json\n[{"question":"Q?","answer":"A."}]\n```', 1), [{ question: "Q?", answer: "A." }]);
  assert.throws(() => parseAeoQaPairs("not json", 1), /invalid JSON/i);
  assert.throws(() => parseAeoQaPairs('[{"question":"Q?"}]', 1), /missing/i);
  assert.throws(() => parseAeoQaPairs("[]", 1), /unexpected number/i);
  delete process.env.OPENCODE_API_KEY;
  await assert.rejects(() => generateAeoQaPairs({ keyword: "test" }), /not configured/i);
  process.env.OPENCODE_API_KEY = "test-only-secret";
  process.env.OPENCODE_MODEL = "test-model";
  process.env.OPENCODE_API_URL = "https://provider.test/v1/chat/completions";
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://provider.test/v1/chat/completions");
    requestOptions = options;
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: '[{"question":"Buyer question?","answer":"Careful answer."}]' } }] }) };
  };
  const result = await generateAeoQaPairs({ keyword: "real estate AI", count: 1 });
  assert.equal(result.model, "test-model");
  assert.equal(result.items.length, 1);
  assert.equal(requestOptions.headers.Authorization, "Bearer test-only-secret");
  assert.equal(JSON.parse(requestOptions.body).model, "test-model");
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  await assert.rejects(() => generateAeoQaPairs({ keyword: "test" }), /HTTP 429/);
  globalThis.fetch = async () => { throw new Error("network down"); };
  await assert.rejects(() => generateAeoQaPairs({ keyword: "test" }), /could not be reached/i);
  await assert.rejects(() => generateAeoQaPairs({ keyword: "test", count: 11 }), /between 1 and 10/);
  console.log("OpenCode service tests passed: parsing, validation, secret handling, custom config, HTTP errors and network errors.");
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENCODE_API_KEY; else process.env.OPENCODE_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.OPENCODE_MODEL; else process.env.OPENCODE_MODEL = originalModel;
  if (originalUrl === undefined) delete process.env.OPENCODE_API_URL; else process.env.OPENCODE_API_URL = originalUrl;
}
