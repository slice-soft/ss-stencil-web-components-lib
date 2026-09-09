import { newTestPage } from '../../../../test/utils';

const TOKENS = `<style>:root{
  --ss-radius-base: 8px;
  --ss-radius-none: 0px;
  --ss-input-border-radius: 8px;
}</style>`;

/** The four corner radii of the control the group renders around. */
async function controlCorners(page: Awaited<ReturnType<typeof newTestPage>>) {
  return page.evaluate(() => {
    const input = (document.querySelector('ss-input') as HTMLElement).shadowRoot!.querySelector('input')!;
    const cs = getComputedStyle(input);
    return { startStart: cs.borderStartStartRadius, startEnd: cs.borderStartEndRadius };
  });
}

describe('ss-input-group seam', () => {
  it('flattens the control where an addon meets it', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><span slot="start">$</span><ss-input></ss-input></ss-input-group>`);
    await page.waitForChanges();

    // Only the side with the addon goes flat; the free side keeps its radius.
    expect(await controlCorners(page)).toEqual({ startStart: '0px', startEnd: '8px' });
  });

  it('flattens both sides when the control sits between addons', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><span slot="start">$</span><ss-input></ss-input><span slot="end">.00</span></ss-input-group>`);
    await page.waitForChanges();

    expect(await controlCorners(page)).toEqual({ startStart: '0px', startEnd: '0px' });
  });

  it('leaves a lone control fully rounded', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><ss-input></ss-input></ss-input-group>`);
    await page.waitForChanges();

    expect(await controlCorners(page)).toEqual({ startStart: '8px', startEnd: '8px' });
  });

  it('re-joins the control when an addon is added later', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><ss-input></ss-input></ss-input-group>`);
    await page.waitForChanges();
    expect((await controlCorners(page)).startEnd).toBe('8px');

    await page.evaluate(() => {
      const addon = document.createElement('span');
      addon.setAttribute('slot', 'end');
      addon.textContent = 'kg';
      document.querySelector('ss-input-group')!.appendChild(addon);
    });
    await page.waitForChanges();

    expect((await controlCorners(page)).startEnd).toBe('0px');
  });

  it('hides an addon region that has nothing in it', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><ss-input></ss-input></ss-input-group>`);
    await page.waitForChanges();

    const displays = await page.evaluate(() => {
      const shadow = (document.querySelector('ss-input-group') as HTMLElement).shadowRoot!;
      return Array.from(shadow.querySelectorAll('.ss-input-group__addon')).map(addon => getComputedStyle(addon).display);
    });
    expect(displays).toEqual(['none', 'none']);
  });

  it('leaves the control able to take input', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-input-group><span slot="start">$</span><ss-input name="amount"></ss-input></ss-input-group>`);
    await page.waitForChanges();

    const input = await page.find('ss-input >>> input');
    await input.type('42');
    await page.waitForChanges();

    expect(await page.evaluate(() => (document.querySelector('ss-input') as HTMLElement).shadowRoot!.querySelector('input')!.value)).toBe('42');
  });
});
