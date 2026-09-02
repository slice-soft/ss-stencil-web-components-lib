import { newE2EPage } from '@stencil/core/testing';

describe('ss-slider browser behavior', () => {
  it('updates its value and output through keyboard interaction', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-slider x-id="volume" name="volume" value="20" step="5" show-value></ss-slider>');
    const inputSpy = await page.spyOnEvent('ssInput');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    expect(inputSpy).toHaveReceivedEventDetail({ xId: 'volume', name: 'volume', value: 25 });
    expect(changeSpy).toHaveReceivedEventDetail({ xId: 'volume', name: 'volume', value: 25 });
    expect((await page.find('ss-slider >>> output')).textContent).toBe('25');
  });

  it('keeps its value and emits no value event when readonly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-slider value="40" readonly show-value></ss-slider>');
    const inputSpy = await page.spyOnEvent('ssInput');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    expect(inputSpy).not.toHaveReceivedEvent();
    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('value')).toBe('40');
    expect((await page.find('ss-slider >>> output')).textContent).toBe('40');
  });

  it('forwards focus and blur events', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-slider></ss-slider><button>Next</button>');
    const focusSpy = await page.spyOnEvent('ssFocus');
    const blurSpy = await page.spyOnEvent('ssBlur');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('Tab');
    await page.waitForChanges();

    expect(focusSpy).toHaveReceivedEvent();
    expect(blurSpy).toHaveReceivedEvent();
  });
});
