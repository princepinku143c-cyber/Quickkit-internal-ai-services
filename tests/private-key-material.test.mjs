import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedPaths = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

// Build the marker from pieces so this test does not match its own source.
const privateKeyPattern = new RegExp(
  "-{5}BEGIN\\s+(?:ENCRYPTED\\s+|RSA\\s+|EC\\s+|DSA\\s+|OPENSSH\\s+)?PRIVATE\\s+KEY-{5}",
  "g",
);

const findings = [];
let scannedTextFiles = 0;

for (const path of trackedPaths) {
  let bytes;
  try {
    bytes = readFileSync(path);
  } catch (error) {
    findings.push({ path, line: 1, reason: "tracked file could not be read" });
    continue;
  }

  // Binary assets are not source/config text and cannot contain a usable
  // literal PEM block without first being represented as text.
  if (bytes.includes(0)) continue;

  const source = bytes.toString("utf8");
  scannedTextFiles += 1;
  privateKeyPattern.lastIndex = 0;
  const match = privateKeyPattern.exec(source);
  if (!match) continue;

  const line = source.slice(0, match.index).split("\n").length;
  findings.push({ path, line, reason: "private-key PEM marker detected" });
}

if (findings.length > 0) {
  console.error(
    "[private-key-material] Refusing the build: tracked private-key material was detected. Values are intentionally not printed.",
  );
  for (const finding of findings) {
    console.error(` - ${finding.path}:${finding.line} (${finding.reason})`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `[private-key-material] PASS: scanned ${scannedTextFiles} tracked text files; no private-key PEM markers found.`,
  );
}
