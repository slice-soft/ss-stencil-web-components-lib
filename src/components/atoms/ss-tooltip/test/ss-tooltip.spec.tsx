import { newSpecPage } from '@stencil/core/testing';
import { SsTooltip } from '../ss-tooltip';
import { getRoot, getElement } from '../../../../test/utils';

describe('ss-tooltip', () => {
  it('renders content hidden by default with tooltip role', async () => {
    const page = await newSpecPage({
      components: [SsTooltip],
      html: `<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`,
    });
    const root = getRoot(page);
    const content = getElement(root, '.ss-tooltip__content');

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
    root.addEventListener('ssOpenChange', spy);

    getElement(root, '.ss-tooltip__trigger').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'tip', open: true } }));
    expect(getElement(root, '.ss-tooltip__content').getAttribute('aria-hidden')).toBe('false');

    // The description lands on the slotted trigger, which is what takes focus,
    // not on the wrapper the tooltip renders around it.
    const trigger = getElement<HTMLElement>(root, 'button[slot="trigger"]');
    expect(trigger.getAttribute('aria-describedby')).toContain('ss-tooltip-content-');
  });
});
