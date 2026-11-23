import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cdnUrl, syncTokens } from './sync-tokens.mjs';

const CSS = ':root {\n  --ss-color-primary: #c2410c;\n}\n';

function repo(version = '2.8.0') {
  const root = mkdtempSync(join(tmpdir(), 'ss-sync-'));
  mkdirSync(join(root, 'test'));
  writeFileSync(join(root, 'test/tokens.config.json'), JSON.stringify({ designSystem: version }));
  return root;
}

const vendored = (root, file) => join(root, 'test/tokens/slicesoft', file);

test('builds the CDN url of a release', () => {
  assert.equal(cdnUrl('2.8.0', '_dark.css'), 'https://cdn.slicesoft.dev/design-system/ss-design-system-v2.8.0/css/_dark.css');
});

test('copies the stylesheets of a local design-system build', async () => {
  const root = repo();
  const dist = mkdtempSync(join(tmpdir(), 'ss-dist-'));
  writeFileSync(join(dist, '_variables.css'), CSS);
  writeFileSync(join(dist, '_dark.css'), CSS.replace(':root', '[data-theme="dark"]'));
  await syncTokens({ root, from: dist });
  assert.equal(readFileSync(vendored(root, '_variables.css'), 'utf8'), CSS);
  assert.match(readFileSync(vendored(root, '_dark.css'), 'utf8'), /data-theme="dark"/);
});

test('downloads the pinned release from the CDN', async () => {
  const root = repo('2.8.0');
  const asked = [];
  const fetch = async url => (asked.push(url), { ok: true, status: 200, text: async () => CSS });
  await syncTokens({ root, fetch });
  assert.deepEqual(asked, [cdnUrl('2.8.0', '_variables.css'), cdnUrl('2.8.0', '_dark.css')]);
  assert.equal(readFileSync(vendored(root, '_variables.css'), 'utf8'), CSS);
});

test('names the url when the release is not on the CDN', async () => {
  const root = repo('9.9.9');
  const fetch = async () => ({ ok: false, status: 404 });
  await assert.rejects(syncTokens({ root, fetch }), /ss-design-system-v9\.9\.9\/css\/_variables\.css \(HTTP 404\)/);
  assert.equal(existsSync(vendored(root, '_variables.css')), false);
});

test('refuses something that is not a token stylesheet', async () => {
  const root = repo();
  const fetch = async () => ({ ok: true, status: 200, text: async () => '<html>Not found</html>' });
  await assert.rejects(syncTokens({ root, fetch }), /not a design-token stylesheet/);
});
