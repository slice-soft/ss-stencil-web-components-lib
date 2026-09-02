import { newE2EPage } from '@stencil/core/testing';

describe('ss-radio browser behavior', () => {
  it('checks through a real click and emits its public payload', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-radio x-id="medium" name="size" value="m" label="Medium"></ss-radio>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-radio input');

    await input.click();
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ xId: 'medium', name: 'size', value: 'm', checked: true });
    expect(await input.getProperty('checked')).toBe(true);
    expect(await page.find('ss-radio')).toHaveAttribute('checked');
  });

  it('does not change or emit when disabled', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-radio disabled></ss-radio>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-radio input');

    await input.click();
    await page.waitForChanges();

    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('checked')).toBe(false);
  });

  it('restores its state and emits no change when readonly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-radio checked readonly></ss-radio>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-radio input');

    await input.click();
    await page.waitForChanges();

    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('checked')).toBe(true);
  });
});
