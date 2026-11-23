#!/usr/bin/env node
// Refreshes the design tokens the library is tested with:
// test/tokens/design-system/_variables.css and _dark.css, committed, so tests and
// CI never touch the network.
//
//   npm run tokens:sync                      # the release pinned in test/tokens.config.json, from the CDN
//   npm run tokens:sync -- --from <dir>      # a local ss-design-system build (its dist/css)
//
// --from is for working ahead of a release: migrate a component against a
// design-system branch, then sync from the CDN once the release is out; the
// diff should be empty.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const FILES = ['_variables.css', '_dark.css'];

export function cdnUrl(version, file) {
  return `https://cdn.slicesoft.dev/design-system/ss-design-system-v${version}/css/${file}`;
}

async function download(url, fetchImpl) {
  let css;
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    css = await response.text();
  } catch (error) {
    throw new Error(`Cannot download ${url} (${error.message})`);
  }
  return css;
}

export async function syncTokens({ root = process.cwd(), from, fetch: fetchImpl = globalThis.fetch } = {}) {
  const { designSystem: version } = JSON.parse(readFileSync(join(root, 'test/tokens.config.json'), 'utf8'));
  // Read everything before writing anything: a failure leaves the vendored
  // copy as it was.
  const sheets = [];
  for (const file of FILES) {
    const source = from ? join(resolve(from), file) : cdnUrl(version, file);
    const css = from ? readFileSync(source, 'utf8') : await download(source, fetchImpl);
    if (!css.includes('--ss-')) throw new Error(`${source} is not a design-token stylesheet`);
    sheets.push([file, css, source]);
  }
  const dir = join(root, 'test/tokens/design-system');
  mkdirSync(dir, { recursive: true });
  for (const [file, css, source] of sheets) {
    writeFileSync(join(dir, file), css);
    console.log(`${file} ← ${source}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const at = process.argv.indexOf('--from');
  syncTokens({ from: at > -1 ? process.argv[at + 1] : undefined }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
