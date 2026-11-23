import { readFileSync } from 'fs';
import { join } from 'path';
import { designSystemCss, DESIGN_SYSTEM_VERSION } from './tokens';

describe('design tokens the library is tested with', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('pins a released version', () => {
    expect(DESIGN_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('reads the vendored stylesheets without the network', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    expect(await designSystemCss('_variables.css')).toContain('--ss-button-primary-background:');
    expect(await designSystemCss('_dark.css')).toContain('[data-theme="dark"]');
    expect(global.fetch).not.toHaveBeenCalled();
    // Exactly the committed copy (refreshed by `npm run tokens:sync`).
    expect(await designSystemCss('_variables.css')).toBe(readFileSync(join(process.cwd(), 'test/tokens/design-system/_variables.css'), 'utf8'));
  });
});
