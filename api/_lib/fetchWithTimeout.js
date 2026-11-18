/**
 * Run an upstream fetch with a bounded deadline.
 * The abort signal is local to this request and never exposes request data.
 */
export async function fetchWithTimeout(
  input,
  init = {},
  { timeoutMs = 7000, fetchImpl = globalThis.fetch } = {},
) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new RangeError("timeoutMs must be an integer between 1 and 30000.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error("Upstream request timed out.")),
    timeoutMs,
  );

  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
