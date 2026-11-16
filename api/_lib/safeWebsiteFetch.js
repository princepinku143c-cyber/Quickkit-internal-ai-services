import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_MAX_BYTES = 512 * 1024;

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".test",
  ".invalid",
  ".example",
  ".home.arpa", // RFC 8375 home-network namespace
  ".onion",
];

function isPublicIpv4(address) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0 && c === 0) return false;
  if (a === 192 && b === 31 && c === 196) return false; // AS112 special-purpose range
  if (a === 192 && b === 52 && c === 193) return false; // AMT special-purpose range
  if (a === 192 && b === 175 && c === 48) return false; // AS112 special-purpose range
  if (a === 192 && b === 0 && c === 2) return false;
  if (a === 192 && b === 88 && c === 99) return false;
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function expandIpv6(address) {
  let value = address.toLowerCase().split("%")[0];
  if (value.includes(".")) {
    const separator = value.lastIndexOf(":");
    const octets = value.slice(separator + 1).split(".").map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return null;
    }
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    value = value.slice(0, separator) + ":" + high + ":" + low;
  }

  const [left = "", right = ""] = value.split("::");
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  const missing = 8 - leftParts.length - rightParts.length;
  if (missing < 0) return null;
  const parts = [...leftParts, ...Array(missing).fill("0"), ...rightParts];
  if (parts.length !== 8) return null;
  const words = parts.map((part) => Number.parseInt(part || "0", 16));
  return words.every((word) => Number.isInteger(word) && word >= 0 && word <= 0xffff) ? words : null;
}

function isPublicIpv6(address) {
  const words = expandIpv6(address);
  if (!words) return false;

  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    const mappedIpv4 = [
      words[6] >> 8,
      words[6] & 0xff,
      words[7] >> 8,
      words[7] & 0xff,
    ].join(".");
    return isPublicIpv4(mappedIpv4);
  }

  if (words.every((word) => word === 0)) return false;
  if (words[0] === 0 && words.slice(1, 7).every((word) => word === 0) && words[7] === 1) return false;
  if ((words[0] & 0xfe00) === 0xfc00) return false; // Unique-local fc00::/7
  if ((words[0] & 0xffc0) === 0xfe80) return false; // Link-local fe80::/10
  if ((words[0] & 0xff00) === 0xff00) return false; // Multicast ff00::/8
  if ((words[0] & 0xe000) !== 0x2000) return false; // Only global-unicast 2000::/3
  if (words[0] === 0x2001 && (words[1] <= 0x01ff || words[1] === 0x0db8)) return false; // IETF special-purpose and documentation ranges
  if (words[0] === 0x3fff && (words[1] & 0xf000) === 0) return false; // IPv6 documentation prefix 3fff::/20 (RFC 9637)
  if (words[0] === 0x2002) return false; // Deprecated 6to4
  return true;
}

export function isPublicIpAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family === 6) return isPublicIpv6(address);
  return false;
}

export async function resolvePublicWebsiteTarget(
  rawUrl,
  { lookup = dns.promises.lookup, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  if (typeof rawUrl !== "string" || !rawUrl.trim() || rawUrl.length > 2048) return null;

  const input = rawUrl.trim();
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
  const expectedPort = url.protocol === "https:" ? "443" : "80";
  if (url.port && url.port !== expectedPort) return null;

  const rawHostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const hostname = rawHostname.startsWith("[") && rawHostname.endsWith("]")
    ? rawHostname.slice(1, -1)
    : rawHostname;
  if (!hostname || !hostname.includes(".") || net.isIP(hostname)) return null;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix))) {
    return null;
  }

  url.hostname = hostname;
  url.hash = "";

  let resolved;
  try {
    resolved = await withTimeout(
      Promise.resolve().then(() => lookup(hostname, { all: true, verbatim: true })),
      timeoutMs,
    );
  } catch {
    return null;
  }
  const records = Array.isArray(resolved) ? resolved : [resolved];
  if (!records.length || records.some((record) => !record || !isPublicIpAddress(record.address))) {
    return null;
  }

  const first = records[0];
  return {
    url,
    address: {
      address: first.address,
      family: first.family || net.isIP(first.address),
    },
  };
}

function requestPinnedWebsite(target, { timeoutMs, maxBytes }) {
  return new Promise((resolve) => {
    let settled = false;
    let deadline = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (deadline) clearTimeout(deadline);
      resolve(result);
    };
    const transport = target.url.protocol === "https:" ? https : http;

    const request = transport.get(target.url, {
      headers: {
        "User-Agent": "QuickKitAI-ProspectScraper/1.0",
        "Accept": "text/html",
      },
      lookup: (_hostname, options, callback) => {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        if (options?.all) {
          callback(null, [target.address]);
        } else {
          callback(null, target.address.address, target.address.family);
        }
      },
      ...(target.url.protocol === "https:" ? { servername: target.url.hostname } : {}),
    }, (response) => {
      const statusCode = response.statusCode || 0;
      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        finish({ statusCode, headers: response.headers, body: "" });
        return;
      }

      const contentLength = Number(response.headers["content-length"]);
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        response.destroy();
        finish({ statusCode, headers: response.headers, body: "", tooLarge: true });
        return;
      }

      const chunks = [];
      let totalBytes = 0;
      response.on("data", (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxBytes) {
          response.destroy();
          finish({ statusCode, headers: response.headers, body: "", tooLarge: true });
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => {
        finish({
          statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
      response.on("aborted", () => finish(null));
      response.on("error", () => finish(null));
    });

    request.on("error", () => finish(null));

    // Socket inactivity timeouts can be extended indefinitely by a peer that
    // trickles data. Enforce a hard wall-clock deadline for the entire response.
    deadline = setTimeout(() => request.destroy(new Error("timeout")), timeoutMs);
    deadline.unref?.();
    request.setTimeout(timeoutMs, () => request.destroy(new Error("timeout")));
  });
}

/**
 * Fetch a prospect website only after DNS validation, with the selected public
 * IP pinned into the HTTP(S) request. Redirects are not followed, preventing
 * a public URL from redirecting the scraper to an internal address.
 */
export async function fetchPublicWebsite(rawUrl, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const startedAt = Date.now();
  const target = await resolvePublicWebsiteTarget(rawUrl, {
    lookup: options.lookup ?? dns.promises.lookup,
    timeoutMs,
  });
  if (!target) return null;

  // DNS resolution and the HTTP response share one wall-clock budget.
  const remainingTimeoutMs = timeoutMs - (Date.now() - startedAt);
  if (!Number.isFinite(remainingTimeoutMs) || remainingTimeoutMs <= 0) return null;

  const requestImpl = options.requestImpl ?? requestPinnedWebsite;
  try {
    return await requestImpl(target, { timeoutMs: remainingTimeoutMs, maxBytes });
  } catch {
    return null;
  }
}
