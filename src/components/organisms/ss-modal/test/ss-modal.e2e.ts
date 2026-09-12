import { newTestPage, useTokens } from '../../../../test/utils';

const MODAL = `
  <button id="before">Before</button>
  <ss-modal heading="Delete file" open>
    <p>This cannot be undone.</p>
    <ss-button slot="footer" label="Cancel" x-style="ghost"></ss-button>
    <ss-button slot="footer" label="Delete" variant="destructive"></ss-button>
  </ss-modal>
  <button id="after">After</button>
`;

describe('ss-modal focus', () => {
  it('moves focus into the dialog when it opens', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    const inside = await page.evaluate(() => {
      const dialog = document.querySelector('.ss-modal__dialog')!;
      let active: Element | null = document.activeElement;
      while ((active as HTMLElement)?.shadowRoot?.activeElement) active = (active as HTMLElement).shadowRoot!.activeElement;
      return dialog.contains(active) || dialog === active;
    });
    expect(inside).toBe(true);
  });

  it('keeps Tab inside, wrapping from the last control to the first', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    // Walk well past the number of controls the dialog holds.
    for (let step = 0; step < 8; step++) {
      await page.keyboard.press('Tab');
      await page.waitForChanges();

      const escaped = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement;
        return active?.id === 'before' || active?.id === 'after';
      });
      expect(escaped).toBe(false);
    }
  });

  it('keeps Shift+Tab inside as well', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    for (let step = 0; step < 8; step++) {
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      await page.waitForChanges();

      const escaped = await page.evaluate(() => ['before', 'after'].includes((document.activeElement as HTMLElement)?.id));
      expect(escaped).toBe(false);
    }
  });

  it('hands focus back to what had it before', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL.replace('<ss-modal heading="Delete file" open>', '<ss-modal heading="Delete file">'));
    await page.waitForChanges();

    await (await page.find('#before')).focus();
    await page.evaluate(() => ((document.querySelector('ss-modal') as HTMLElement as any).open = true));
    await page.waitForChanges();

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    // The reader was sent back to where they were, not to the top of the page.
    expect(await page.evaluate(() => (document.activeElement as HTMLElement)?.id)).toBe('before');
  });
});

describe('ss-modal dismissal', () => {
  it('closes on Escape and reports it', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    const changed = await page.spyOnEvent('ssOpenChange');
    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-modal')).not.toHaveAttribute('open');
    expect(changed.lastEvent.detail.open).toBe(false);
  });

  it('closes when the backdrop is pressed', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    await page.evaluate(() => (document.querySelector('.ss-modal__backdrop') as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true })));
    await page.waitForChanges();

    expect(await page.find('ss-modal')).not.toHaveAttribute('open');
  });

  it('stays open when the press was inside, even on a control in a shadow root', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    // `event.target` is retargeted to the host here, so a naive check would
    // read this as a press on the page and close the dialog.
    await page.evaluate(() => {
      const inner = (document.querySelector('ss-button') as HTMLElement).shadowRoot!.querySelector('button')!;
      inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    });
    await page.waitForChanges();

    expect(await page.find('ss-modal')).toHaveAttribute('open');
  });

  it('obeys a dialog that refuses to be dismissed that way', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL.replace('open>', 'open close-on-escape="false" close-on-backdrop="false">'));
    await page.waitForChanges();

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.find('ss-modal')).toHaveAttribute('open');
  });

  it('closes from its own close button', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    await (await page.find('ss-modal .ss-modal__dismiss')).click();
    await page.waitForChanges();

    expect(await page.find('ss-modal')).not.toHaveAttribute('open');
  });
});

describe('ss-modal semantics', () => {
  it('is a modal dialog named by its heading', async () => {
    const page = await newTestPage();
    await page.setContent(MODAL);
    await page.waitForChanges();

    const dialog = await page.find('ss-modal .ss-modal__dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const named = await page.evaluate(() => {
      const el = document.querySelector('.ss-modal__dialog')!;
      const id = el.getAttribute('aria-labelledby');
      return document.getElementById(id ?? '')?.textContent?.trim();
    });
    expect(named).toBe('Delete file');
  });

  it('stops the page behind it from scrolling, and lets it again after', async () => {
    const page = await newTestPage();
    await page.setContent(`<div style="height: 3000px"></div>${MODAL}`);
    await page.waitForChanges();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });
});

describe('ss-modal opened after load', () => {
  const CLOSED = MODAL.replace('<ss-modal heading="Delete file" open>', '<ss-modal heading="Delete file">');

  it('moves focus in when it is opened after the page has loaded', async () => {
    const page = await newTestPage();
    await page.setContent(CLOSED);
    await page.waitForChanges();

    await page.evaluate(() => ((document.querySelector('ss-modal') as HTMLElement as any).open = true));
    await page.waitForChanges();

    const inside = await page.evaluate(() => {
      const dialog = document.querySelector('.ss-modal__dialog')!;
      let active: Element | null = document.activeElement;
      while ((active as HTMLElement)?.shadowRoot?.activeElement) active = (active as HTMLElement).shadowRoot!.activeElement;
      return dialog.contains(active) || dialog === active;
    });
    expect(inside).toBe(true);
  });

  it('hands focus back to an ss-button that opened it', async () => {
    // `document.activeElement` stops at the button's host, and focusing a host
    // moves focus nowhere, so the reader used to be dropped on the page.
    const page = await newTestPage();
    await page.setContent(`<ss-button id="opener" label="Open"></ss-button>${CLOSED}`);
    await page.waitForChanges();

    await (await page.find('#opener >>> button')).focus();
    await page.evaluate(() => ((document.querySelector('ss-modal') as HTMLElement as any).open = true));
    await page.waitForChanges();

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    const back = await page.evaluate(() => {
      const host = document.activeElement as HTMLElement;
      return host?.id === 'opener' && host.shadowRoot?.activeElement?.tagName === 'BUTTON';
    });
    expect(back).toBe(true);
  });
});

describe('ss-modal layout', () => {
  it('is as wide as its size asks for, and centred', async () => {
    const page = await newTestPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(MODAL);
    await useTokens(page);

    const box = await page.evaluate(() => {
      const r = document.querySelector('.ss-modal__dialog')!.getBoundingClientRect();
      return { width: r.width, left: r.left, top: r.top, bottom: r.bottom };
    });

    // md is four steps of the 128px dimension; it used to be one.
    expect(box.width).toBe(512);
    expect(box.left).toBe((1200 - 512) / 2);
    expect(Math.abs(box.top - (800 - box.bottom))).toBeLessThanOrEqual(1);
  });
});
