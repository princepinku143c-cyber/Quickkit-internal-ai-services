/**
 * Fetch and parse an upstream JSON response within a bounded deadline.
 * The timeout remains active while the response body is being read.
 */
export async function fetchJsonResponseWithTimeout(
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
    const response = await fetchImpl(input, { ...init, signal: controller.signal });
    if (!response || typeof response.json !== "function") {
      throw new TypeError("Upstream response must provide JSON.");
    }
    const data = await response.json();
    return {
      ok: response.ok !== false,
      status: Number.isInteger(response.status) ? response.status : null,
      data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJsonWithTimeout(input, init = {}, options = {}) {
  const response = await fetchJsonResponseWithTimeout(input, init, options);
  return response.data;
}
