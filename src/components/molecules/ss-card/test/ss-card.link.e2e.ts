import type { E2EPage } from '@stencil/core/testing';
import { axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const CARD = (attrs = 'href="#product"', header = '<span slot="header">Zapatos rojos</span>') =>
  `<ss-card ${attrs}>
    <div slot="media" id="media" style="height:80px">img</div>
    ${header}
    <p id="body">Cuero, talla 42</p>
    <ss-button slot="footer" id="save" label="Guardar"></ss-button>
  </ss-card>`;

async function setup(html: string) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

async function pressAt(page: E2EPage, selector: string, modifier?: 'Control') {
  const box = (await page.evaluate(
    `(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.left + 4, y: r.top + 4 }; })()`,
  )) as { x: number; y: number };
  if (modifier) await page.keyboard.down(modifier);
  await page.mouse.click(box.x, box.y);
  if (modifier) await page.keyboard.up(modifier);
  await page.waitForChanges();
}

/** Stops navigation so a press can be observed without leaving the page. */
const PREVENT = `document.addEventListener('ssNavigate', e => e.preventDefault())`;

describe('ss-card as a link', () => {
  it('is one link named by its header', async () => {
    const page = await setup(CARD());
    expect(await axNodeNamed(page, 'link', 'Zapatos rojos')).not.toBeNull();
  });

  it('accessibility-label names it over the header', async () => {
    const page = await setup(CARD('href="#product" accessibility-label="Ver zapatos rojos"'));
    expect(await axNodeNamed(page, 'link', 'Ver zapatos rojos')).not.toBeNull();
  });

  it('with no header, the content names it', async () => {
    const page = await setup(CARD('href="#product"', ''));
    expect(await axNodeNamed(page, 'link', 'Cuero, talla 42')).not.toBeNull();
  });

  it('a press anywhere on the card emits ssNavigate, cancelable', async () => {
    const page = await setup(CARD());
    await page.evaluate(PREVENT);
    const navigate = await page.spyOnEvent('ssNavigate');
    await pressAt(page, '#media');
    await pressAt(page, '#body');
    expect(navigate).toHaveReceivedEventTimes(2);
    expect(navigate).toHaveReceivedEventDetail({ href: '#product' });
    expect(await page.evaluate('location.hash')).toBe('');
  });

  it('without preventDefault the browser follows the link', async () => {
    const page = await setup(CARD());
    await pressAt(page, '#body');
    expect(await page.evaluate('location.hash')).toBe('#product');
  });

  it('a footer button does its own thing', async () => {
    const page = await setup(CARD());
    await page.evaluate(PREVENT);
    const navigate = await page.spyOnEvent('ssNavigate');
    await page.evaluate(`window.saved = 0; document.querySelector('#save').addEventListener('click', () => window.saved++)`);
    await pressAt(page, '#save');
    expect(await page.evaluate('window.saved')).toBe(1);
    expect(navigate).not.toHaveReceivedEvent();
  });

  it('a modified press is left to the browser', async () => {
    const page = await setup(CARD());
    await page.evaluate(PREVENT);
    const navigate = await page.spyOnEvent('ssNavigate');
    await pressAt(page, '#body', 'Control');
    expect(navigate).not.toHaveReceivedEvent();
  });

  it('keyboard focus draws a ring on the card', async () => {
    const page = await setup('<button id="before">b</button>' + CARD());
    await page.focus('#before');
    await page.keyboard.press('Tab');
    await page.waitForChanges();
    expect(await page.evaluate(`getComputedStyle(document.querySelector('ss-card').shadowRoot.querySelector('.ss-card')).outlineStyle`)).not.toBe('none');
  });

  it('without href there is no link', async () => {
    const page = await setup(CARD(''));
    expect(await page.evaluate(`document.querySelector('ss-card').shadowRoot.querySelector('a')`)).toBeNull();
  });
});

describe('ss-card link name, edge cases', () => {
  it('bare text content names the link', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-card href="#x">Zapatos rojos</ss-card>');
    expect(await axNodeNamed(page, 'link', 'Zapatos rojos')).not.toBeNull();
  });
});
