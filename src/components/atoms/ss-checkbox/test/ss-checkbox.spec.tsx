import { newSpecPage } from '@stencil/core/testing';
import { SsCheckbox } from '../ss-checkbox';

describe('ss-checkbox', () => {
  it('renders label, checked, required, and invalid state', async () => {
    const page = await newSpecPage({
      components: [SsCheckbox],
      html: `<ss-checkbox checked required invalid label="Accept"></ss-checkbox>`,
    });
    const root = page.root.querySelector('label');
    const input = page.root.querySelector('input');

    expect(root.classList.contains('ss-checkbox--checked')).toBe(true);
    expect(input.checked).toBe(true);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.textContent).toContain('Accept');
  });

  it('emits ssChange with checked value', async () => {
    const page = await newSpecPage({
      components: [SsCheckbox],
      html: `<ss-checkbox x-id="terms" name="terms" value="yes"></ss-checkbox>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssChange', spy);
    const input = page.root.querySelector('input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'terms', name: 'terms', value: 'yes', checked: true } }));
    expect((page.root as any).checked).toBe(true);
  });
});
