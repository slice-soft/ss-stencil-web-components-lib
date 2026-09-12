import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const MENU = `
  <button id="before">Before</button>
  <ss-dropdown>
    <ss-button slot="trigger" label="Actions"></ss-button>
    <ss-dropdown-item value="edit">Edit</ss-dropdown-item>
    <ss-dropdown-item value="duplicate">Duplicate</ss-dropdown-item>
    <ss-dropdown-item value="archive" disabled>Archive</ss-dropdown-item>
    <ss-divider></ss-divider>
    <ss-dropdown-item value="delete" variant="destructive">Delete</ss-dropdown-item>
  </ss-dropdown>
  <button id="after">After</button>
`;

async function setup(html = MENU) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

async function pressTrigger(page: E2EPage) {
  await (await page.find('ss-dropdown ss-button[slot="trigger"] >>> button')).click();
  await page.waitForChanges();
}

/** Puts focus on the trigger the way a keyboard user gets there. */
async function tabToTrigger(page: E2EPage) {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  await page.waitForChanges();
}

async function press(page: E2EPage, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key as Parameters<E2EPage['keyboard']['press']>[0]);
  await page.waitForChanges();
}

/** The value of the focused item, or a description of whatever else has focus. */
function focused(page: E2EPage) {
  return page.evaluate(() => {
    let active = document.activeElement as HTMLElement | null;
    if (active?.localName === 'ss-dropdown-item') return `item:${active.getAttribute('value')}`;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement;
    return active?.id ? `#${active.id}` : `${active?.tagName}:${active?.getAttribute('aria-label')}`;
  });
}

const isOpen = async (page: E2EPage) => (await page.find('ss-dropdown')).getAttribute('open') !== null;

describe('ss-dropdown opening', () => {
  it('opens on a press and puts focus on the first item', async () => {
    const page = await setup();
    await pressTrigger(page);

    expect(await isOpen(page)).toBe(true);
    expect(await focused(page)).toBe('item:edit');
  });

  it('opens on ArrowDown from the trigger, at the first item', async () => {
    const page = await setup();
    await tabToTrigger(page);
    await press(page, 'ArrowDown');

    expect(await focused(page)).toBe('item:edit');
  });

  it('opens on ArrowUp from the trigger, at the last item', async () => {
    const page = await setup();
    await tabToTrigger(page);
    await press(page, 'ArrowUp');

    expect(await focused(page)).toBe('item:delete');
  });

  it('opens on Enter from the trigger', async () => {
    const page = await setup();
    await tabToTrigger(page);
    await press(page, 'Enter');

    expect(await focused(page)).toBe('item:edit');
  });
});

describe('ss-dropdown moving through items', () => {
  it('steps with the arrows, skipping a disabled item and wrapping', async () => {
    const page = await setup();
    await pressTrigger(page);

    await press(page, 'ArrowDown');
    expect(await focused(page)).toBe('item:duplicate');

    await press(page, 'ArrowDown');
    expect(await focused(page)).toBe('item:delete');

    await press(page, 'ArrowDown');
    expect(await focused(page)).toBe('item:edit');

    await press(page, 'ArrowUp');
    expect(await focused(page)).toBe('item:delete');
  });

  it('jumps to the ends with Home and End', async () => {
    const page = await setup();
    await pressTrigger(page);

    await press(page, 'End');
    expect(await focused(page)).toBe('item:delete');

    await press(page, 'Home');
    expect(await focused(page)).toBe('item:edit');
  });

  it('moves to the next item starting with a typed letter', async () => {
    const page = await setup();
    await pressTrigger(page);

    await press(page, 'd');
    expect(await focused(page)).toBe('item:duplicate');

    await press(page, 'd');
    expect(await focused(page)).toBe('item:delete');
  });

  it('lets focus follow the pointer', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.hover('ss-dropdown-item[value="duplicate"]');
    await page.waitForChanges();

    expect(await focused(page)).toBe('item:duplicate');
  });
});

describe('ss-dropdown picking and closing', () => {
  it('picks the focused item with Enter, closes, and returns to the trigger', async () => {
    const page = await setup();
    const selected = await page.spyOnEvent('ssSelect');
    await pressTrigger(page);

    await press(page, 'ArrowDown', 'Enter');

    expect(selected).toHaveReceivedEventDetail({ value: 'duplicate' });
    expect(await isOpen(page)).toBe(false);
    expect(await focused(page)).toBe('BUTTON:Actions');
  });

  it('picks an item with Space', async () => {
    const page = await setup();
    const selected = await page.spyOnEvent('ssSelect');
    await pressTrigger(page);

    await press(page, 'Space');

    expect(selected).toHaveReceivedEventDetail({ value: 'edit' });
  });

  it('picks an item that is clicked', async () => {
    const page = await setup();
    const selected = await page.spyOnEvent('ssSelect');
    await pressTrigger(page);

    await page.click('ss-dropdown-item[value="delete"]');
    await page.waitForChanges();

    expect(selected).toHaveReceivedEventDetail({ value: 'delete' });
    expect(await isOpen(page)).toBe(false);
  });

  it('ignores a click on a disabled item, and stays open', async () => {
    const page = await setup();
    const selected = await page.spyOnEvent('ssSelect');
    await pressTrigger(page);

    await page.click('ss-dropdown-item[value="archive"]');
    await page.waitForChanges();

    expect(selected).toHaveReceivedEventTimes(0);
    expect(await isOpen(page)).toBe(true);
  });

  it('closes on Escape and returns to the trigger without picking', async () => {
    const page = await setup();
    const selected = await page.spyOnEvent('ssSelect');
    await pressTrigger(page);

    await press(page, 'Escape');

    expect(await isOpen(page)).toBe(false);
    expect(selected).toHaveReceivedEventTimes(0);
    expect(await focused(page)).toBe('BUTTON:Actions');
  });

  it('closes on Tab and lets focus move past the menu', async () => {
    const page = await setup();
    await pressTrigger(page);

    await press(page, 'Tab');

    expect(await isOpen(page)).toBe(false);
    expect(await focused(page)).toBe('#after');
  });

  it('closes on a press elsewhere', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.click('#after');
    await page.waitForChanges();

    expect(await isOpen(page)).toBe(false);
    expect(await focused(page)).toBe('#after');
  });
});

describe('ss-dropdown semantics', () => {
  it('announces the trigger as a menu button, expanded while open', async () => {
    const page = await setup();
    await pressTrigger(page);

    const trigger = await axNodeNamed(page, 'button', 'Actions', node => node.expanded === true);
    expect(trigger).toMatchObject({ expanded: true, haspopup: 'menu' });
  });

  it('exposes a menu named after its trigger, holding menu items', async () => {
    const page = await setup();
    await pressTrigger(page);

    expect((await axNodeByRole(page, 'menu')).name).toBe('Actions');
    expect((await axNodeByRole(page, 'menuitem')).name).toBe('Edit');
  });
});

describe('ss-dropdown placement', () => {
  it('hangs from the start of its trigger, just below it', async () => {
    const page = await setup(`<div style="padding: 40px 300px">${MENU}</div>`);
    await pressTrigger(page);

    const [trigger, menu] = await page.evaluate(() =>
      ['.ss-dropdown__trigger', '.ss-dropdown__menu'].map(sel => {
        const r = document.querySelector(sel)!.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      }),
    );

    expect(menu.top - trigger.bottom).toBe(4);
    expect(menu.left).toBe(trigger.left);
  });
});

describe('ss-dropdown inside a modal', () => {
  it('takes Escape for itself and leaves the modal open', async () => {
    const page = await setup(`<ss-modal heading="Settings" open>${MENU}</ss-modal>`);
    await pressTrigger(page);

    await press(page, 'Escape');

    expect(await isOpen(page)).toBe(false);
    expect(await page.find('ss-modal')).toHaveAttribute('open');
  });
});
