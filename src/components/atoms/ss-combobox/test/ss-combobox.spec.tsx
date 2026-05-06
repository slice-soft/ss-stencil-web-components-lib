import { newSpecPage } from '@stencil/core/testing';
import { SsCombobox } from '../ss-combobox';
import { getRoot, getElement } from '../../../../test/utils';

describe('ss-combobox', () => {
  it('renders input with datalist options and accessibility state', async () => {
    const page = await newSpecPage({
      components: [SsCombobox],
      html: `<ss-combobox x-id="city" placeholder="City" value="Bogota" required invalid accessibility-label="City"><option value="Bogota"></option></ss-combobox>`,
    });
    const root = getRoot(page);
    const input = getElement<HTMLInputElement>(root, 'input');
    const datalist = getElement<HTMLDataListElement>(root, 'datalist');

    expect(input.getAttribute('id')).toBe('city');
    expect(input.getAttribute('list')).toBe('city-list');
    expect(input.getAttribute('placeholder')).toBe('City');
    expect(input.getAttribute('value')).toBe('Bogota');
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('City');
    expect(datalist.getAttribute('id')).toBe('city-list');
    expect(getElement<HTMLOptionElement>(datalist, 'option').getAttribute('value')).toBe('Bogota');
  });

  it('emits input and change events with normalized value', async () => {
    const page = await newSpecPage({
      components: [SsCombobox],
      html: `<ss-combobox x-id="city" name="city"><option value="Bogota"></option></ss-combobox>`,
    });
    const inputSpy = jest.fn();
    const changeSpy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssInput', inputSpy);
    root.addEventListener('ssChange', changeSpy);
    const input = getElement<HTMLInputElement>(root, 'input');

    input.value = 'Medellin';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(inputSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'city', value: 'Medellin' } }));
    expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'city', value: 'Medellin' } }));
  });
});
