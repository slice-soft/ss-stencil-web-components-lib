import { newE2EPage } from '@stencil/core/testing';

describe('ss-select browser behavior', () => {
  it('selects an option and emits the public value payload', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ss-select x-id="country" name="country" placeholder="Choose a country">
        <option value="co">Colombia</option>
        <option value="us">United States</option>
      </ss-select>
    `);
    const changeSpy = await page.spyOnEvent('ssChange');

    await page.evaluate(() => {
      const select = document.querySelector('ss-select select') as HTMLSelectElement;
      select.value = 'us';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ xId: 'country', name: 'country', value: 'us' });
    expect(await (await page.find('ss-select select')).getProperty('value')).toBe('us');
  });

  it('emits every selected value in multiple mode', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ss-select name="frameworks" multiple>
        <option value="angular">Angular</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </ss-select>
    `);
    const changeSpy = await page.spyOnEvent('ssChange');

    await page.evaluate(() => {
      const select = document.querySelector('ss-select select') as HTMLSelectElement;
      select.options[0].selected = true;
      select.options[2].selected = true;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ name: 'frameworks', value: ['angular', 'vue'] });
  });

  it('forwards focus, blur, and native invalid behavior', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-select required><option value="">Choose</option></ss-select><button>Next</button>');
    const focusSpy = await page.spyOnEvent('ssFocus');
    const blurSpy = await page.spyOnEvent('ssBlur');
    const invalidSpy = await page.spyOnEvent('ssInvalid');
    const select = await page.find('ss-select select');

    await select.focus();
    await select.press('Tab');
    await page.evaluate(() => (document.querySelector('ss-select select') as HTMLSelectElement).reportValidity());
    await page.waitForChanges();

    expect(focusSpy).toHaveReceivedEvent();
    expect(blurSpy).toHaveReceivedEvent();
    expect(invalidSpy).toHaveReceivedEventDetail({ value: '' });
  });
});
