import { newSpecPage } from '@stencil/core/testing';
import { SsTextarea } from '../ss-textarea';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-textarea', () => {
  it('renders props and accessibility state', async () => {
    const page = await newSpecPage({
      components: [SsTextarea],
      html: `<ss-textarea value="Hello" rows="4" required readonly invalid accessibility-label="Message"></ss-textarea>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const textarea = getElement<HTMLTextAreaElement>(shadow, 'textarea');

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
    const root = getRoot(page);
    root.addEventListener('ssInput', inputSpy);
    root.addEventListener('ssChange', changeSpy);
    const shadow = getShadowRoot(root);
    const textarea = getElement<HTMLTextAreaElement>(shadow, 'textarea');

    textarea.value = 'Updated';
    textarea.dispatchEvent(new Event('input'));
    textarea.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(inputSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'message', value: 'Updated' } }));
    expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'message', value: 'Updated' } }));
  });
});
