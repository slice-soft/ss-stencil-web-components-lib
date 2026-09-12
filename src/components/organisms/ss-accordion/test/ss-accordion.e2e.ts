import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const ACCORDION = `
  <button id="before">Before</button>
  <ss-accordion>
    <ss-accordion-item value="shipping" heading="Shipping">Ships in two days.</ss-accordion-item>
    <ss-accordion-item value="returns" heading="Returns" disabled>Thirty days.</ss-accordion-item>
    <ss-accordion-item value="warranty" heading="Warranty">One year.</ss-accordion-item>
    <ss-accordion-item value="support" heading="Support">Email us.</ss-accordion-item>
  </ss-accordion>
`;

async function setup(html = ACCORDION) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

async function press(page: E2EPage, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key as Parameters<E2EPage['keyboard']['press']>[0]);
  await page.waitForChanges();
}

function focusedHeader(page: E2EPage) {
  return page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
}

const openStates = (page: E2EPage) => page.$$eval('ss-accordion-item', items => items.map(item => item.hasAttribute('open')));

describe('ss-accordion from the keyboard', () => {
  it('moves between headers with the arrows, skipping a disabled one and wrapping', async () => {
    const page = await setup();
    await page.focus('#before');
    await press(page, 'Tab');
    expect(await focusedHeader(page)).toBe('Shipping');

    await press(page, 'ArrowDown');
    expect(await focusedHeader(page)).toBe('Warranty');

    await press(page, 'ArrowDown', 'ArrowDown');
    expect(await focusedHeader(page)).toBe('Shipping');

    await press(page, 'ArrowUp');
    expect(await focusedHeader(page)).toBe('Support');
  });

  it('jumps to the first and last header with Home and End', async () => {
    const page = await setup();
    await page.focus('#before');
    await press(page, 'Tab', 'End');
    expect(await focusedHeader(page)).toBe('Support');

    await press(page, 'Home');
    expect(await focusedHeader(page)).toBe('Shipping');
  });

  it('opens a section with Enter and Space, closing the one before', async () => {
    const page = await setup();
    await page.focus('#before');

    await press(page, 'Tab', 'Enter');
    expect(await openStates(page)).toEqual([true, false, false, false]);

    await press(page, 'ArrowDown', 'Space');
    expect(await openStates(page)).toEqual([false, false, true, false]);
  });
});

describe('ss-accordion semantics', () => {
  it('announces each header as a button with its expanded state', async () => {
    const page = await setup(ACCORDION.replace('heading="Warranty"', 'heading="Warranty" open'));

    expect(await axNodeNamed(page, 'button', 'Warranty', node => node.expanded === true)).toMatchObject({ expanded: true });
    expect(await axNodeNamed(page, 'button', 'Shipping', node => node.expanded === false)).toMatchObject({ expanded: false });
  });

  it('names an open section after its header', async () => {
    const page = await setup(ACCORDION.replace('heading="Warranty"', 'heading="Warranty" open'));
    expect((await axNodeByRole(page, 'region')).name).toBe('Warranty');
  });

  it('keeps every header in the outline, collapsed or not', async () => {
    const page = await setup();
    const headings = await page.$$eval('ss-accordion-item h3', nodes => nodes.map(node => node.textContent?.trim()));

    expect(headings).toEqual(['Shipping', 'Returns', 'Warranty', 'Support']);
  });
});
