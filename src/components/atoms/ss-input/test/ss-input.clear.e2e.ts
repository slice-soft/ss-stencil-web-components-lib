import type { E2EPage } from '@stencil/core/testing';
import { axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

async function setup(html: string) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

const clearButton = (page: E2EPage, name = 'Clear') => axNodeNamed(page, 'button', name);

async function typeInto(page: E2EPage, text: string) {
  await page.focus('ss-input');
  await page.keyboard.type(text);
  await page.waitForChanges();
}

describe('ss-input clearable', () => {
  it('the clear button appears only while there is a value', async () => {
    const page = await setup('<ss-input clearable accessibility-label="Search"></ss-input>');
    expect(await clearButton(page)).toBeNull();
    await typeInto(page, 'shoes');
    expect(await clearButton(page)).not.toBeNull();
  });

  it('shows no clear button when disabled or readonly', async () => {
    const page = await setup('<ss-input clearable disabled value="a"></ss-input><ss-input clearable readonly value="b"></ss-input>');
    expect(await clearButton(page)).toBeNull();
  });

  it('shows the clear button for a value given as a prop', async () => {
    const page = await setup('<ss-input clearable value="a"></ss-input>');
    expect(await clearButton(page)).not.toBeNull();
  });

  it('clearing empties the field, emits empty values, updates the form and keeps focus', async () => {
    const page = await setup('<form><ss-input clearable name="q"></ss-input></form>');
    await typeInto(page, 'shoes');
    const input = await page.spyOnEvent('ssInput');
    const change = await page.spyOnEvent('ssChange');
    await page.click('ss-input >>> .ss-input__clear');
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-input').shadowRoot.querySelector('input').value`)).toBe('');
    expect(input).toHaveReceivedEventDetail({ value: '' });
    expect(change).toHaveReceivedEventDetail({ value: '' });
    expect(await page.evaluate(`new FormData(document.querySelector('form')).get('q')`)).toBe('');
    expect(await page.evaluate(`document.activeElement?.tagName`)).toBe('SS-INPUT');
    expect(await clearButton(page)).toBeNull();
  });

  it('the clear button is not a tab stop', async () => {
    const page = await setup('<ss-input clearable value="a"></ss-input><button id="after">After</button>');
    await page.focus('ss-input');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(`document.activeElement?.id`)).toBe('after');
  });

  it('Escape does not clear', async () => {
    const page = await setup('<ss-input clearable></ss-input>');
    await typeInto(page, 'shoes');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(`document.querySelector('ss-input').shadowRoot.querySelector('input').value`)).toBe('shoes');
  });

  it('clear-label names the button', async () => {
    const page = await setup('<ss-input clearable clear-label="Borrar" value="a"></ss-input>');
    expect(await clearButton(page, 'Borrar')).not.toBeNull();
  });

  it('the text never runs under the clear button', async () => {
    const page = await setup('<ss-input clearable value="a"></ss-input>');
    const [contentRight, buttonLeft] = (await page.evaluate(`(() => {
      const root = document.querySelector('ss-input').shadowRoot;
      const input = root.querySelector('input');
      const s = getComputedStyle(input);
      const r = input.getBoundingClientRect();
      return [r.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight), root.querySelector('.ss-input__clear').getBoundingClientRect().left];
    })()`)) as number[];
    expect(buttonLeft).toBeGreaterThanOrEqual(contentRight);
  });

  it('joined into a group, the seam is the same with or without clearable', async () => {
    const page = await setup(
      '<ss-input-group><ss-input id="plain" value="x"></ss-input><span slot="end">.com</span></ss-input-group>' +
        '<ss-input-group><ss-input id="clear" clearable value="x"></ss-input><span slot="end">.com</span></ss-input-group>',
    );
    const radii = (await page.evaluate(`['plain', 'clear'].map(id => {
      const s = getComputedStyle(document.getElementById(id).shadowRoot.querySelector('input'));
      return [s.borderTopRightRadius, s.borderBottomRightRadius, s.borderTopLeftRadius].join(' ');
    })`)) as string[];
    expect(radii[1]).toBe(radii[0]);
  });
});
