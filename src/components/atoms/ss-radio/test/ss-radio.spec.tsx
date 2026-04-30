import { newSpecPage } from '@stencil/core/testing';
import { SsRadio } from '../ss-radio';
import { getRoot, getElement } from '../../../../test/utils';

describe('ss-radio', () => {
  it('renders a native radio with label and invalid state', async () => {
    const page = await newSpecPage({
      components: [SsRadio],
      html: `<ss-radio name="size" value="m" invalid label="Medium"></ss-radio>`,
    });
    const root = getRoot(page);
    const input = getElement<HTMLInputElement>(root, 'input');

    expect(input.type).toBe('radio');
    expect(input.name).toBe('size');
    expect(input.value).toBe('m');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.textContent).toContain('Medium');
  });

  it('emits ssChange with checked value', async () => {
    const page = await newSpecPage({
      components: [SsRadio],
      html: `<ss-radio x-id="option" name="group" value="a"></ss-radio>`,
    });
    const spy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssChange', spy);
    const input = getElement<HTMLInputElement>(root, 'input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'option', name: 'group', value: 'a', checked: true } }));
    expect((root as any).checked).toBe(true);
  });
});
