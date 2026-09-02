import { newSpecPage } from '@stencil/core/testing';
import { SsCheckbox } from '../ss-checkbox';
import { getRoot, getElement } from '../../../../test/utils';

describe('ss-checkbox', () => {
  it('renders label, checked, required, and invalid state', async () => {
    const page = await newSpecPage({
      components: [SsCheckbox],
      html: `<ss-checkbox checked required invalid label="Accept"></ss-checkbox>`,
    });
    const root = getRoot(page);
    const label = getElement<HTMLLabelElement>(root, 'label');
    const input = getElement<HTMLInputElement>(root, 'input');

    expect(label.classList.contains('ss-checkbox--checked')).toBe(true);
    expect(input.checked).toBe(true);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(label.textContent).toContain('Accept');
  });

  it('emits ssChange with checked value', async () => {
    const page = await newSpecPage({
      components: [SsCheckbox],
      html: `<ss-checkbox x-id="terms" name="terms" value="yes"></ss-checkbox>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssChange', spy);
    const input = getElement<HTMLInputElement>(root, 'input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'terms', name: 'terms', value: 'yes', checked: true } }));
    expect((root as any).checked).toBe(true);
  });

  it('clears indeterminate state when the user changes the value', async () => {
    const page = await newSpecPage({
      components: [SsCheckbox],
      html: `<ss-checkbox indeterminate></ss-checkbox>`,
    });
    const root = getRoot(page);
    const input = getElement<HTMLInputElement>(root, 'input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect((root as any).indeterminate).toBe(false);
    expect(root.hasAttribute('indeterminate')).toBe(false);
    expect(input.indeterminate).toBe(false);
  });
});
