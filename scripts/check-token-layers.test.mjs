import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { violations } from './check-token-layers.mjs';

const vars = scss => violations(scss, 'ss-button').map(v => v.variable);

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

test('a prefix of another component is not its own', () => {
  assert.deepEqual(
    violations('a { gap: var(--ss-table-gap); }', 'ss-tab').map(v => v.variable),
    ['--ss-table-gap'],
  );
});

test('ss-typography reads --ss-typography-component-*', () => {
  assert.deepEqual(violations('a { color: var(--ss-typography-component-color-muted); }', 'ss-typography'), []);
});

test('violations report their line', () => {
  assert.deepEqual(violations('a {\n  gap: var(--ss-dimensions-2);\n}', 'ss-button'), [{ line: 2, variable: '--ss-dimensions-2' }]);
});

function fixture(migrated) {
  const root = mkdtempSync(join(tmpdir(), 'ss-layers-'));
  mkdirSync(join(root, 'src/components/atoms/ss-button'), { recursive: true });
  writeFileSync(join(root, 'src/components/atoms/ss-button/ss-button.scss'), 'a { gap: var(--ss-dimensions-2); }');
  mkdirSync(join(root, 'scripts'));
  writeFileSync(join(root, 'scripts/token-layers.config.json'), JSON.stringify({ migrated }));
  return root;
}

const cli = cwd => spawnSync(process.execPath, [join(import.meta.dirname, 'check-token-layers.mjs')], { cwd, encoding: 'utf8' });

test('the CLI fails on a migrated component with a violation', () => {
  const run = cli(fixture(['ss-button']));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /ss-button\.scss:1 reads --ss-dimensions-2/);
});

test('the CLI only reports components not yet migrated', () => {
  const run = cli(fixture([]));
  assert.equal(run.status, 0);
  assert.match(run.stdout, /ss-button: 1 reference outside its own tokens \(not migrated\)/);
});
