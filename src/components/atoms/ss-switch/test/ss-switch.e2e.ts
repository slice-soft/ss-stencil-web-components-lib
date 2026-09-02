import { newE2EPage } from '@stencil/core/testing';

describe('ss-switch browser behavior', () => {
  it('toggles its checked and accessibility state', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-switch x-id="notifications" name="notifications" value="enabled" label="Notifications"></ss-switch>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-switch input');
    const label = await page.find('ss-switch label');

    await label.click();
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({
      xId: 'notifications',
      name: 'notifications',
      value: 'enabled',
      checked: true,
    });
    expect(await input.getProperty('checked')).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('does not toggle or emit when disabled', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-switch disabled label="Notifications"></ss-switch>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-switch input');
    const label = await page.find('ss-switch label');

    await label.click();
    await page.waitForChanges();

    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('checked')).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('restores its checked state and emits no change when readonly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-switch checked readonly label="Notifications"></ss-switch>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-switch input');
    const label = await page.find('ss-switch label');

    await label.click();
    await page.waitForChanges();

    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('checked')).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });
});
