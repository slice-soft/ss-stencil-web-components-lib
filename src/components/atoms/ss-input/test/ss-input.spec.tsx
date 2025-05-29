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
    input.dispatchEvent(new CustomEvent('touchCancel', {
      bubbles: true,
      cancelable: true,
    }));
    await page.waitForChanges();
    expect(emitSpy).toHaveBeenCalled();
  });
});

describe('ss-input events', () => {
  const advancedEvents = [
    { dom: 'input', emit: 'ssInput', name: 'should emit ssInput from input' },
    { dom: 'change', emit: 'ssChange', name: 'should emit ssChange from input' },
    { dom: 'invalid', emit: 'ssInvalid', name: 'should emit ssInvalid from input' },
    { dom: 'touchCancel', emit: 'ssTouchCancel', name: 'should emit ssTouchCancel from input' },
    { dom: 'focus', emit: 'ssFocus', name: 'should emit ssFocus from input' },
    { dom: 'blur', emit: 'ssBlur', name: 'should emit ssBlur from input' },
    { dom: 'keydown', emit: 'ssKeyDown', name: 'should emit ssKeyDown from input' },
    { dom: 'keypress', emit: 'ssKeyPress', name: 'should emit ssKeyPress from input' },
    { dom: 'keyup', emit: 'ssKeyUp', name: 'should emit ssKeyUp from input' },
    { dom: 'select', emit: 'ssSelect', name: 'should emit ssSelect from input' },
    { dom: 'cut', emit: 'ssCut', name: 'should emit ssCut from input' },
    { dom: 'copy', emit: 'ssCopy', name: 'should emit ssCopy from input' },
    { dom: 'paste', emit: 'ssPaste', name: 'should emit ssPaste from input' },
    { dom: 'click', emit: 'ssClick', name: 'should emit ssClick from input' },
    { dom: 'dblclick', emit: 'ssDoubleClick', name: 'should emit ssDoubleClick from input' },
    { dom: 'mousedown', emit: 'ssMouseDown', name: 'should emit ssMouseDown from input' },
    { dom: 'mouseup', emit: 'ssMouseUp', name: 'should emit ssMouseUp from input' },
    { dom: 'mouseenter', emit: 'ssMouseEnter', name: 'should emit ssMouseEnter from input' },
    { dom: 'mouseleave', emit: 'ssMouseLeave', name: 'should emit ssMouseLeave from input' },
    { dom: 'mouseover', emit: 'ssMouseOver', name: 'should emit ssMouseOver from input' },
    { dom: 'mouseout', emit: 'ssMouseOut', name: 'should emit ssMouseOut from input' },
    { dom: 'mousemove', emit: 'ssMouseMove', name: 'should emit ssMouseMove from input' },
    { dom: 'contextmenu', emit: 'ssContextMenu', name: 'should emit ssContextMenu from input' },
    { dom: 'dragstart', emit: 'ssDragStart', name: 'should emit ssDragStart from input' },
    { dom: 'drag', emit: 'ssDrag', name: 'should emit ssDrag from input' },
    { dom: 'dragenter', emit: 'ssDragEnter', name: 'should emit ssDragEnter from input' },
    { dom: 'dragleave', emit: 'ssDragLeave', name: 'should emit ssDragLeave from input' },
    { dom: 'dragover', emit: 'ssDragOver', name: 'should emit ssDragOver from input' },
    { dom: 'drop', emit: 'ssDrop', name: 'should emit ssDrop from input' },
    { dom: 'dragend', emit: 'ssDragEnd', name: 'should emit ssDragEnd from input' },
    { dom: 'wheel', emit: 'ssWheel', name: 'should emit ssWheel from input' },
    { dom: 'touchStart', emit: 'ssTouchStart', name: 'should emit ssTouchStart from input' },
    { dom: 'touchMove', emit: 'ssTouchMove', name: 'should emit ssTouchMove from input' },
    { dom: 'touchEnd', emit: 'ssTouchEnd', name: 'should emit ssTouchEnd from input' }
  ];
  advancedEvents.forEach(varTest => {
    it(varTest.name, async () => {
      const page = await newSpecPage({
        components: [SsInput],
        html: `<ss-input></ss-input>`,
      });
      const emitSpy = jest.spyOn(page.rootInstance[varTest.emit], 'emit');
      await page.waitForChanges();
      const input = page.root.shadowRoot.querySelector('input');
      expect(input).not.toBeNull();
      input.dispatchEvent(new CustomEvent(varTest.dom, {
        bubbles: true,
        cancelable: true,
      }));
      await page.waitForChanges();
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});

