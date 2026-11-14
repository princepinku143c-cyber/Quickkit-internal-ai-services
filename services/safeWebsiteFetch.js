import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";

const blockedIPv4 = new BlockList();
for (const [subnet, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
]) {
  blockedIPv4.addSubnet(subnet, prefix, "ipv4");
}

const globalIPv6 = new BlockList();
globalIPv6.addSubnet("2000::", 3, "ipv6");

const blockedIPv6 = new BlockList();
for (const [subnet, prefix] of [
  ["2001::", 23],
  ["2002::", 16],
  ["3fff::", 20],
]) {
  blockedIPv6.addSubnet(subnet, prefix, "ipv6");
}

const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const blockedHostSuffixes = [
  ".localhost",
  ".local",
  ".internal",
  ".home.arpa",
  ".test",
  ".example",
  ".invalid",
  ".onion",
  ".svc",
];

function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) return !blockedIPv4.check(address, "ipv4");
  if (family === 6) {
    return globalIPv6.check(address, "ipv6") && !blockedIPv6.check(address, "ipv6");
  }
  return false;
}

function parseWebsiteUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("A website URL is required.");
  }

  const candidate = input.trim();
  const normalized = /^https?:\/\//i.test(candidate) ? candidate : "https://" + candidate;
  const url = new URL(normalized);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS websites are allowed.");
  }
  if (url.username || url.password) {
    throw new Error("Website URLs cannot contain credentials.");
  }

  const expectedPort = url.protocol === "https:" ? "443" : "80";
  if (url.port && url.port !== expectedPort) {
    throw new Error("Custom website ports are not allowed.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (!hostname || isIP(hostname) !== 0 || !hostname.includes(".")) {
    throw new Error("A public DNS hostname is required.");
  }
  if (hostname === "localhost" || blockedHostSuffixes.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error("Local and internal hostnames are not allowed.");
  }

  url.hostname = hostname;
  url.hash = "";
  return url;
}

function requestPinned(url, resolved, { timeoutMs, maxBytes }) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    let timer;
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      callback(value);
    };

    const pinnedLookup = (_hostname, options, callback) => {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (options?.all) {
        callback(null, [{ address: resolved.address, family: resolved.family }]);
      } else {
        callback(null, resolved.address, resolved.family);
      }
    };

    const request = transport.request(url, {
      method: "GET",
      agent: false,
      lookup: pinnedLookup,
      servername: url.protocol === "https:" ? hostname : undefined,
      headers: {
        "User-Agent": "QuickKitAI-Website-Inspector/1.0",
        "Accept": "text/html",
      },
    }, (response) => {
      const statusCode = Number(response.statusCode) || 0;
      const location = typeof response.headers.location === "string" ? response.headers.location : null;

      if (redirectStatuses.has(statusCode) && location) {
        response.resume();
        response.once("end", () => finish(resolve, { statusCode, location, body: "" }));
        response.once("error", (error) => finish(reject, error));
        return;
      }

      const chunks = [];
      let receivedBytes = 0;
      response.on("data", (chunk) => {
        receivedBytes += chunk.length;
        if (receivedBytes > maxBytes) {
          request.destroy(Object.assign(new Error("Website response exceeded the size limit."), {
            code: "RESPONSE_TOO_LARGE",
          }));
          return;
        }
        chunks.push(chunk);
      });
      response.once("end", () => {
        finish(resolve, {
          statusCode,
          location,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
      response.once("aborted", () => finish(reject, new Error("Website response was aborted.")));
      response.once("error", (error) => finish(reject, error));
    });

    request.once("error", (error) => finish(reject, error));
    timer = setTimeout(() => {
      request.destroy(Object.assign(new Error("Website request timed out."), { code: "ETIMEDOUT" }));
    }, timeoutMs);
    request.end();
  });
}

async function resolveWithTimeout(resolveHost, hostname, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      resolveHost(hostname),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(Object.assign(new Error("Website DNS lookup timed out."), { code: "ETIMEDOUT" }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchSafeWebsiteHtml(input, options = {}) {
  const resolveHost = options.resolveHost || ((hostname) =>
    dns.lookup(hostname, { all: true, verbatim: true }));
  const requestOnce = options.requestOnce || requestPinned;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Math.max(1, options.timeoutMs) : 3000;
  const maxBytes = Number.isFinite(options.maxBytes) ? Math.max(1, options.maxBytes) : 1_000_000;
  const maxRedirects = Number.isInteger(options.maxRedirects) ? Math.max(0, options.maxRedirects) : 3;
  const deadline = Date.now() + timeoutMs;
  let currentUrl = parseWebsiteUrl(input);

  for (let redirectCount = 0; ; redirectCount += 1) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new Error("Website request timed out.");

    const addresses = await resolveWithTimeout(resolveHost, currentUrl.hostname, remainingMs);
    if (!Array.isArray(addresses) || addresses.length === 0 ||
        addresses.some((entry) => !entry || !isPublicAddress(entry.address))) {
      throw new Error("Website hostname resolved to a non-public address.");
    }

    const resolved = {
      address: addresses[0].address,
      family: isIP(addresses[0].address),
    };
    const response = await requestOnce(currentUrl, resolved, {
      timeoutMs: remainingMs,
      maxBytes,
    });
    if (!response || !Number.isInteger(response.statusCode)) {
      throw new Error("Website request returned an invalid response.");
    }

    if (redirectStatuses.has(response.statusCode) && response.location) {
      if (redirectCount >= maxRedirects) {
        throw new Error("Website exceeded the redirect limit.");
      }
      currentUrl = parseWebsiteUrl(new URL(response.location, currentUrl).toString());
      continue;
    }

    return {
      statusCode: response.statusCode,
      body: typeof response.body === "string" ? response.body : "",
    };
  }
}
