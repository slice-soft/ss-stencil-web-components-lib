import { E2EPage } from '@stencil/core/testing';
import { newTestPage } from '../../../../test/utils';

/** Computed display of each card region, which is what decides the gaps. */
async function regionDisplay(page: E2EPage) {
  return page.evaluate(() => {
    const shadow = (document.querySelector('ss-card') as HTMLElement).shadowRoot!;
    const read = (name: string) => getComputedStyle(shadow.querySelector(`.ss-card__${name}`)!).display;
    return { media: read('media'), header: read('header'), content: read('content'), footer: read('footer') };
  });
}

describe('ss-card regions', () => {
  it('collapses every region the caller did not fill', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-card>Just body</ss-card>`);
    await page.waitForChanges();

    expect(await regionDisplay(page)).toEqual({ media: 'none', header: 'none', content: 'block', footer: 'none' });
  });

  it('shows only the regions that have content', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-card><h3 slot="header">Title</h3>Body<span slot="footer">Footer</span></ss-card>`);
    await page.waitForChanges();

    expect(await regionDisplay(page)).toEqual({ media: 'none', header: 'block', content: 'block', footer: 'block' });
  });

  it('renders the slotted content in reading order', async () => {
    const page = await newTestPage();
    await page.setContent(
      `<ss-card><img slot="media" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /><h3 slot="header">Title</h3>Body<span slot="footer">Footer</span></ss-card>`,
    );
    await page.waitForChanges();

    const order = await page.evaluate(() => {
      const shadow = (document.querySelector('ss-card') as HTMLElement).shadowRoot!;
      return Array.from(shadow.querySelectorAll('slot')).flatMap(slot =>
        (slot as HTMLSlotElement).assignedNodes({ flatten: true }).map(node => (node.textContent ?? '').trim() || node.nodeName.toLowerCase()),
      );
    });
    expect(order.filter(Boolean)).toEqual(['img', 'Title', 'Body', 'Footer']);
  });
});
