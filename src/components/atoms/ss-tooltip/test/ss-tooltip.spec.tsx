import { newSpecPage } from '@stencil/core/testing';
import { SsTooltip } from '../ss-tooltip';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-tooltip', () => {
  it('renders content hidden by default with tooltip role', async () => {
    const page = await newSpecPage({
      components: [SsTooltip],
      html: `<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const content = getElement(shadow, '.ss-tooltip__content');

    expect(content.getAttribute('role')).toBe('tooltip');
    expect(content.getAttribute('aria-hidden')).toBe('true');
    expect(content.textContent).toContain('More info');
  });

  it('opens on click trigger and emits open change', async () => {
    const page = await newSpecPage({
      components: [SsTooltip],
      html: `<ss-tooltip x-id="tip" trigger="click" content="More"><button slot="trigger">Info</button></ss-tooltip>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    root.addEventListener('ssOpenChange', spy);

    getElement(shadow, '.ss-tooltip__trigger').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'tip', open: true } }));
    expect(getElement(shadow, '.ss-tooltip__content').getAttribute('aria-hidden')).toBe('false');
    expect(getElement(shadow, '.ss-tooltip__trigger').getAttribute('aria-describedby')).toContain('ss-tooltip-');
  });
});
