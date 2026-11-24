import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../quickkit-automation-agent-main/', import.meta.url));
const publicRoot = resolve(appRoot, 'public');
const indexHtml = await readFile(resolve(appRoot, 'index.html'), 'utf8');
const linkTags = indexHtml.match(/<link\\b[^>]*>/gi) || [];

const localHrefs = linkTags.map((tag) => {
  const match = tag.match(/href\\s*=\\s*\"([^\"]+)\"/i) || tag.match(/href\\s*=\\s*'([^']+)'/i);
  return match?.[1];
}).filter((href) => typeof href === 'string' && href.startsWith('/') && !href.startsWith('//'));

for (const href of localHrefs) {
  const assetPath = href.split(/[?#]/, 1)[0].replace(/^\\/+/, '');
  const resolvedPath = resolve(publicRoot, assetPath);
  assert.ok(resolvedPath.startsWith(publicRoot + sep), 'Local link escapes the nested public directory: ' + href);
  await access(resolvedPath);
}

console.log('PASS: ' + localHrefs.length + ' root-relative link asset(s) in the nested app resolve to existing public files.');
