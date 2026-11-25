import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, emulateFocus, newTestPage, useTokens } from '../../../../test/utils';

const DRAWER = (attrs = '', body = '<button id="inside">Inside</button>') => `
  <meta charset="utf-8">
  <button id="opener">Abrir</button>
  <input id="page-input" />
  <ss-drawer heading="Filtros" ${attrs}>
    ${body}
    <ss-button slot="footer" label="Aplicar"></ss-button>
  </ss-drawer>`;

async function setup(html: string, viewport?: { width: number; height: number }): Promise<E2EPage> {
  const page = await newTestPage();
  if (viewport) await page.setViewport(viewport);
  await page.setContent(html);
  await useTokens(page);
  await emulateFocus(page);
  return page;
}

async function open(page: E2EPage) {
  await page.evaluate(`document.querySelector('ss-drawer').open = true`);
  await page.waitForChanges();
  await page.waitForChanges();
}

const isOpen = (page: E2EPage) => page.evaluate(`document.querySelector('ss-drawer').open`) as Promise<boolean>;

/** The element that really has focus, through shadow roots. */
const activeId = (page: E2EPage) =>
  page.evaluate(
    `(() => { let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return a && (a.id || a.className || a.tagName); })()`,
  ) as Promise<string>;

const panelRect = (page: E2EPage) =>
  page.evaluate(
    `(() => { const r = document.querySelector('.ss-drawer__panel').getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height, vw: innerWidth, vh: innerHeight }; })()`,
  ) as Promise<{
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    vw: number;
    vh: number;
  }>;

describe('ss-drawer, modal', () => {
  it('is a modal dialog named by its heading', async () => {
    const page = await setup(DRAWER('open'));
    const node = await axNodeByRole(page, 'dialog');
    expect(node.name).toBe('Filtros');
    expect(node.modal).toBe(true);
  });

  it('traps focus and returns it on close', async () => {
    const page = await setup(DRAWER());
    await page.focus('#opener');
    await open(page);

    for (let step = 0; step < 6; step++) {
      await page.keyboard.press('Tab');
      expect(['opener', 'page-input']).not.toContain(await activeId(page));
    }

    const changes = await page.spyOnEvent('ssOpenChange');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(false);
    expect(changes).toHaveReceivedEventDetail({ open: false });
    expect(await activeId(page)).toBe('opener');
  });

  it('the backdrop closes it; close-on-backdrop="false" does not', async () => {
    const page = await setup(DRAWER('open placement="end" size="sm"'));
    await page.mouse.click(5, 5);
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(false);

    const locked = await setup(DRAWER('open placement="end" size="sm" close-on-backdrop="false"'));
    await locked.mouse.click(5, 5);
    await locked.waitForChanges();
    expect(await isOpen(locked)).toBe(true);
  });

  it('Escape in a dropdown inside the drawer closes only the dropdown', async () => {
    const page = await setup(DRAWER('open', `<ss-dropdown><ss-button slot="trigger" label="Más"></ss-button><ss-dropdown-item value="a">A</ss-dropdown-item></ss-dropdown>`));
    await (await page.find('ss-dropdown ss-button[slot="trigger"] >>> button')).click();
    await page.waitForChanges();
    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.evaluate(`document.querySelector('ss-dropdown').open`)).toBe(false);
    expect(await isOpen(page)).toBe(true);
  });

  it('a dropdown inside an open drawer opens against its trigger', async () => {
    const page = await setup(DRAWER('open', `<ss-dropdown><ss-button slot="trigger" label="Más"></ss-button><ss-dropdown-item value="a">A</ss-dropdown-item></ss-dropdown>`));
    await (await page.find('ss-dropdown ss-button[slot="trigger"] >>> button')).click();
    await page.waitForChanges();
    const [trigger, menu] = (await page.evaluate(
      `['.ss-dropdown__trigger', '.ss-dropdown__menu'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return { bottom: r.bottom, top: r.top, left: r.left }; })`,
    )) as {
      bottom: number;
      top: number;
      left: number;
    }[];
    expect(Math.abs(menu.top - trigger.bottom)).toBeLessThanOrEqual(6);
    expect(Math.abs(menu.left - trigger.left)).toBeLessThanOrEqual(2);
  });
});

describe('ss-drawer, non-modal', () => {
  it('leaves the page usable', async () => {
    const page = await setup(DRAWER('open modal="false"'));
    expect(await page.evaluate(`!!document.querySelector('.ss-drawer__backdrop')`)).toBe(false);
    expect((await axNodeByRole(page, 'dialog')).modal).toBeFalsy();

    await page.focus('#page-input');
    await page.keyboard.type('hola');
    expect(await page.evaluate(`document.querySelector('#page-input').value`)).toBe('hola');
    expect(await isOpen(page)).toBe(true);
  });

  it('a press on the page does not close it', async () => {
    const page = await setup(DRAWER('open modal="false" size="sm"'));
    await page.click('#opener');
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(true);
  });

  it('closes on Escape only from inside', async () => {
    const page = await setup(DRAWER('modal="false"'));
    await open(page);
    await page.focus('#page-input');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(true);

    await page.focus('#inside');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(false);
  });

  it('with close-on-escape="false" it does not take Escape meant for a layer beneath', async () => {
    // A dialog open first, then the panel on top of the stack: Escape pressed
    // in the dialog is the dialog's, whether or not the panel closes on Escape.
    const page = await setup(
      `<meta charset="utf-8"><ss-modal heading="M"><button id="in-modal">x</button></ss-modal>` +
        `<ss-drawer modal="false" close-on-escape="false" heading="D"><button id="inside">Inside</button></ss-drawer>`,
    );
    await page.evaluate(`document.querySelector('ss-modal').open = true`);
    await page.waitForChanges();
    await open(page);
    await page.focus('#inside');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await isOpen(page)).toBe(true);
    expect(await page.evaluate(`document.querySelector('ss-modal').open`)).toBe(true);

    await page.focus('#in-modal');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-modal').open`)).toBe(false);
    expect(await isOpen(page)).toBe(true);
  });

  it('moves focus into the panel when it opens', async () => {
    const page = await setup(DRAWER('modal="false"'));
    await page.focus('#opener');
    await open(page);
    expect(await page.evaluate(`(() => { const p = document.querySelector('.ss-drawer__panel'); return p.contains(document.activeElement); })()`)).toBe(true);
  });

  it('closed from the page, it keeps focus where it is', async () => {
    const page = await setup(DRAWER('modal="false"'));
    await page.focus('#opener');
    await open(page);
    await page.focus('#page-input');
    await page.evaluate(`document.querySelector('ss-drawer').open = false`);
    await page.waitForChanges();
    expect(await activeId(page)).toBe('page-input');
  });

  it('closed from inside, it returns focus where it came from', async () => {
    const page = await setup(DRAWER('modal="false"'));
    await page.focus('#opener');
    await open(page);
    await page.focus('#inside');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await activeId(page)).toBe('opener');
  });
});

describe('ss-drawer placement', () => {
  it.each([
    ['end', 'right'],
    ['start', 'left'],
    ['top', 'top'],
    ['bottom', 'bottom'],
  ])('%s enters from the %s edge', async (placement, edge) => {
    const page = await setup(DRAWER(`open placement="${placement}" size="sm"`), { width: 1000, height: 800 });
    const r = await panelRect(page);
    const touches = { right: r.right === r.vw, left: r.left === 0, top: r.top === 0, bottom: r.bottom === r.vh };
    expect(touches[edge as keyof typeof touches]).toBe(true);
    if (edge === 'left' || edge === 'right') expect(r.height).toBe(r.vh);
    else expect(r.width).toBe(r.vw);
  });

  it('start follows the writing direction', async () => {
    const page = await setup(`<html dir="rtl">${DRAWER('open placement="start" size="sm"')}</html>`, { width: 1000, height: 800 });
    await page.evaluate(`document.documentElement.dir = 'rtl'`);
    await page.waitForChanges();
    const r = await panelRect(page);
    expect(r.right).toBe(r.vw);
  });

  it('never covers the whole viewport across its axis', async () => {
    const page = await setup(DRAWER('open placement="end" size="3xl"'), { width: 360, height: 640 });
    const r = await panelRect(page);
    const offset = (await page.evaluate(`parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ss-drawer-viewport-offset'))`)) as number;
    expect(offset).toBeGreaterThan(0);
    expect(r.width).toBe(360 - offset);
  });

  it('a bottom sheet rounds only its top corners', async () => {
    const page = await setup(DRAWER('open placement="bottom"'));
    const radii = (await page.evaluate(
      `(() => { const s = getComputedStyle(document.querySelector('.ss-drawer__panel')); return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius, s.borderBottomRightRadius]; })()`,
    )) as string[];
    expect(radii[0]).not.toBe('0px');
    expect(radii[1]).not.toBe('0px');
    expect(radii[2]).toBe('0px');
    expect(radii[3]).toBe('0px');
  });

  it('leaves no transform on the open panel', async () => {
    const page = await setup(DRAWER('open placement="start"'));
    expect(await page.evaluate(`(() => { const s = getComputedStyle(document.querySelector('.ss-drawer__panel')); return [s.transform, s.translate]; })()`)).toEqual([
      'none',
      'none',
    ]);
  });
});
