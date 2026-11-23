import { existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { cdnUrl, DESIGN_SYSTEM_VERSION, slicesoftCss } from './tokens';

describe('design tokens from the CDN', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('builds the pinned CDN url', () => {
    expect(cdnUrl('_dark.css', '2.7.0')).toBe('https://cdn.slicesoft.dev/design-system/ss-design-system-v2.7.0/css/_dark.css');
  });

  it('pins a released version', () => {
    expect(DESIGN_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('names the url when the tokens cannot be fetched', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    const emptyCache = mkdtempSync(join(tmpdir(), 'ss-tokens-'));
    await expect(slicesoftCss('_variables.css', emptyCache)).rejects.toThrow(/Design tokens v\S+ unavailable: https:\/\/cdn\.slicesoft\.dev\/\S+ \(HTTP 404\)/);
  });

  it('names the url when the network is down', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND')) as unknown as typeof fetch;
    const emptyCache = mkdtempSync(join(tmpdir(), 'ss-tokens-'));
    await expect(slicesoftCss('_dark.css', emptyCache)).rejects.toThrow(/unavailable: https:\/\/cdn\.slicesoft\.dev\/\S+ \(getaddrinfo ENOTFOUND\)/);
  });

  it('does not cache a response that is not a token stylesheet', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '<html>Not found</html>' }) as unknown as typeof fetch;
    const cache = mkdtempSync(join(tmpdir(), 'ss-tokens-'));
    await expect(slicesoftCss('_variables.css', cache)).rejects.toThrow(/not a design-token stylesheet/);
    expect(existsSync(join(cache, DESIGN_SYSTEM_VERSION, '_variables.css'))).toBe(false);
  });

  it('gives up on a CDN that does not answer', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => ':root { --ss-x: 1px; }' });
    global.fetch = fetchMock as unknown as typeof fetch;
    await slicesoftCss('_dark.css', mkdtempSync(join(tmpdir(), 'ss-tokens-')));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('_dark.css'), expect.objectContaining({ signal: expect.anything() }));
  });

  it('serves a cached copy without the network', async () => {
    const cache = mkdtempSync(join(tmpdir(), 'ss-tokens-'));
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => ':root { --ss-x: 1px; }' }) as unknown as typeof fetch;
    await slicesoftCss('_variables.css', cache);
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await expect(slicesoftCss('_variables.css', cache)).resolves.toContain('--ss-x: 1px');
  });
});
