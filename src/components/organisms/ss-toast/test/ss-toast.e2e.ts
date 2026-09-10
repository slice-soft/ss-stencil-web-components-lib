import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from '../../../../test/utils';

async function setup(html: string) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

const isOpen = async (page: E2EPage, selector = 'ss-toast') => (await page.find(selector)).getAttribute('open') !== null;

/** Polls until the toast has closed, or gives up and reports that it has not. */
async function closedWithin(page: E2EPage, ms: number, selector = 'ss-toast') {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (!(await isOpen(page, selector))) return true;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return !(await isOpen(page, selector));
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function open(page: E2EPage, selector = 'ss-toast') {
  return page.evaluate(sel => ((document.querySelector(sel) as HTMLElement & { open: boolean }).open = true), selector);
}

describe('ss-toast holding its clock', () => {
  const TOAST = `
    <button id="elsewhere">Elsewhere</button>
    <ss-toaster>
      <ss-toast duration="1500" heading="Saved">
        Your changes are saved.
        <ss-button slot="actions" label="Undo" size="sm"></ss-button>
      </ss-toast>
    </ss-toaster>
  `;

  it('stays while the pointer is over it, and closes once it leaves', async () => {
    const page = await setup(TOAST);
    await open(page);
    await page.hover('ss-toast');

    await wait(2000);
    expect(await isOpen(page)).toBe(true);

    await page.mouse.move(0, 0);
    expect(await closedWithin(page, 3000)).toBe(true);
  });

  it('stays while focus is inside it, and closes once focus leaves', async () => {
    // A keyboard user tabbing to Undo is reading the toast as surely as one
    // hovering over it.
    const page = await setup(TOAST);
    await open(page);
    await (await page.find('ss-toast ss-button >>> button')).focus();

    await wait(2000);
    expect(await isOpen(page)).toBe(true);

    await page.focus('#elsewhere');
    expect(await closedWithin(page, 3000)).toBe(true);
  });
});

describe('ss-toast dismissal', () => {
  it('closes from its dismiss button and reports the reason', async () => {
    const page = await setup(`<ss-toaster><ss-toast open duration="0" heading="Saved">Done.</ss-toast></ss-toaster>`);
    const changed = await page.spyOnEvent('ssOpenChange');

    await (await page.find('ss-toast ss-alert >>> .ss-alert__dismiss')).click();
    await page.waitForChanges();

    expect(await isOpen(page)).toBe(false);
    expect(changed).toHaveReceivedEventDetail({ open: false, reason: 'dismiss' });
  });
});

describe('ss-toaster layout', () => {
  const STACK = (placement = 'bottom-end') => `
    <ss-toaster placement="${placement}">
      <ss-toast id="first" open duration="0" heading="First">One</ss-toast>
      <ss-toast id="closed" duration="0" heading="Closed">Two</ss-toast>
      <ss-toast id="third" open duration="0" heading="Third">Three</ss-toast>
    </ss-toaster>
  `;

  function box(page: E2EPage, selector: string) {
    return page.evaluate(sel => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
    }, selector);
  }

  it('pins its toasts to the bottom-end corner, clear of the edges', async () => {
    const page = await setup(STACK());
    const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    const region = await box(page, 'ss-toaster section');

    expect(region.right).toBe(viewport.width - 16);
    expect(region.bottom).toBe(viewport.height - 16);
  });

  it('pins them to the top-start corner when asked', async () => {
    const page = await setup(STACK('top-start'));
    const region = await box(page, 'ss-toaster section');

    expect(region.top).toBe(16);
    expect(region.left).toBe(16);
  });

  it('stacks open toasts without overlap, and a closed one takes no room', async () => {
    const page = await setup(STACK());

    const first = await box(page, '#first');
    const third = await box(page, '#third');

    expect((await box(page, '#closed')).height).toBe(0);
    expect(third.top - first.bottom).toBe(8);
  });
});
