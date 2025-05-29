import { newE2EPage } from '@stencil/core/testing';

describe('ss-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input></ss-input>');

    const element = await page.find('ss-input');
    expect(element).toHaveClass('hydrated');
  });
});

describe('ss-input attributes and events', () => {
  it('should reflect attributes and disabled state', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-input type=\"text\" placeholder=\"hello\" disabled full-width></ss-input>`);
    const input = await page.find('ss-input >>> input');
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('placeholder')).toBe('hello');
    expect(input).toHaveClass('ss-input--full-width');
    expect(input).toHaveAttribute('disabled');
  });

  it('should emit ssInput and ssChange events', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input></ss-input>');
    const input = await page.find('ss-input >>> input');
    const ssInputSpy = await page.spyOnEvent('ssInput');
    const ssChangeSpy = await page.spyOnEvent('ssChange');
    await input.type('a');
    expect(ssInputSpy).toHaveReceivedEvent();
    await input.press('Enter');
    expect(ssChangeSpy).toHaveReceivedEvent();
  });
});

describe('ss-input events', () => {
  it('should emit key events', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input></ss-input>');
    const input = await page.find('ss-input >>> input');
    const keyDownSpy = await page.spyOnEvent('ssKeyDown');
    const keyUpSpy = await page.spyOnEvent('ssKeyUp');

    await input.press('a');
    expect(keyDownSpy).toHaveReceivedEvent();
    expect(keyUpSpy).toHaveReceivedEvent();
  });
});

describe('ss-input advanced events', () => {
  it('should emit ssInvalid event', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input required></ss-input>');
    const invalidSpy = await page.spyOnEvent('ssInvalid');

    await page.evaluate(() => {
      const input = (document.querySelector('ss-input') as any).shadowRoot.querySelector('input');
      input.dispatchEvent(new Event('invalid', { bubbles: true, cancelable: true }));
    });
    await page.waitForChanges();
    expect(invalidSpy).toHaveReceivedEvent();
  });
});
