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

  it('should emit ssTouchCancel event', async () => {
    const page = await newE2EPage();

    await page.setContent(`
      <ss-input></ss-input>
      <script>
        document.querySelector('ss-input').addEventListener('ssTouchCancel', (e) => {
          console.log('Evento capturado externamente', e);
        });
      </script>
    `);

    const touchCancelSpy = await page.spyOnEvent('ssTouchCancel');

    await page.evaluate(() => {
      const input = document.querySelector('ss-input')?.shadowRoot?.querySelector('input');
      input?.dispatchEvent(
        new TouchEvent('touchCancel', {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: [],
        }),
      );
    });

    await page.waitForChanges();
    expect(touchCancelSpy).toHaveReceivedEvent();
  });
});
