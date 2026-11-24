import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { violations } from './check-token-layers.mjs';

// violations() reads compiled CSS: what a component actually ships, whatever
// mixins or helpers produced it.
const TAGS = ['ss-button', 'ss-button-group', 'ss-input', 'ss-tab', 'ss-table', 'ss-typography'];
const vars = (css, tag = 'ss-button') => violations(css, tag, TAGS).map(v => v.variable);

test('a component reads its own tokens and private variables', () => {
  assert.deepEqual(vars('a { gap: var(--ss-button-gap); padding: var(--_pad-x); color: var(--atom-accent); }'), []);
});

test('everything else is a violation, semantic colors included', () => {
  assert.deepEqual(
    vars(
      [
        'a { color: var(--ss-color-primary-text); }',
        'b { width: var(--ss-sizing-full); z-index: var(--ss-z-index-tooltip); }',
        'c { padding: var(--ss-dimensions-4); border-radius: var(--ss-radius-base); }',
        'd { border-color: var(--ss-input-border); font-size: var(--ss-text-sizes-sm); }',
      ].join('\n'),
    ),
    ['--ss-color-primary-text', '--ss-sizing-full', '--ss-z-index-tooltip', '--ss-dimensions-4', '--ss-radius-base', '--ss-input-border', '--ss-text-sizes-sm'],
  );
});

test('a fallback inside var() is checked too', () => {
  assert.deepEqual(vars('a { color: var(--ss-button-text, var(--ss-color-primary)); }'), ['--ss-color-primary']);
});

test('a var() split across lines is still read', () => {
  assert.deepEqual(vars('a { color: var(\n    --ss-color-primary); }'), ['--ss-color-primary']);
});

test('another component whose name extends this one is not its own', () => {
  assert.deepEqual(vars('a { gap: var(--ss-button-group-gap); }'), ['--ss-button-group-gap']);
  assert.deepEqual(vars('a { gap: var(--ss-table-gap); }', 'ss-tab'), ['--ss-table-gap']);
});

test('comments are not code', () => {
  assert.deepEqual(vars('/* was var(--ss-color-primary) */ a { gap: var(--ss-button-gap); }'), []);
});

test('ss-typography reads --ss-typography-component-*', () => {
  assert.deepEqual(vars('a { color: var(--ss-typography-component-color-muted); }', 'ss-typography'), []);
});

test('violations report their line', () => {
  assert.deepEqual(violations('a {\n  gap: var(--ss-dimensions-2);\n}', 'ss-button', TAGS), [{ line: 2, variable: '--ss-dimensions-2' }]);
});

function fixture(scss) {
  const root = mkdtempSync(join(tmpdir(), 'ss-layers-'));
  mkdirSync(join(root, 'src/components/atoms/ss-button'), { recursive: true });
  writeFileSync(join(root, 'src/components/atoms/ss-button/ss-button.scss'), scss);
  return root;
}

const cli = cwd => spawnSync(process.execPath, [join(import.meta.dirname, 'check-token-layers.mjs')], { cwd, encoding: 'utf8' });

test('the CLI lints what the stylesheet compiles to, mixins included', () => {
  const run = cli(fixture('@mixin ring { outline-color: var(--ss-color-ring); }\na { @include ring; }'));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /ss-button reads --ss-color-ring/);
});

test('the CLI holds every component to the rule, with no list of exceptions', () => {
  const run = cli(fixture('a { gap: var(--ss-dimensions-2); }'));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /ss-button reads --ss-dimensions-2; it may only read --ss-button-\*/);
});

test('the CLI passes a component that reads only its own tokens', () => {
  const run = cli(fixture('a { gap: var(--ss-button-gap); }'));
  assert.equal(run.status, 0, run.stderr);
});

test('the module can be imported without a script path', () => {
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', `import(${JSON.stringify(join(import.meta.dirname, 'check-token-layers.mjs'))})`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
