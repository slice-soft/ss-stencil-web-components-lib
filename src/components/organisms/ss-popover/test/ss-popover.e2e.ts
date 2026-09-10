import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const POPOVER = `
  <button id="before">Before</button>
  <ss-popover heading="Filters">
    <ss-button slot="trigger" label="Filters"></ss-button>
    <ss-input x-id="query" placeholder="Search"></ss-input>
    <ss-button label="Apply"></ss-button>
  </ss-popover>
  <button id="after">After</button>
`;

async function setup(html = POPOVER) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

async function pressTrigger(page: E2EPage) {
  await (await page.find('ss-popover ss-button[slot="trigger"] >>> button')).click();
  await page.waitForChanges();
}

/** What really has focus, looking past shadow hosts. */
function focused(page: E2EPage) {
  return page.evaluate(() => {
    let active = document.activeElement as HTMLElement | null;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement;
    return { tag: active?.tagName ?? null, id: active?.id ?? null, label: active?.getAttribute('aria-label') ?? null };
  });
}

function rect(page: E2EPage, selector: string) {
  return page.evaluate(sel => {
    const r = document.querySelector(sel)!.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  }, selector);
}

describe('ss-popover focus', () => {
  it('moves focus into the panel when it opens', async () => {
    const page = await setup();
    await pressTrigger(page);

    expect((await focused(page)).tag).toBe('INPUT');
  });

  it('closes on Escape and hands focus back to the trigger', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
    expect(await focused(page)).toEqual({ tag: 'BUTTON', id: '', label: 'Filters' });
  });

  it('stays open while focus moves around inside it', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.keyboard.press('Tab');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).toHaveAttribute('open');
    expect((await focused(page)).label).toBe('Apply');
  });

  it('closes when Tab takes focus out of it, leaving focus where it went', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
    expect((await focused(page)).id).toBe('after');
  });

  it('closes on a press elsewhere, leaving focus on what was pressed', async () => {
    const page = await setup();
    await pressTrigger(page);

    await page.click('#after');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
    expect((await focused(page)).id).toBe('after');
  });

  it('closes when its own trigger is pressed again', async () => {
    const page = await setup();
    await pressTrigger(page);
    await pressTrigger(page);

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
  });
});

describe('ss-popover semantics', () => {
  it('announces the trigger as expanded, and what it opens', async () => {
    const page = await setup();
    await pressTrigger(page);

    const trigger = await axNodeNamed(page, 'button', 'Filters', node => node.expanded === true);
    expect(trigger).toMatchObject({ expanded: true, haspopup: 'dialog' });
  });

  it('exposes the panel as a dialog named by its heading', async () => {
    const page = await setup();
    await pressTrigger(page);

    expect((await axNodeByRole(page, 'dialog')).name).toBe('Filters');
  });
});

describe('ss-popover placement', () => {
  it('sits below its trigger, clear of it', async () => {
    const page = await setup();
    await pressTrigger(page);

    const trigger = await rect(page, 'ss-popover .ss-popover__trigger');
    const panel = await rect(page, 'ss-popover .ss-popover__panel');

    expect(panel.top - trigger.bottom).toBe(8);
  });

  it('follows its trigger when the trigger changes size while open', async () => {
    // Placed only on open and on scroll, the panel was left pointing at where
    // the trigger used to end.
    const page = await setup();
    await pressTrigger(page);
    const before = await rect(page, 'ss-popover .ss-popover__trigger');

    await page.evaluate(() => ((document.querySelector('ss-popover ss-button[slot="trigger"]') as HTMLElement & { inlineStyles: string }).inlineStyles = 'padding: 24px'));

    // The observer reports on the browser's next rendering step, not on
    // Stencil's, so this waits for it rather than for a render.
    let trigger = before;
    let gap = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      await page.waitForChanges();
      trigger = await rect(page, 'ss-popover .ss-popover__trigger');
      gap = (await rect(page, 'ss-popover .ss-popover__panel')).top - trigger.bottom;
      if (trigger.bottom > before.bottom && gap === 8) break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }

    expect(trigger.bottom).toBeGreaterThan(before.bottom);
    expect(gap).toBe(8);
  });

  it('opens above the trigger when there is no room below', async () => {
    const page = await setup(`<div style="position: fixed; bottom: 0; left: 200px">${POPOVER}</div>`);
    await pressTrigger(page);

    const trigger = await rect(page, 'ss-popover .ss-popover__trigger');
    const panel = await rect(page, 'ss-popover .ss-popover__panel');

    expect(panel.bottom).toBeLessThanOrEqual(trigger.top);
  });

  it('lines up with the start of the trigger when asked to', async () => {
    const page = await setup(`<div style="padding-left: 300px">${POPOVER.replace('<ss-popover', '<ss-popover align="start"')}</div>`);
    await pressTrigger(page);

    const trigger = await rect(page, 'ss-popover .ss-popover__trigger');
    const panel = await rect(page, 'ss-popover .ss-popover__panel');

    expect(panel.left).toBe(trigger.left);
  });
});

describe('ss-popover inside a modal', () => {
  const IN_MODAL = `
    <ss-modal heading="Settings" open>
      <ss-typography id="modal-text">Modal body</ss-typography>
      <ss-popover heading="Help">
        <ss-button slot="trigger" label="Help"></ss-button>
        <ss-button label="Got it"></ss-button>
      </ss-popover>
    </ss-modal>
  `;

  it('is placed against its trigger, not offset by the dialog', async () => {
    // The dialog used to be centred with a transform, which makes it the
    // containing block for fixed descendants: the panel measured against the
    // viewport and was then placed against the dialog.
    const page = await setup(IN_MODAL);
    await pressTrigger(page);

    const trigger = await rect(page, 'ss-popover .ss-popover__trigger');
    const panel = await rect(page, 'ss-popover .ss-popover__panel');

    expect(panel.top - trigger.bottom).toBe(8);
  });

  it('takes Escape for itself and leaves the modal open', async () => {
    const page = await setup(IN_MODAL);
    await pressTrigger(page);

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
    expect(await page.find('ss-modal')).toHaveAttribute('open');

    // A second Escape is the modal's.
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(await page.find('ss-modal')).not.toHaveAttribute('open');
  });

  it('closes on a press elsewhere in the modal without closing the modal', async () => {
    const page = await setup(IN_MODAL);
    await pressTrigger(page);

    await page.click('#modal-text');
    await page.waitForChanges();

    expect(await page.find('ss-popover')).not.toHaveAttribute('open');
    expect(await page.find('ss-modal')).toHaveAttribute('open');
  });
});
