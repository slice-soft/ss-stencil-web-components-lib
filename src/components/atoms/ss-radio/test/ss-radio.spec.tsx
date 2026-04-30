import { newSpecPage } from '@stencil/core/testing';
import { SsRadio } from '../ss-radio';

describe('ss-radio', () => {
  it('renders a native radio with label and invalid state', async () => {
    const page = await newSpecPage({
      components: [SsRadio],
      html: `<ss-radio name="size" value="m" invalid label="Medium"></ss-radio>`,
    });
    const input = page.root.querySelector('input');

    expect(input.type).toBe('radio');
    expect(input.name).toBe('size');
    expect(input.value).toBe('m');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(page.root.textContent).toContain('Medium');
  });

  it('emits ssChange with checked value', async () => {
    const page = await newSpecPage({
      components: [SsRadio],
      html: `<ss-radio x-id="option" name="group" value="a"></ss-radio>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssChange', spy);
    const input = page.root.querySelector('input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'option', name: 'group', value: 'a', checked: true } }));
    expect((page.root as any).checked).toBe(true);
  });
});
