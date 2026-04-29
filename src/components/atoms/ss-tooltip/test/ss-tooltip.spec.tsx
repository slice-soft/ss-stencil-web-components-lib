import { newSpecPage } from '@stencil/core/testing';
import { SsTooltip } from '../ss-tooltip';

describe('ss-tooltip', () => {
  it('renders content hidden by default with tooltip role', async () => {
    const page = await newSpecPage({
      components: [SsTooltip],
      html: `<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`,
    });
    const content = page.root.shadowRoot.querySelector('.ss-tooltip__content');

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
    page.root.addEventListener('ssOpenChange', spy);

    page.root.shadowRoot.querySelector('.ss-tooltip__trigger').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'tip', open: true } }));
    expect(page.root.shadowRoot.querySelector('.ss-tooltip__content').getAttribute('aria-hidden')).toBe('false');
    expect(page.root.shadowRoot.querySelector('.ss-tooltip__trigger').getAttribute('aria-describedby')).toContain('ss-tooltip-');
  });
});
