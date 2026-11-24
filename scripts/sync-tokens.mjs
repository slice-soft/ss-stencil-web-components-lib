#!/usr/bin/env node
// Refreshes the design-system copy the library is tested with:
// test/tokens/design-system/_variables.css, _dark.css and _styles.css (the
// visual styles), committed, so tests
// and CI never touch the network. It copies them from a local ss-design-system
// build; there is nothing to download.
//
//   npm run tokens:sync                  # ../ss-design-system/dist/css (the sibling checkout)
//   npm run tokens:sync -- --from <dir>  # any other build's dist/css
//
// Build the design system first (`npm run build` there), on the commit or
// release the library should be tested against, and set that version in
// test/tokens.config.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const FILES = ['_variables.css', '_dark.css', '_styles.css'];

export const DEFAULT_SOURCE = '../ss-design-system/dist/css';

export function syncTokens({ root = process.cwd(), from = DEFAULT_SOURCE } = {}) {
  const source = resolve(root, from);
  // Read everything before writing anything: a failure leaves the copy as it was.
  const sheets = FILES.map(file => {
    const path = join(source, file);
    if (!existsSync(path)) throw new Error(`${path} does not exist. Run \`npm run build\` in ss-design-system, or pass --from <dist/css>.`);
    const css = readFileSync(path, 'utf8');
    if (!css.includes('--ss-')) throw new Error(`${path} is not a design-token stylesheet`);
    return [file, css, path];
  });
  const target = join(root, 'test/tokens/design-system');
  mkdirSync(target, { recursive: true });
  for (const [file, css, path] of sheets) {
    writeFileSync(join(target, file), css);
    console.log(`${file} ← ${path}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const at = process.argv.indexOf('--from');
  try {
    syncTokens({ from: at > -1 ? process.argv[at + 1] : undefined });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
