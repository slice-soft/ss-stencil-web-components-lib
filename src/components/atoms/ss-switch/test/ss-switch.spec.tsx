import { newSpecPage } from '@stencil/core/testing';
import { SsSwitch } from '../ss-switch';
import { getRoot, getElement } from '../../../../test/utils';

describe('ss-switch', () => {
  it('renders switch semantics and label position', async () => {
    const page = await newSpecPage({
      components: [SsSwitch],
      html: `<ss-switch checked label-position="start" label="Enabled"></ss-switch>`,
    });
    const root = getRoot(page);
    const input = getElement<HTMLInputElement>(root, 'input');
    const label = getElement<HTMLLabelElement>(root, 'label');

    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(label.classList.contains('ss-switch--label-start')).toBe(true);
    expect(root.textContent).toContain('Enabled');
  });

  it('emits ssChange when toggled', async () => {
    const page = await newSpecPage({
      components: [SsSwitch],
      html: `<ss-switch x-id="notifications" name="notifications"></ss-switch>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssChange', spy);
    const input = getElement<HTMLInputElement>(root, 'input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'notifications', name: 'notifications', value: undefined, checked: true } }));
    expect((root as any).checked).toBe(true);
  });
});
