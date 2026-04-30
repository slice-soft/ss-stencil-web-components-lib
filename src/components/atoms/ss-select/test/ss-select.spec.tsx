import { newSpecPage } from '@stencil/core/testing';
import { SsSelect } from '../ss-select';

describe('ss-select', () => {
  it('renders native select with placeholder and state', async () => {
    const page = await newSpecPage({
      components: [SsSelect],
      html: `<ss-select placeholder="Choose" required invalid accessibility-label="Choice"><option value="a">A</option></ss-select>`,
    });
    const select = page.root.querySelector('select');

    expect(select.hasAttribute('required')).toBe(true);
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('aria-label')).toBe('Choice');
    expect(select.querySelector('option').textContent).toBe('Choose');
  });

  it('emits ssChange with selected value', async () => {
    const page = await newSpecPage({
      components: [SsSelect],
      html: `<ss-select x-id="country" name="country"><option value="co">Colombia</option><option value="us">USA</option></ss-select>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssChange', spy);
    const select = page.root.querySelector('select');

    select.value = 'us';
    select.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'country', name: 'country', value: 'us' } }));
  });
});
