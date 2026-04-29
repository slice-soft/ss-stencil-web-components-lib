import { newSpecPage } from '@stencil/core/testing';
import { SsTextarea } from '../ss-textarea';

describe('ss-textarea', () => {
  it('renders props and accessibility state', async () => {
    const page = await newSpecPage({
      components: [SsTextarea],
      html: `<ss-textarea value="Hello" rows="4" required readonly invalid accessibility-label="Message"></ss-textarea>`,
    });
    const textarea = page.root.shadowRoot.querySelector('textarea');

    expect(textarea.getAttribute('value')).toBe('Hello');
    expect(textarea.getAttribute('rows')).toBe('4');
    expect(textarea.hasAttribute('required')).toBe(true);
    expect(textarea.hasAttribute('readonly')).toBe(true);
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-label')).toBe('Message');
  });

  it('emits input and change value events', async () => {
    const page = await newSpecPage({
      components: [SsTextarea],
      html: `<ss-textarea x-id="message"></ss-textarea>`,
    });
    const inputSpy = jest.fn();
    const changeSpy = jest.fn();
    page.root.addEventListener('ssInput', inputSpy);
    page.root.addEventListener('ssChange', changeSpy);
    const textarea = page.root.shadowRoot.querySelector('textarea');

    textarea.value = 'Updated';
    textarea.dispatchEvent(new Event('input'));
    textarea.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(inputSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'message', value: 'Updated' } }));
    expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'message', value: 'Updated' } }));
  });
});
