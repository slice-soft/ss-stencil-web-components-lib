import { newSpecPage } from '@stencil/core/testing';
import { SsLink } from '../ss-link';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-link', () => {
  it('renders link attributes and accessible label', async () => {
    const page = await newSpecPage({
      components: [SsLink],
      html: `<ss-link href="/docs" target="_blank" label="Docs"></ss-link>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const link = getElement<HTMLAnchorElement>(shadow, 'a');

    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toBe('Docs');
    expect(link.textContent).toBe('Docs');
  });

  it('emits ssClick unless disabled', async () => {
    const page = await newSpecPage({
      components: [SsLink],
      html: `<ss-link x-id="docs" href="/docs">Docs</ss-link>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    root.addEventListener('ssClick', spy);

    getElement<HTMLAnchorElement>(shadow, 'a').click();
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'docs', href: '/docs' } }));

    (root as any).disabled = true;
    await page.waitForChanges();
    getElement<HTMLAnchorElement>(shadow, 'a').click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(getElement<HTMLAnchorElement>(shadow, 'a').getAttribute('aria-disabled')).toBe('true');
  });
});
