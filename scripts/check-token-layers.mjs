#!/usr/bin/env node
// Token layer lint. A component's stylesheet may read only its own tokens
// (--ss-<tag without "ss-">-*) and private variables (--_*, --atom-*): moving
// one component token then moves that component and nothing else, and moving a
// brand or system token reaches the component through its own tokens, which
// the design system defines.
//
// Components listed in scripts/token-layers.config.json ("migrated") fail the
// lint on any other --ss-* reference. The rest are counted, so the size of the
// remaining migration stays visible.
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

// ss-typography's tokens predate the rule and are named typography-component.
const PREFIX_EXCEPTIONS = { 'ss-typography': 'typography-component' };

export function ownPrefix(tag) {
  return `--ss-${PREFIX_EXCEPTIONS[tag] ?? tag.replace(/^ss-/, '')}-`;
}

export function violations(scss, tag) {
  const own = ownPrefix(tag);
  const found = [];
  scss.split('\n').forEach((text, index) => {
    for (const match of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const variable = match[1];
      if (variable.startsWith('--_') || variable.startsWith('--atom-')) continue;
      if (variable.startsWith(own)) continue;
      found.push({ line: index + 1, variable });
    }
  });
  return found;
}

function stylesheets(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return stylesheets(path);
    return /^ss-[\w-]+\.scss$/.test(entry.name) ? [path] : [];
  });
}

function main(root = process.cwd()) {
  const { migrated } = JSON.parse(readFileSync(join(root, 'scripts/token-layers.config.json'), 'utf8'));
  let failed = false;
  const pending = [];
  for (const file of stylesheets(join(root, 'src/components')).sort()) {
    const tag = basename(file, '.scss');
    const found = violations(readFileSync(file, 'utf8'), tag);
    if (found.length === 0) continue;
    if (migrated.includes(tag)) {
      failed = true;
      for (const { line, variable } of found) {
        console.error(`${relative(root, file)}:${line} reads ${variable}; ${tag} may only read ${ownPrefix(tag)}*`);
      }
    } else {
      pending.push(`${tag}: ${found.length} reference${found.length === 1 ? '' : 's'} outside its own tokens (not migrated)`);
    }
  }
  if (pending.length) console.log(`Token layers — ${pending.length} components not migrated yet:\n  ${pending.join('\n  ')}`);
  process.exitCode = failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
