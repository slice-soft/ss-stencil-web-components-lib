import { newE2EPage } from '@stencil/core/testing';

const TOKENS = `<style>:root { --ss-z-index-tooltip: 1500; }</style>`;

describe('ss-tooltip browser behavior', () => {
  it('stacks its content on the tooltip layer token', async () => {
    const page = await newE2EPage();
    await page.setContent(`${TOKENS}<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    const content = await page.find('ss-tooltip >>> .ss-tooltip__content');

    expect((await content.getComputedStyle()).zIndex).toBe('1500');
  });

  it('keeps the host out of the stacking order so the content is not trapped', async () => {
    const page = await newE2EPage();
    await page.setContent(`${TOKENS}<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    const host = await page.find('ss-tooltip >>> .ss-tooltip');

    // A z-index on the wrapper would create a stacking context and confine the
    // absolutely positioned content to it, defeating the layer token.
    expect((await host.getComputedStyle()).zIndex).toBe('auto');
  });

  it('never intercepts pointers from the content underneath it', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      ${TOKENS}
      <ss-tooltip open placement="bottom" content="More info"><button slot="trigger">Info</button></ss-tooltip>
      <div id="sibling" style="position: relative; margin-top: -40px; height: 80px;"></div>
    `);
    await page.waitForChanges();

    const content = await page.find('ss-tooltip >>> .ss-tooltip__content');
    expect((await content.getComputedStyle()).visibility).toBe('visible');
    expect((await content.getComputedStyle()).pointerEvents).toBe('none');

    // The tooltip paints above the sibling but stays transparent to hit testing,
    // so whatever sits underneath keeps receiving the click.
    const hit = await page.evaluate(() => {
      const el = document.querySelector('ss-tooltip')!.shadowRoot!.querySelector('.ss-tooltip__content')!;
      const rect = el.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return (target as HTMLElement)?.id;
    });

    expect(hit).toBe('sibling');
  });
});
