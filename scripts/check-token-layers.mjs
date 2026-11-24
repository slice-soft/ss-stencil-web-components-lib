#!/usr/bin/env node
// Token layer lint. A component's stylesheet may read only its own tokens
// (--ss-<tag without "ss-">-*) and private variables (--_*, --atom-*): moving
// one component token then moves that component and nothing else, and moving a
// brand or system token reaches the component through its own tokens, which
// the design system defines.
//
// It lints the compiled CSS, not the source: a mixin or a helper such as
// t(other-component, …) produces variables the source never spells out.
//
// Every component is held to it: the migration to component tokens finished
// with wave 5, so there is no list of exceptions. A new component starts with
// its own tokens in ss-design-system.
import { readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { compile } from 'sass-embedded';

// ss-typography's tokens predate the rule and are named typography-component.
const PREFIX_EXCEPTIONS = { 'ss-typography': 'typography-component' };

export function ownPrefix(tag) {
  return `--ss-${PREFIX_EXCEPTIONS[tag] ?? tag.replace(/^ss-/, '')}-`;
}

/**
 * Every var(--…) in `css` that `tag` may not read. `tags` lists all component
 * tags, so a longer one sharing the prefix (ss-button-group for ss-button) is
 * not mistaken for the component's own.
 */
export function violations(css, tag, tags = []) {
  const own = ownPrefix(tag);
  const longer = tags.filter(other => other !== tag && ownPrefix(other).startsWith(own)).map(ownPrefix);
  // Blank out comments, keeping newlines so line numbers still match.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
  const found = [];
  for (const match of code.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const variable = match[1];
    if (variable.startsWith('--_') || variable.startsWith('--atom-')) continue;
    if (variable.startsWith(own) && !longer.some(prefix => variable.startsWith(prefix))) continue;
    const line = code.slice(0, match.index + match[0].length).split('\n').length;
    found.push({ line, variable });
  }
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
  const files = stylesheets(join(root, 'src/components')).sort();
  const tags = files.map(file => basename(file, '.scss'));
  let failed = false;
  for (const file of files) {
    const tag = basename(file, '.scss');
    const found = violations(compile(file).css, tag, tags);
    if (found.length === 0) continue;
    failed = true;
    const variables = [...new Set(found.map(v => v.variable))];
    console.error(`${relative(root, file)}: ${tag} reads ${variables.join(', ')}; it may only read ${ownPrefix(tag)}*`);
  }
  process.exitCode = failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
