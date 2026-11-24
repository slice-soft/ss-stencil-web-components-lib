import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from '../../../../test/utils';

async function setup(html: string) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

type Box = { left: number; right: number; top: number; bottom: number };

/** Boxes of the inner input, its content box edges, and a slotted element. */
function measure(page: E2EPage, slotted: string) {
  return page.evaluate(`(() => {
    const host = document.querySelector('ss-input');
    const input = host.shadowRoot.querySelector('input');
    const box = el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
    const s = getComputedStyle(input);
    const b = box(input);
    const content = {
      left: b.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft),
      right: b.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight),
      top: b.top, bottom: b.bottom,
    };
    return { input: b, content, slotted: box(document.querySelector(${JSON.stringify(slotted)})) };
  })()`) as Promise<{ input: Box; content: Box; slotted: Box }>;
}

const padding = (page: E2EPage, side: 'Left' | 'Right') =>
  page.evaluate(`parseFloat(getComputedStyle(document.querySelector('ss-input').shadowRoot.querySelector('input')).padding${side})`) as Promise<number>;

describe('ss-input start and end slots', () => {
  it('an icon sits inside the field and the text starts after it', async () => {
    const page = await setup('<ss-input></ss-input>');
    const bare = await padding(page, 'Left');
    await page.evaluate(
      `document.querySelector('ss-input').insertAdjacentHTML('beforeend', '<span id="icon" slot="start" style="display:inline-block;width:16px;height:16px">i</span>')`,
    );
    await page.waitForChanges();
    await page.waitForFunction(`parseFloat(getComputedStyle(document.querySelector('ss-input').shadowRoot.querySelector('input')).paddingLeft) > ${bare} + 16`);
    const { input, content, slotted } = await measure(page, '#icon');
    expect(slotted.left).toBeGreaterThanOrEqual(input.left);
    expect(slotted.right).toBeLessThanOrEqual(content.left);
    expect(slotted.top).toBeGreaterThanOrEqual(input.top);
    expect(slotted.bottom).toBeLessThanOrEqual(input.bottom);
  });

  it('text wider than an icon never overlaps what is typed', async () => {
    const page = await setup('<ss-input value="name"><span id="domain" slot="end">@example.com</span></ss-input>');
    await page.waitForChanges();
    const { input, content, slotted } = await measure(page, '#domain');
    expect(slotted.left).toBeGreaterThanOrEqual(content.right);
    expect(slotted.right).toBeLessThanOrEqual(input.right);
  });

  it('the slot follows its content size', async () => {
    const page = await setup('<ss-input><span id="unit" slot="end">kg</span></ss-input>');
    await page.waitForChanges();
    const before = await padding(page, 'Right');
    await page.evaluate(`document.querySelector('#unit').textContent = 'kilograms'`);
    await page.waitForFunction(`parseFloat(getComputedStyle(document.querySelector('ss-input').shadowRoot.querySelector('input')).paddingRight) > ${before}`);
    const { content, slotted } = await measure(page, '#unit');
    expect(slotted.left).toBeGreaterThanOrEqual(content.right);
  });

  it('a press on the icon focuses the input', async () => {
    const page = await setup('<ss-input><span id="icon" slot="start" style="display:inline-block;width:16px;height:16px">i</span></ss-input>');
    await page.waitForChanges();
    const { slotted } = await measure(page, '#icon');
    await page.mouse.click(slotted.left + 8, slotted.top + 8);
    expect(await page.evaluate(`document.activeElement?.tagName`)).toBe('SS-INPUT');
  });

  it('without slotted content the padding is unchanged', async () => {
    const page = await setup('<ss-input id="a"></ss-input>');
    expect(await padding(page, 'Left')).toBe(await padding(page, 'Right'));
  });
});
