import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from './utils';

/**
 * Entrances and exits, with real durations. useTokens zeroes every duration so
 * the other tests never measure mid-animation; here they are stretched to 2s
 * instead, so an animation is surely still running when it is read.
 */
const SLOW =
  ':root { --ss-transitions-durations-brief: 2s; --ss-transitions-durations-moderate: 2s; --ss-transitions-durations-deliberate: 2s; --ss-transitions-durations-leisurely: 2s; }';

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
});
