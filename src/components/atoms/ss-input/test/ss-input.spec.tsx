import { newSpecPage } from '@stencil/core/testing';
import { SsInput } from '../ss-input';

describe('ss-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input></ss-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-input>
        <mock:shadow-root>
          <input class="ss-input ss-input--md ss-input--primary ss-input--solid" type="text">
        </mock:shadow-root>
      </ss-input>
    `);
  });

  it('renders with given props', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input
        type="email"
        placeholder="test placeholder"
        value="initial"
        disabled
        full-width
        x-style="underline"
        inline-styles="background-color: red;"
      ></ss-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-input type="email" placeholder="test placeholder" value="initial" disabled full-width x-style="underline" inline-styles="background-color: red;">
        <mock:shadow-root>
          <input
            type="email"
            placeholder="test placeholder"
            value="initial"
            disabled
            class="ss-input ss-input--primary ss-input--underline ss-input--md ss-input--full-width ss-input--disabled"
            style="background-color: red;"
          />
        </mock:shadow-root>
      </ss-input>
    `);
  });

  it('renders with custom color, size, style and xId', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input x-id=\"my-id\" color=\"secondary\" size=\"lg\" x-style=\"outline\"></ss-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-input x-id="my-id" color="secondary" size="lg" x-style="outline">
        <mock:shadow-root>
          <input id="my-id" class="ss-input ss-input--secondary ss-input--outline ss-input--lg" type="text">
        </mock:shadow-root>
      </ss-input>
    `);
  });

  it('applies inlineStyles object', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input></ss-input>`,
    });
    (page.root as any).inlineStyles = { color: 'red', backgroundColor: 'blue' };
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('input').getAttribute('style')).toBe('color: red; background-color: blue;');
  });

  it('forwards form attributes to the native input', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input name="email" required></ss-input>`,
    });
    const input = page.root.shadowRoot.querySelector('input');

    expect(input.getAttribute('name')).toBe('email');
    expect(input.required).toBe(true);
  });

  it('supports readonly, invalid, autocomplete, and aria props', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input readonly invalid autocomplete="email" accessibility-label="Email" described-by="email-help"></ss-input>`,
    });
    const input = page.root.shadowRoot.querySelector('input');

    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('aria-label')).toBe('Email');
    expect(input.getAttribute('aria-describedby')).toBe('email-help');
    expect(input.classList.contains('ss-input--invalid')).toBe(true);
  });

  it('emits ssInput and ssChange with normalized value', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input x-id="email"></ss-input>`,
    });
    const inputSpy = jest.fn();
    const changeSpy = jest.fn();
    page.root.addEventListener('ssInput', inputSpy);
    page.root.addEventListener('ssChange', changeSpy);
    const input = page.root.shadowRoot.querySelector('input');

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(inputSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'email', value: 'test@example.com' } }));
    expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'email', value: 'test@example.com' } }));
  });

  it('emits ssFocus and ssBlur', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input></ss-input>`,
    });
    const focusSpy = jest.spyOn(page.rootInstance.ssFocus, 'emit');
    const blurSpy = jest.spyOn(page.rootInstance.ssBlur, 'emit');
    const input = page.root.shadowRoot.querySelector('input');

    input.dispatchEvent(new FocusEvent('focus'));
    input.dispatchEvent(new FocusEvent('blur'));
    await page.waitForChanges();

    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });
});
