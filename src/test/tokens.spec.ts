import { readFileSync } from 'fs';
import { join } from 'path';
import { cdnUrl, DESIGN_SYSTEM_VERSION, slicesoftCss } from './tokens';

describe('design tokens the library is tested with', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('pins a released version', () => {
    expect(DESIGN_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('builds the CDN url consumers load', () => {
    expect(cdnUrl('_dark.css', '2.8.0')).toBe('https://cdn.slicesoft.dev/design-system/ss-design-system-v2.8.0/css/_dark.css');
  });

  it('reads the vendored stylesheets without the network', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    expect(await slicesoftCss('_variables.css')).toContain('--ss-button-primary-background:');
    expect(await slicesoftCss('_dark.css')).toContain('[data-theme="dark"]');
    expect(global.fetch).not.toHaveBeenCalled();
    // Exactly the committed copy (refreshed by `npm run tokens:sync`).
    expect(await slicesoftCss('_variables.css')).toBe(readFileSync(join(process.cwd(), 'test/tokens/slicesoft/_variables.css'), 'utf8'));
  });
});
