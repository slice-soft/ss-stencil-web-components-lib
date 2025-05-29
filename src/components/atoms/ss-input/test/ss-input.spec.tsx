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
    (page.rootInstance as any).inlineStyles = { color: 'red', backgroundColor: 'blue' };
    page.rootInstance.componentWillLoad();
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('input').getAttribute('style')).toBe('color: red; background-color: blue;');
  });
  it('should emit ssTouchCancel from input', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input></ss-input>`,
    });
    const emitSpy = jest.spyOn(page.rootInstance.ssTouchCancel, 'emit');
    await page.waitForChanges();
    const input = page.root.shadowRoot.querySelector('input');
    expect(input).not.toBeNull();
    input.dispatchEvent(
      new CustomEvent('touchCancel', {
        bubbles: true,
        cancelable: true,
      }),
    );
    await page.waitForChanges();
    expect(emitSpy).toHaveBeenCalled();
  });
});

describe('ss-input events', () => {
  const advancedEvents = [
    { dom: 'input', emit: 'ssInput' },
    { dom: 'change', emit: 'ssChange' },
    { dom: 'invalid', emit: 'ssInvalid' },
    { dom: 'touchCancel', emit: 'ssTouchCancel' },
    { dom: 'focus', emit: 'ssFocus' },
    { dom: 'blur', emit: 'ssBlur' },
    { dom: 'keydown', emit: 'ssKeyDown' },
    { dom: 'keypress', emit: 'ssKeyPress' },
    { dom: 'keyup', emit: 'ssKeyUp' },
    { dom: 'select', emit: 'ssSelect' },
    { dom: 'cut', emit: 'ssCut' },
    { dom: 'copy', emit: 'ssCopy' },
    { dom: 'paste', emit: 'ssPaste' },
    { dom: 'click', emit: 'ssClick' },
    { dom: 'dblclick', emit: 'ssDoubleClick' },
    { dom: 'mousedown', emit: 'ssMouseDown' },
    { dom: 'mouseup', emit: 'ssMouseUp' },
    { dom: 'mouseenter', emit: 'ssMouseEnter' },
    { dom: 'mouseleave', emit: 'ssMouseLeave' },
    { dom: 'mouseover', emit: 'ssMouseOver' },
    { dom: 'mouseout', emit: 'ssMouseOut' },
    { dom: 'mousemove', emit: 'ssMouseMove' },
    { dom: 'contextmenu', emit: 'ssContextMenu' },
    { dom: 'dragstart', emit: 'ssDragStart' },
    { dom: 'drag', emit: 'ssDrag' },
    { dom: 'dragenter', emit: 'ssDragEnter' },
    { dom: 'dragleave', emit: 'ssDragLeave' },
    { dom: 'dragover', emit: 'ssDragOver' },
    { dom: 'drop', emit: 'ssDrop' },
    { dom: 'dragend', emit: 'ssDragEnd' },
    { dom: 'wheel', emit: 'ssWheel' },
    { dom: 'touchStart', emit: 'ssTouchStart' },
    { dom: 'touchMove', emit: 'ssTouchMove' },
    { dom: 'touchEnd', emit: 'ssTouchEnd' },
  ];
  advancedEvents.forEach(({ dom, emit }) => {
    it(`renders and emits ${emit} event`, async () => {
      const page = await newSpecPage({
        components: [SsInput],
        html: `<ss-input></ss-input>`,
      });
      const emitSpy = jest.spyOn(page.rootInstance[emit], 'emit');
      await page.waitForChanges();
      const input = page.root.shadowRoot.querySelector('input');
      expect(input).not.toBeNull();
      input.dispatchEvent(
        new CustomEvent(dom, {
          bubbles: true,
          cancelable: true,
        }),
      );
      await page.waitForChanges();
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
