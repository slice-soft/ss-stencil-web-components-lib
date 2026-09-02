import { newE2EPage } from '@stencil/core/testing';

describe('ss-checkbox browser behavior', () => {
  it('toggles through a real click and emits its public payload', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-checkbox x-id="terms" name="terms" value="accepted" label="Accept terms"></ss-checkbox>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-checkbox input');
    const label = await page.find('ss-checkbox label');

    await label.click();
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ xId: 'terms', name: 'terms', value: 'accepted', checked: true });
    expect(await input.getProperty('checked')).toBe(true);
    expect(await page.find('ss-checkbox')).toHaveAttribute('checked');
  });

  it('synchronizes indeterminate state and clears it on user input', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-checkbox indeterminate label="Select all"></ss-checkbox>');
    const input = await page.find('ss-checkbox input');
    const label = await page.find('ss-checkbox label');

    expect(await input.getProperty('indeterminate')).toBe(true);
    await label.click();
    await page.waitForChanges();

    expect(await input.getProperty('indeterminate')).toBe(false);
    expect(await input.getProperty('checked')).toBe(true);
  });

  it('restores its state and emits no change when readonly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-checkbox checked readonly label="Accept terms"></ss-checkbox>');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-checkbox input');
    const label = await page.find('ss-checkbox label');

    await label.click();
    await page.waitForChanges();

    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('checked')).toBe(true);
  });
});
