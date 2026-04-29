import { newSpecPage } from '@stencil/core/testing';
import { SsSwitch } from '../ss-switch';

describe('ss-switch', () => {
  it('renders switch semantics and label position', async () => {
    const page = await newSpecPage({
      components: [SsSwitch],
      html: `<ss-switch checked label-position="start" label="Enabled"></ss-switch>`,
    });
    const input = page.root.querySelector('input');
    const label = page.root.querySelector('label');

    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(label.classList.contains('ss-switch--label-start')).toBe(true);
    expect(page.root.textContent).toContain('Enabled');
  });

  it('emits ssChange when toggled', async () => {
    const page = await newSpecPage({
      components: [SsSwitch],
      html: `<ss-switch x-id="notifications" name="notifications"></ss-switch>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssChange', spy);
    const input = page.root.querySelector('input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'notifications', name: 'notifications', value: undefined, checked: true } }));
    expect((page.root as any).checked).toBe(true);
  });
});
