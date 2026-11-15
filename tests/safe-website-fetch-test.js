import assert from "node:assert/strict";
import { fetchSafeWebsiteHtml } from "../services/safeWebsiteFetch.js";

const publicIPv4 = [{ address: "93.184.216.34", family: 4 }];
const publicIPv6 = [{ address: "2606:4700:4700::1111", family: 6 }];

async function rejectUrl(url) {
  await assert.rejects(
    fetchSafeWebsiteHtml(url, {
      resolveHost: async () => publicIPv4,
      requestOnce: async () => ({ statusCode: 200, body: "unexpected" }),
    })
  );
}

await rejectUrl("http://127.0.0.1");
await rejectUrl("http://[::1]");
await rejectUrl("http://localhost");
await rejectUrl("http://service.local");
await rejectUrl("https://user:pass@example.com");
await rejectUrl("https://example.com:8443");
await rejectUrl("ftp://example.com");

let requestCount = 0;
await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    resolveHost: async () => [{ address: "10.20.30.40", family: 4 }],
    requestOnce: async () => {
      requestCount += 1;
      return { statusCode: 200, body: "unexpected" };
    },
  })
);
assert.equal(requestCount, 0, "private DNS answers must be rejected before connecting");

await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    resolveHost: async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "169.254.169.254", family: 4 },
    ],
    requestOnce: async () => ({ statusCode: 200, body: "unexpected" }),
  })
);

await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    resolveHost: async () => [{ address: "fd00::1", family: 6 }],
    requestOnce: async () => ({ statusCode: 200, body: "unexpected" }),
  })
);

const safeHosts = [];
const safeResult = await fetchSafeWebsiteHtml("example.com/about", {
  resolveHost: async (hostname) => {
    safeHosts.push(hostname);
    return publicIPv4;
  },
  requestOnce: async (url, resolved, requestOptions) => {
    assert.equal(url.protocol, "https:");
    assert.equal(resolved.address, "93.184.216.34");
    assert.equal(requestOptions.maxBytes, 1_000_000);
    return { statusCode: 200, body: "<title>Public site</title>" };
  },
});
assert.deepEqual(safeHosts, ["example.com"]);
assert.equal(safeResult.statusCode, 200);
assert.match(safeResult.body, /Public site/);

const redirectHosts = [];
let redirectCalls = 0;
const redirectedResult = await fetchSafeWebsiteHtml("https://example.com", {
  resolveHost: async (hostname) => {
    redirectHosts.push(hostname);
    return publicIPv4;
  },
  requestOnce: async () => {
    redirectCalls += 1;
    if (redirectCalls === 1) {
      return { statusCode: 302, location: "https://www.example.com/landing" };
    }
    return { statusCode: 200, body: "redirected safely" };
  },
});
assert.deepEqual(redirectHosts, ["example.com", "www.example.com"]);
assert.equal(redirectCalls, 2);
assert.equal(redirectedResult.body, "redirected safely");

let privateRedirectCalls = 0;
await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    resolveHost: async (hostname) => hostname === "example.com"
      ? publicIPv4
      : [{ address: "192.168.1.10", family: 4 }],
    requestOnce: async () => {
      privateRedirectCalls += 1;
      return { statusCode: 302, location: "https://internal.example/admin" };
    },
  })
);
assert.equal(privateRedirectCalls, 1, "redirect destinations must be revalidated before connecting");

let literalRedirectCalls = 0;
await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    resolveHost: async () => publicIPv4,
    requestOnce: async () => {
      literalRedirectCalls += 1;
      return { statusCode: 302, location: "http://169.254.169.254/latest/meta-data" };
    },
  })
);
assert.equal(literalRedirectCalls, 1, "IP-literal redirects must be rejected");

const ipv6Result = await fetchSafeWebsiteHtml("https://example.com", {
  resolveHost: async () => publicIPv6,
  requestOnce: async (_url, resolved) => {
    assert.equal(resolved.family, 6);
    return { statusCode: 200, body: "public IPv6" };
  },
});
assert.equal(ipv6Result.body, "public IPv6");

let redirectLoopCalls = 0;
await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    maxRedirects: 1,
    resolveHost: async () => publicIPv4,
    requestOnce: async () => {
      redirectLoopCalls += 1;
      return { statusCode: 302, location: "https://example.com/next" };
    },
  })
);
assert.equal(redirectLoopCalls, 2);

let timedOutRequestCount = 0;
await assert.rejects(
  fetchSafeWebsiteHtml("https://example.com", {
    timeoutMs: 10,
    resolveHost: async () => new Promise(() => {}),
    requestOnce: async () => {
      timedOutRequestCount += 1;
      return { statusCode: 200, body: "unexpected" };
    },
  }),
  /DNS lookup timed out/
);
assert.equal(timedOutRequestCount, 0, "a stalled DNS lookup must time out before connecting");

console.log("Safe website fetch tests passed: private/IP-literal targets, mixed DNS answers, IPv6 ranges, redirects, redirect loops, and public pinned destinations.");
