import { newSpecPage } from '@stencil/core/testing';
import { SsSlider } from '../ss-slider';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-slider', () => {
  it('renders range input with value output and accessibility state', async () => {
    const page = await newSpecPage({
      components: [SsSlider],
      html: `<ss-slider x-id="volume" name="volume" value="25" min="0" max="50" step="5" show-value invalid accessibility-label="Volume"></ss-slider>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const input = getElement<HTMLInputElement>(shadow, 'input');
    const output = getElement<HTMLOutputElement>(shadow, 'output');

    expect(input.getAttribute('id')).toBe('volume');
    expect(input.getAttribute('name')).toBe('volume');
    expect(input.getAttribute('type')).toBe('range');
    expect(input.getAttribute('value')).toBe('25');
    expect(input.getAttribute('min')).toBe('0');
    expect(input.getAttribute('max')).toBe('50');
    expect(input.getAttribute('step')).toBe('5');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Volume');
    expect(output.textContent).toBe('25');
  });

  it('emits numeric input and change values', async () => {
    const page = await newSpecPage({
      components: [SsSlider],
      html: `<ss-slider x-id="volume" name="volume"></ss-slider>`,
    });
    const inputSpy = jest.fn();
    const changeSpy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssInput', inputSpy);
    root.addEventListener('ssChange', changeSpy);
    const input = getElement<HTMLInputElement>(getShadowRoot(root), 'input');

    input.value = '42';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(inputSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'volume', name: 'volume', value: 42 } }));
    expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'volume', name: 'volume', value: 42 } }));
  });
});
