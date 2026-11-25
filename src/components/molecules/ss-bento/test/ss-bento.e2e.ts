import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from '../../../../test/utils';

const TILES = (spans: string[]) => spans.map((attrs, i) => `<ss-bento-item id="t${i}" ${attrs}><div style="height:20px">${i}</div></ss-bento-item>`).join('');

async function setup(html: string, width: number): Promise<E2EPage> {
  const page = await newTestPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.setContent(`<meta charset="utf-8"><div id="box" style="width:${width}px">${html}</div>`);
  await useTokens(page);
  await page.waitForChanges();
  await page.waitForChanges();
  return page;
}

type Box = { top: number; left: number; width: number; height: number };
const boxes = (page: E2EPage) =>
  page.evaluate(
    `Array.from(document.querySelectorAll('ss-bento-item')).map(t => { const r = t.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height }; })`,
  ) as Promise<Box[]>;
const perRow = (b: Box[]) => b.filter(x => x.top === b[0].top).length;

describe('ss-bento', () => {
  it('lays tiles on the given columns', async () => {
    // Four tiles of 240px and three 16px gaps need 1008px.
    const page = await setup(`<ss-bento>${TILES(['', '', '', ''])}</ss-bento>`, 1100);
    const b = await boxes(page);
    expect(perRow(b)).toBe(4);
    expect(new Set(b.map(x => x.left)).size).toBe(4);
  });

  it('uses fewer columns when they do not fit', async () => {
    const page = await setup(`<ss-bento>${TILES(['', '', '', ''])}</ss-bento>`, 600);
    expect(perRow(await boxes(page))).toBe(2);
  });

  it('a wide tile never overflows', async () => {
    const page = await setup(`<ss-bento>${TILES(['col-span="3"', ''])}</ss-bento>`, 600);
    const [wide] = await boxes(page);
    expect(wide.width).toBeLessThanOrEqual(600);
    expect(await page.evaluate(`(() => { const g = document.querySelector('ss-bento').shadowRoot.querySelector('.ss-bento'); return g.scrollWidth <= g.clientWidth; })()`)).toBe(
      true,
    );
  });

  it('one column stacks every tile as one cell', async () => {
    const page = await setup(`<ss-bento>${TILES(['row-span="2" col-span="2"', ''])}</ss-bento>`, 200);
    const [a, b] = await boxes(page);
    expect(a.height).toBe(b.height);
    expect(a.width).toBe(b.width);
  });

  it('follows its container, not the viewport', async () => {
    const page = await setup(`<ss-bento>${TILES(['', ''])}</ss-bento>`, 300);
    const [a, b] = await boxes(page);
    expect(b.top).toBeGreaterThan(a.top);
  });

  it('min-item-width changes when columns drop', async () => {
    const page = await setup(`<ss-bento min-item-width="400px">${TILES(['', '', ''])}</ss-bento>`, 1000);
    expect(perRow(await boxes(page))).toBe(2);
  });

  it('columns caps how many it uses', async () => {
    const page = await setup(`<ss-bento columns="3">${TILES(['', '', '', ''])}</ss-bento>`, 1000);
    expect(perRow(await boxes(page))).toBe(3);
  });

  it('follows its container when it resizes', async () => {
    const page = await setup(`<ss-bento>${TILES(['', '', '', ''])}</ss-bento>`, 1100);
    await page.evaluate(`document.getElementById('box').style.width = '600px'`);
    await page.waitForChanges();
    await page.waitForFunction(
      `(() => { const t = Array.from(document.querySelectorAll('ss-bento-item')).map(x => x.getBoundingClientRect().top); return t.filter(y => y === t[0]).length === 2; })()`,
    );
  });

  it('a card inside fills its tile', async () => {
    const page = await setup(`<ss-bento><ss-bento-item row-span="2"><ss-card>Tall</ss-card></ss-bento-item><ss-bento-item>x</ss-bento-item></ss-bento>`, 1000);
    const [tile, card] = (await page.evaluate(
      `[document.querySelector('ss-bento-item'), document.querySelector('ss-card').shadowRoot.querySelector('.ss-card')].map(e => e.getBoundingClientRect().height)`,
    )) as number[];
    expect(tile).toBeGreaterThan(100);
    expect(card).toBe(tile);
  });

  it('dense fills the gaps large tiles leave', async () => {
    // 4 columns: a 1-wide, then a 4-wide that must start a new row, then a
    // 1-wide. Without dense the last follows the wide one; with dense it fills
    // the first row's hole.
    const spans = ['', 'col-span="4"', ''];
    const sparse = await setup(`<ss-bento>${TILES(spans)}</ss-bento>`, 1100);
    const s = await boxes(sparse);
    expect(s[2].top).toBeGreaterThan(s[1].top);

    const dense = await setup(`<ss-bento dense>${TILES(spans)}</ss-bento>`, 1100);
    const d = await boxes(dense);
    expect(d[2].top).toBe(d[0].top);
  });
});
