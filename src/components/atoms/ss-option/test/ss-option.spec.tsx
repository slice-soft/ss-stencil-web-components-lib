import { newSpecPage } from '@stencil/core/testing';
import { SsOption } from '../ss-option';

describe('ss-option', () => {
  it('renders nothing of its own and is hidden', async () => {
    const page = await newSpecPage({ components: [SsOption], html: '<ss-option value="co">Colombia</ss-option>' });
    const option = page.body.querySelector('ss-option')!;
    expect(option.hasAttribute('hidden')).toBe(true);
    expect(option.shadowRoot).toBeNull();
  });

  it('tells its parent when it changes', async () => {
    const page = await newSpecPage({ components: [SsOption], html: '<div><ss-option value="co">Colombia</ss-option></div>' });
    const changed = jest.fn();
    page.body.querySelector('div')!.addEventListener('ssOptionChange', changed);
    const option = page.body.querySelector('ss-option') as HTMLElement & { disabled: boolean };
    option.disabled = true;
    await page.waitForChanges();
    expect(changed).toHaveBeenCalled();
  });
});
