import { newSpecPage } from '@stencil/core/testing';
import { SsToaster } from '../ss-toaster';
import { getRoot, getShadowRoot } from '../../../../test/utils';

describe('ss-toaster', () => {
  it('is a region named for what it holds', async () => {
    const page = await newSpecPage({ components: [SsToaster], html: `<ss-toaster></ss-toaster>` });
    const region = getShadowRoot(getRoot(page)).querySelector('section')!;

    expect(region.getAttribute('aria-label')).toBe('Notifications');
    // Each toast is its own live region; a second one around them would
    // announce every message twice.
    expect(region.hasAttribute('aria-live')).toBe(false);
  });

  it('takes a stated name', async () => {
    const page = await newSpecPage({ components: [SsToaster], html: `<ss-toaster accessibility-label="Avisos"></ss-toaster>` });
    expect(getShadowRoot(getRoot(page)).querySelector('section')?.getAttribute('aria-label')).toBe('Avisos');
  });

  it('defaults to the bottom-end corner, and takes another', async () => {
    const page = await newSpecPage({ components: [SsToaster], html: `<ss-toaster></ss-toaster>` });
    expect(getShadowRoot(getRoot(page)).querySelector('section')?.className).toContain('ss-toaster--bottom-end');

    const top = await newSpecPage({ components: [SsToaster], html: `<ss-toaster placement="top-center"></ss-toaster>` });
    expect(getShadowRoot(getRoot(top)).querySelector('section')?.className).toContain('ss-toaster--top-center');
  });
});
