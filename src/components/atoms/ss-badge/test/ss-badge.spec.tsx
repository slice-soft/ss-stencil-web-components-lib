import { newSpecPage } from '@stencil/core/testing';
import { SsBadge } from '../ss-badge';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-badge', () => {
  it('renders label, variant, style, size, and pill classes', async () => {
    const page = await newSpecPage({
      components: [SsBadge],
      html: `<ss-badge label="New" variant="success" x-style="solid" size="md" pill></ss-badge>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const badge = getElement(shadow, '.ss-badge');

    expect(badge.textContent).toContain('New');
    expect(badge.classList.contains('ss-badge--success')).toBe(true);
    expect(badge.classList.contains('ss-badge--solid')).toBe(true);
    expect(badge.classList.contains('ss-badge--md')).toBe(true);
    expect(badge.classList.contains('ss-badge--pill')).toBe(true);
  });

  it('emits dismiss event only when enabled', async () => {
    const page = await newSpecPage({
      components: [SsBadge],
      html: `<ss-badge x-id="badge-1" dismissible label="Filter"></ss-badge>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    root.addEventListener('ssDismiss', spy);

    getElement<HTMLButtonElement>(shadow, 'button').click();
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'badge-1' } }));

    (root as any).disabled = true;
    await page.waitForChanges();
    getElement<HTMLButtonElement>(shadow, 'button').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
