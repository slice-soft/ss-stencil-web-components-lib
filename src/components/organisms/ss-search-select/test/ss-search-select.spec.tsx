import { newSpecPage } from '@stencil/core/testing';
import { SsSearchSelect } from '../ss-search-select';
import { getElement, getRoot, getShadowRoot } from '../../../../test/utils';

describe('ss-search-select', () => {
  it('ties the combobox to its listbox', async () => {
    const page = await newSpecPage({ components: [SsSearchSelect], html: '<ss-search-select><ss-option value="co">Colombia</ss-option></ss-search-select>' });
    const shadow = getShadowRoot(getRoot(page));
    const input = getElement(shadow, 'input');
    const list = getElement(shadow, '[role=listbox]');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
  });

  it('starts from the selected child', async () => {
    const page = await newSpecPage({
      components: [SsSearchSelect],
      html: '<ss-search-select><ss-option value="co">Colombia</ss-option><ss-option value="pe" selected>Perú</ss-option></ss-search-select>',
    });
    const root = getRoot(page) as HTMLElement & { value?: string };
    expect(root.value).toBe('pe');
    expect((getElement(getShadowRoot(root), 'input') as HTMLInputElement).value).toBe('Perú');
  });
});
