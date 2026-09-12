import { axNodeByRole, newTestPage } from '../../../../test/utils';

const TOKENS = `<style>:root { --ss-z-index-tooltip: 1500; }</style>`;

describe('ss-tooltip browser behavior', () => {
  it('stacks its content on the tooltip layer token', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    const content = await page.find('ss-tooltip .ss-tooltip__content');

    expect((await content.getComputedStyle()).zIndex).toBe('1500');
  });

  it('keeps the host out of the stacking order so the content is not trapped', async () => {
    const page = await newTestPage();
    await page.setContent(`${TOKENS}<ss-tooltip content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    const host = await page.find('ss-tooltip .ss-tooltip');

    // A z-index on the wrapper would create a stacking context and confine the
    // absolutely positioned content to it, defeating the layer token.
    expect((await host.getComputedStyle()).zIndex).toBe('auto');
  });

  it('never intercepts pointers from the content underneath it', async () => {
    const page = await newTestPage();
    await page.setContent(`
      ${TOKENS}
      <ss-tooltip open placement="bottom" content="More info"><button slot="trigger">Info</button></ss-tooltip>
      <div id="sibling" style="position: relative; margin-top: -40px; height: 80px;"></div>
    `);
    await page.waitForChanges();

    const content = await page.find('ss-tooltip .ss-tooltip__content');
    expect((await content.getComputedStyle()).visibility).toBe('visible');
    expect((await content.getComputedStyle()).pointerEvents).toBe('none');

    // The tooltip paints above the sibling but stays transparent to hit testing,
    // so whatever sits underneath keeps receiving the click.
    const hit = await page.evaluate(() => {
      const el = document.querySelector('ss-tooltip .ss-tooltip__content')!;
      const rect = el.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return (target as HTMLElement)?.id;
    });

    expect(hit).toBe('sibling');
  });
});

describe('ss-tooltip describes its trigger', () => {
  /** The description a screen reader would actually announce for the trigger. */
  async function triggerDescription(page: Awaited<ReturnType<typeof newTestPage>>) {
    return (await axNodeByRole(page, 'button', node => !!node.name)).description;
  }

  it('describes a custom-element trigger through its own control', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip open content="Saves your work"><ss-button slot="trigger" label="Save"></ss-button></ss-tooltip>`);
    await page.waitForChanges();

    expect(await triggerDescription(page)).toBe('Saves your work');
  });

  it('describes a native trigger directly', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip open content="Saves your work"><button slot="trigger">Save</button></ss-tooltip>`);
    await page.waitForChanges();

    expect(await triggerDescription(page)).toBe('Saves your work');
  });

  it('drops the description once the tooltip closes', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip trigger="click" content="Saves your work"><ss-button slot="trigger" label="Save"></ss-button></ss-tooltip>`);
    await page.waitForChanges();
    expect(await triggerDescription(page)).toBeFalsy();

    await (await page.find('ss-button >>> button')).click();
    await page.waitForChanges();
    expect(await triggerDescription(page)).toBe('Saves your work');
  });
});

describe('ss-tooltip dismissal', () => {
  it('closes on Escape', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip trigger="click" content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    await page.waitForChanges();

    await (await page.find('button[slot="trigger"]')).click();
    await page.waitForChanges();
    expect(await page.find('ss-tooltip')).toHaveAttribute('open');

    const closed = await page.spyOnEvent('ssOpenChange');
    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-tooltip')).not.toHaveAttribute('open');
    // An undefined xId does not survive serialisation across the browser
    // boundary, so the assertion is on the state the event reports.
    expect(closed.lastEvent.detail.open).toBe(false);
  });

  it('closes a hover tooltip on Escape even when focus is elsewhere', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip open content="More info"><button slot="trigger">Info</button></ss-tooltip><input id="other" />`);
    await page.waitForChanges();

    await (await page.find('#other')).focus();
    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-tooltip')).not.toHaveAttribute('open');
  });

  it('leaves a manual tooltip to its owner', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-tooltip open trigger="manual" content="More info"><button slot="trigger">Info</button></ss-tooltip>`);
    await page.waitForChanges();

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    // `manual` means the consumer owns `open`; Escape must not take it away.
    expect(await page.find('ss-tooltip')).toHaveAttribute('open');
  });
});

describe('ss-tooltip placement', () => {
  /** Where the tooltip ended up relative to its trigger, measured on screen. */
  async function geometry(page: Awaited<ReturnType<typeof newTestPage>>) {
    return page.evaluate(() => {
      const trigger = document.querySelector('.ss-tooltip__trigger')!.getBoundingClientRect();
      const content = document.querySelector('.ss-tooltip__content')!.getBoundingClientRect();
      return {
        below: content.top >= trigger.bottom,
        above: content.bottom <= trigger.top,
        withinViewport: content.top >= 0 && content.left >= 0 && content.right <= window.innerWidth && content.bottom <= window.innerHeight,
        side: document.querySelector('.ss-tooltip')!.className.match(/ss-tooltip--(top|right|bottom|left)/)?.[1],
      };
    });
  }

  it('sits where it was asked to when there is room', async () => {
    const page = await newTestPage();
    await page.setContent(`<div style="margin: 200px;"><ss-tooltip open content="More info"><button slot="trigger">Info</button></ss-tooltip></div>`);
    await page.waitForChanges();

    const result = await geometry(page);
    expect(result.above).toBe(true);
    expect(result.side).toBe('top');
  });

  it('flips below when the trigger is against the top of the window', async () => {
    const page = await newTestPage();
    await page.setContent(`<div style="margin: 0;"><ss-tooltip open placement="top" content="More info"><button slot="trigger">Info</button></ss-tooltip></div>`);
    await page.waitForChanges();

    const result = await geometry(page);
    // Asked for above, given below: there was nowhere to put it above.
    expect(result.below).toBe(true);
    expect(result.side).toBe('bottom');
    expect(result.withinViewport).toBe(true);
  });

  it('stays inside the window when the trigger is against the right edge', async () => {
    const page = await newTestPage();
    await page.setContent(
      `<div style="display:flex; justify-content:flex-end;"><ss-tooltip open content="A rather long tooltip message"><button slot="trigger">Info</button></ss-tooltip></div>`,
    );
    await page.waitForChanges();

    expect((await geometry(page)).withinViewport).toBe(true);
  });

  it('follows its trigger when the page scrolls', async () => {
    const page = await newTestPage();
    await page.setContent(`
      <div style="height: 2000px; padding-top: 900px;">
        <ss-tooltip open trigger="manual" content="More info"><button slot="trigger">Info</button></ss-tooltip>
      </div>
    `);
    await page.waitForChanges();

    const gapBefore = await page.evaluate(() => {
      const trigger = document.querySelector('.ss-tooltip__trigger')!.getBoundingClientRect();
      const content = document.querySelector('.ss-tooltip__content')!.getBoundingClientRect();
      return Math.round(trigger.top - content.bottom);
    });

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForChanges();

    const gapAfter = await page.evaluate(() => {
      const trigger = document.querySelector('.ss-tooltip__trigger')!.getBoundingClientRect();
      const content = document.querySelector('.ss-tooltip__content')!.getBoundingClientRect();
      return Math.round(trigger.top - content.bottom);
    });

    // The gap is what matters: a tooltip left behind would show a growing one.
    expect(gapAfter).toBe(gapBefore);
  });
});
