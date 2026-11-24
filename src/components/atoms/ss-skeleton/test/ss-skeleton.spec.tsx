import { h } from '@stencil/core';
import { newSpecPage } from '@stencil/core/testing';
import { SsSkeleton } from '../ss-skeleton';
import { getElement, getRoot, getShadowRoot } from '../../../../test/utils';

async function render(html: string) {
  const page = await newSpecPage({ components: [SsSkeleton], html });
  const root = getRoot(page);
  return { root, shadow: getShadowRoot(root) };
}

describe('ss-skeleton', () => {
  it('is hidden from assistive technology', async () => {
    const { root } = await render('<ss-skeleton></ss-skeleton>');
    expect(root.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws one text line by default', async () => {
    const { shadow } = await render('<ss-skeleton></ss-skeleton>');
    expect(getElement(shadow, '.ss-skeleton').classList.contains('ss-skeleton--text')).toBe(true);
    expect(shadow.querySelectorAll('.ss-skeleton__line').length).toBe(1);
  });

  it('draws as many text lines as asked, at least one', async () => {
    expect((await render('<ss-skeleton lines="3"></ss-skeleton>')).shadow.querySelectorAll('.ss-skeleton__line').length).toBe(3);
    expect((await render('<ss-skeleton lines="0"></ss-skeleton>')).shadow.querySelectorAll('.ss-skeleton__line').length).toBe(1);
  });

  it('draws a block or a circle without lines', async () => {
    for (const shape of ['rect', 'circle']) {
      const { shadow } = await render(`<ss-skeleton shape="${shape}" lines="3"></ss-skeleton>`);
      expect(getElement(shadow, '.ss-skeleton').classList.contains(`ss-skeleton--${shape}`)).toBe(true);
      expect(shadow.querySelectorAll('.ss-skeleton__line').length).toBe(0);
    }
  });

  it('applies id and inline styles to the root', async () => {
    const page = await newSpecPage({ components: [SsSkeleton], template: () => <ss-skeleton xId="s" shape="rect" inlineStyles={{ width: '120px' }} /> });
    const root = getElement(getShadowRoot(getRoot(page)), '.ss-skeleton') as HTMLElement;
    expect(root.id).toBe('s');
    expect(root.style.width).toBe('120px');
  });
});
