import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_SOURCE, syncTokens } from './sync-tokens.mjs';

const CSS = ':root {\n  --ss-color-primary: #c2410c;\n}\n';

const repo = () => mkdtempSync(join(tmpdir(), 'ss-sync-'));
const vendored = (root, file) => join(root, 'test/tokens/design-system', file);

function build(variables = CSS, dark = CSS.replace(':root', '[data-theme="dark"]')) {
  const dist = mkdtempSync(join(tmpdir(), 'ss-dist-'));
  writeFileSync(join(dist, '_variables.css'), variables);
  writeFileSync(join(dist, '_dark.css'), dark);
  return dist;
}

test('reads the sibling ss-design-system checkout by default', () => {
  assert.equal(DEFAULT_SOURCE, '../ss-design-system/dist/css');
});

test('copies the stylesheets of a design-system build', () => {
  const root = repo();
  syncTokens({ root, from: build() });
  assert.equal(readFileSync(vendored(root, '_variables.css'), 'utf8'), CSS);
  assert.match(readFileSync(vendored(root, '_dark.css'), 'utf8'), /data-theme="dark"/);
});

test('resolves the default source from the repository root', () => {
  const workspace = repo();
  const root = join(workspace, 'lib');
  mkdirSync(root);
  const dist = join(workspace, 'ss-design-system/dist/css');
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, '_variables.css'), CSS);
  writeFileSync(join(dist, '_dark.css'), CSS);
  syncTokens({ root });
  assert.equal(readFileSync(vendored(root, '_variables.css'), 'utf8'), CSS);
});

test('names the missing build and writes nothing', () => {
  const root = repo();
  assert.throws(() => syncTokens({ root, from: join(root, 'nope') }), /nope\/_variables\.css.*npm run build/s);
  assert.equal(existsSync(vendored(root, '_variables.css')), false);
});

test('refuses something that is not a token stylesheet, and writes nothing', () => {
  const root = repo();
  assert.throws(() => syncTokens({ root, from: build(CSS, 'body { color: red }') }), /_dark\.css is not a design-token stylesheet/);
  assert.equal(existsSync(vendored(root, '_variables.css')), false);
});
