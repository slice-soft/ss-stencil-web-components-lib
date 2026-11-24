import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from './utils';

/**
 * Entrances and exits, with real durations. useTokens zeroes every duration so
 * the other tests never measure mid-animation; here they are stretched to 2s
 * instead, so an animation is surely still running when it is read.
 */
const SLOW =
  ':root { --ss-transitions-durations-brief: 2s; --ss-transitions-durations-moderate: 2s; --ss-transitions-durations-deliberate: 2s; --ss-transitions-durations-leisurely: 2s; --ss-transitions-durations-ambient: 2s; }';

async function motionPage(html: string, reduce = false) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  await page.addStyleTag({ content: SLOW });
  if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.waitForChanges();
  return page;
}

interface Running {
  display: string;
  transform: string;
  origin: string;
  easing: string;
  properties: string[];
}

/** What an element is doing right now: its running transitions and current transform. */
async function running(page: E2EPage, selector: string): Promise<Running> {
  await page.waitForFunction(`!!document.querySelector(${JSON.stringify(selector)})`);
  return (await page.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const style = getComputedStyle(el);
    return {
      display: style.display,
      transform: style.transform,
      origin: style.transformOrigin,
      easing: style.transitionTimingFunction,
      properties: el.getAnimations().map(a => a.transitionProperty).filter(Boolean).sort(),
    };
  })()`)) as Running;
}

const scaleOf = (transform: string) => (transform === 'none' ? 1 : Number(transform.match(/^matrix\(([^,]+)/)?.[1]));

const POPOVER = '<div style="padding: 200px"><ss-popover heading="P"><ss-button slot="trigger" label="Open"></ss-button><p>Body</p></ss-popover></div>';

describe('motion', () => {
  it('a popover grows out of its trigger and fades in', async () => {
    const page = await motionPage(POPOVER);
    await page.$eval('ss-popover', el => ((el as HTMLSsPopoverElement).open = true));
    await page.waitForChanges();
    const panel = await running(page, '.ss-popover__panel');
    expect(panel.properties).toEqual(expect.arrayContaining(['opacity', 'transform']));
    expect(scaleOf(panel.transform)).toBeLessThan(1);
    // Placed below its trigger, it grows from its top edge.
    expect(panel.origin).toMatch(/ 0px$/);
  });

  it('a closing popover stays on screen until its exit has played', async () => {
    const page = await motionPage(POPOVER.replace('<ss-popover', '<ss-popover open'));
    await page.evaluate(`document.querySelector('.ss-popover__panel').getAnimations().forEach(a => a.finish())`);
    await page.$eval('ss-popover', el => ((el as HTMLSsPopoverElement).open = false));
    await page.waitForChanges();
    const panel = await running(page, '.ss-popover__panel');
    expect(panel.display).not.toBe('none');
    expect(panel.properties).toEqual(expect.arrayContaining(['display', 'opacity', 'transform']));
  });

  it('with reduced motion an overlay only fades', async () => {
    const page = await motionPage(POPOVER, true);
    await page.$eval('ss-popover', el => ((el as HTMLSsPopoverElement).open = true));
    await page.waitForChanges();
    const panel = await running(page, '.ss-popover__panel');
    expect(panel.properties).toContain('opacity');
    expect(scaleOf(panel.transform)).toBe(1);
  });

  it('a modal grows from its centre, with its backdrop', async () => {
    const page = await motionPage('<ss-modal heading="M"><p>Body</p></ss-modal>');
    await page.$eval('ss-modal', el => ((el as HTMLSsModalElement).open = true));
    await page.waitForChanges();
    const dialog = await running(page, '.ss-modal__dialog');
    expect(dialog.properties).toEqual(expect.arrayContaining(['opacity', 'transform']));
    expect(scaleOf(dialog.transform)).toBeLessThan(1);
    expect((await running(page, '.ss-modal__backdrop')).properties).toContain('opacity');
  });

  it('a toast slides in from the edge its toaster sits on', async () => {
    const page = await motionPage(
      '<ss-toaster placement="bottom-end"><ss-toast id="b" duration="0" heading="B">x</ss-toast></ss-toaster>' +
        '<ss-toaster placement="top-end"><ss-toast id="t" duration="0" heading="T">x</ss-toast></ss-toaster>',
    );
    await page.evaluate(`document.querySelectorAll('ss-toast').forEach(t => (t.open = true))`);
    await page.waitForChanges();
    const y = (transform: string) => Number(transform.match(/(-?[\d.]+)\)$/)?.[1]);
    expect(y((await running(page, '#b .ss-toast')).transform)).toBeGreaterThan(0);
    expect(y((await running(page, '#t .ss-toast')).transform)).toBeLessThan(0);
  });

  it('an accordion section opens to its height', async () => {
    const page = await motionPage('<ss-accordion><ss-accordion-item heading="A">Body</ss-accordion-item></ss-accordion>');
    await page.$eval('ss-accordion-item', el => ((el as HTMLSsAccordionItemElement).open = true));
    await page.waitForChanges();
    expect((await running(page, '.ss-accordion-item__panel')).properties).toEqual(expect.arrayContaining(['height', 'opacity']));
  });

  it('a visual style brings its own motion', async () => {
    const page = await motionPage(
      ['brutal', 'maximal'].map(style => `<div data-style="${style}" id="${style}">${POPOVER.replace('<ss-popover', '<ss-popover open')}</div>`).join(''),
    );
    expect((await running(page, '#brutal .ss-popover__panel')).easing).toContain('linear');
    expect((await running(page, '#maximal .ss-popover__panel')).easing).toContain('cubic-bezier(0.34, 1.56, 0.64, 1)');
  });

  it('a search select list grows from its field and fades in', async () => {
    const page = await motionPage('<div style="padding: 40px"><ss-search-select accessibility-label="Pick"><ss-option value="a">A</ss-option></ss-search-select></div>');
    await page.focus('ss-search-select');
    await page.keyboard.press('ArrowDown');
    await page.waitForChanges();
    const list = (await page.evaluate(`(() => {
      const el = document.querySelector('ss-search-select').shadowRoot.querySelector('.ss-search-select__popup');
      return { properties: el.getAnimations().map(a => a.transitionProperty).filter(Boolean).sort(), transform: getComputedStyle(el).transform };
    })()`)) as { properties: string[]; transform: string };
    expect(list.properties).toEqual(expect.arrayContaining(['opacity', 'transform']));
    expect(scaleOf(list.transform)).toBeLessThan(1);
  });

  it('with reduced motion the search select indicator does not turn', async () => {
    const page = await motionPage('<ss-search-select accessibility-label="Pick"><ss-option value="a">A</ss-option></ss-search-select>', true);
    await page.focus('ss-search-select');
    await page.keyboard.press('ArrowDown');
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.querySelector('.ss-search-select__indicator').getAnimations().length`)).toBe(0);
  });

  describe('the tabs indicator', () => {
    const TABS = (attrs = '') => `<ss-tabs ${attrs}><ss-tab value="a" label="A">a</ss-tab><ss-tab value="b" label="A much longer tab">b</ss-tab></ss-tabs>`;

    /** The indicator's box, and the selected tab's, in the list's coordinates. */
    const boxes = (page: E2EPage) =>
      page.evaluate(`(() => {
        const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
        return { indicator: box(document.querySelector('.ss-tabs__indicator')), tab: box(document.querySelector('.ss-tabs__tab--selected')) };
      })()`) as Promise<{ indicator: Record<string, number>; tab: Record<string, number> }>;

    const finish = (page: E2EPage) => page.evaluate(`document.querySelector('.ss-tabs__indicator').getAnimations().forEach(a => a.finish())`);

    it('starts under the selected tab without sliding there', async () => {
      // Added once the tokens are in, so no late change of size moves it after.
      const page = await motionPage('');
      await page.evaluate(`document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(TABS('value="b"'))})`);
      await page.waitForChanges();
      expect((await running(page, '.ss-tabs__indicator')).properties).toEqual([]);
      const { indicator, tab } = await boxes(page);
      expect([indicator.x, indicator.w]).toEqual([tab.x, tab.w]);
    });

    it('slides to the newly selected tab and takes its width', async () => {
      const page = await motionPage(TABS());
      await page.$eval('ss-tabs', el => ((el as HTMLSsTabsElement).value = 'b'));
      await page.waitForChanges();
      expect((await running(page, '.ss-tabs__indicator')).properties).toEqual(expect.arrayContaining(['transform', 'width']));
      await finish(page);
      const { indicator, tab } = await boxes(page);
      expect([indicator.x, indicator.w]).toEqual([tab.x, tab.w]);
    });

    it('runs down the side of vertical tabs', async () => {
      const page = await motionPage(TABS('orientation="vertical"'));
      await page.$eval('ss-tabs', el => ((el as HTMLSsTabsElement).value = 'b'));
      await page.waitForChanges();
      await finish(page);
      const { indicator, tab } = await boxes(page);
      expect([indicator.y, indicator.h]).toEqual([tab.y, tab.h]);
    });

    it('follows its tab when the tab changes size without a render', async () => {
      const page = await motionPage(TABS());
      const width = `Math.round(document.querySelector('.ss-tabs__tab--selected').getBoundingClientRect().width)`;
      const before = (await page.evaluate(width)) as number;
      await page.evaluate(`document.querySelector('ss-tabs').style.setProperty('--ss-tabs-tab-padding-x', '40px')`);
      await page.waitForFunction(`${width} > ${before}`);
      await page.waitForFunction(`(() => {
        document.querySelector('.ss-tabs__indicator').getAnimations().forEach(a => a.finish());
        return Math.round(document.querySelector('.ss-tabs__indicator').getBoundingClientRect().width) === ${width};
      })()`);
    });

    it('jumps with reduced motion', async () => {
      const page = await motionPage(TABS(), true);
      await page.$eval('ss-tabs', el => ((el as HTMLSsTabsElement).value = 'b'));
      await page.waitForChanges();
      expect((await running(page, '.ss-tabs__indicator')).properties).toEqual([]);
    });

    it('moves with each visual style', async () => {
      const page = await motionPage(['brutal', 'maximal'].map(style => `<div data-style="${style}" id="${style}">${TABS()}</div>`).join(''));
      expect((await running(page, '#brutal .ss-tabs__indicator')).easing).toContain('linear');
      expect((await running(page, '#maximal .ss-tabs__indicator')).easing).toContain('cubic-bezier(0.34, 1.56, 0.64, 1)');
    });
  });

  describe('the skeleton', () => {
    const pulse = (page: E2EPage) =>
      page.evaluate(`(() => {
        const el = document.querySelector('ss-skeleton').shadowRoot.querySelector('.ss-skeleton__line');
        const style = getComputedStyle(el);
        return { name: style.animationName, duration: style.animationDuration, running: el.getAnimations().length };
      })()`) as Promise<{ name: string; duration: string; running: number }>;

    it('pulses slowly while it waits', async () => {
      const page = await motionPage('<ss-skeleton lines="2"></ss-skeleton>');
      const { name, duration, running: count } = await pulse(page);
      expect(name).toMatch(/pulse/);
      expect(parseFloat(duration)).toBeGreaterThanOrEqual(1);
      expect(count).toBe(1);
    });

    it('holds still with reduced motion', async () => {
      const page = await motionPage('<ss-skeleton></ss-skeleton>', true);
      expect((await pulse(page)).running).toBe(0);
    });
  });
});
