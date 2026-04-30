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
  it('should emit focus and blur events on keyboard interaction', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input></ss-input>');
    const input = await page.find('ss-input >>> input');
    const focusSpy = await page.spyOnEvent('ssFocus');
    const blurSpy = await page.spyOnEvent('ssBlur');

    await input.focus();
    await page.waitForChanges();
    expect(focusSpy).toHaveReceivedEvent();

    await input.press('Tab');
    await page.waitForChanges();
    expect(blurSpy).toHaveReceivedEvent();
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
