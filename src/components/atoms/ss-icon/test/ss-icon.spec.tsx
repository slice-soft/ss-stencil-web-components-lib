import { newSpecPage } from '@stencil/core/testing';
import { SsIcon } from '../ss-icon';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-icon', () => {
  it('renders decorative icons hidden from assistive tech by default', async () => {
    const page = await newSpecPage({
      components: [SsIcon],
      html: `<ss-icon><svg></svg></ss-icon>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const icon = getElement<HTMLSpanElement>(shadow, 'span');

    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.getAttribute('role')).toBeNull();
  });

  it('renders labeled icons as images', async () => {
    const page = await newSpecPage({
      components: [SsIcon],
      html: `<ss-icon label="Search" decorative="false"></ss-icon>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const icon = getElement<HTMLSpanElement>(shadow, 'span');

    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Search');
  });
});
