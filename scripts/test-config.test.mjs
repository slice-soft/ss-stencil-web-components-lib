import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Every e2e worker opens its pages in the one Chrome Stencil launches. A page
// opened by one worker can hide another worker's page, and a hidden page gets
// no requestAnimationFrame: Stencil never finishes its first render and the
// test fails with "App did not load". Measured on the full e2e suite: 3
// workers created 9 of 239 pages hidden; 1 worker, none. See
// docs/conventions.md.
test('the test script runs a single worker', () => {
  const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(scripts.test, /--max-workers=1\b/);
});
