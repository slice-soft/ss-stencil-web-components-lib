import type { E2EPage } from '@stencil/core/testing';
import { axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const OPTIONS = `
  <ss-option value="co">Colombia</ss-option>
  <ss-option value="cr">Costa Rica</ss-option>
  <ss-option value="pe">Perú</ss-option>
`;

const SELECT = (attrs = '', options = OPTIONS) => `<ss-search-select multiple accessibility-label="Countries" name="c" ${attrs}>${options}</ss-search-select>`;

async function setup(html: string) {
  const page = await newTestPage();
  await page.setContent('<meta charset="utf-8"><form>' + html + '</form>');
  await useTokens(page);
  return page;
}

async function press(page: E2EPage, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key as Parameters<E2EPage['keyboard']['press']>[0]);
  await page.waitForChanges();
}

const chips = (page: E2EPage) =>
  page.evaluate(`[...document.querySelector('ss-search-select').shadowRoot.querySelectorAll('.ss-search-select__chip-label')].map(c => c.textContent.trim())`) as Promise<string[]>;

const isOpen = (page: E2EPage) => page.evaluate(`!document.querySelector('ss-search-select').shadowRoot.querySelector('.ss-search-select__popup').hidden`) as Promise<boolean>;

const value = (page: E2EPage) => page.$eval('ss-search-select', el => (el as HTMLSsSearchSelectElement).value);

describe('ss-search-select multiple', () => {
  it('picking adds a chip and keeps the list open', async () => {
    const page = await setup(SELECT());
    const change = await page.spyOnEvent('ssChange');
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown', 'Enter', 'ArrowDown', 'Enter');
    expect(await chips(page)).toEqual(['Colombia', 'Costa Rica']);
    expect(await value(page)).toEqual(['co', 'cr']);
    expect(change).toHaveReceivedEventDetail({ value: ['co', 'cr'] });
    expect(await isOpen(page)).toBe(true);
    expect((await axNodeNamed(page, 'option', 'Colombia'))?.selected).toBe(true);
  });

  it('picking a picked option removes it', async () => {
    const page = await setup(SELECT());
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown', 'Enter', 'Enter');
    expect(await value(page)).toEqual([]);
  });

  it('Backspace in an empty field removes the last chip', async () => {
    const page = await setup(SELECT());
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = ['co', 'pe']));
    await page.focus('ss-search-select');
    await press(page, 'Backspace');
    expect(await chips(page)).toEqual(['Colombia']);
  });

  it("a chip's remove button is named and removes it", async () => {
    const page = await setup(SELECT());
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = ['co', 'pe']));
    await page.waitForChanges();
    expect(await axNodeNamed(page, 'button', 'Remove Perú')).not.toBeNull();
    await page.evaluate(`[...document.querySelector('ss-search-select').shadowRoot.querySelectorAll('.ss-search-select__chip-remove')].pop().click()`);
    await page.waitForChanges();
    expect(await chips(page)).toEqual(['Colombia']);
  });

  it('selected children start the selection, without JavaScript', async () => {
    const page = await setup(
      SELECT('', '<ss-option value="co" selected>Colombia</ss-option><ss-option value="cr">Costa Rica</ss-option><ss-option value="pe" selected>Perú</ss-option>'),
    );
    expect(await value(page)).toEqual(['co', 'pe']);
    expect(await chips(page)).toEqual(['Colombia', 'Perú']);
  });

  it('focusing the component focuses the field, not a chip', async () => {
    const page = await setup(SELECT());
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = ['co']));
    await page.waitForChanges();
    await page.focus('ss-search-select');
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.activeElement?.tagName`)).toBe('INPUT');
  });

  it('the form submits one entry per value', async () => {
    const page = await setup(SELECT());
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = ['co', 'pe']));
    await page.waitForChanges();
    expect(await page.evaluate(`new FormData(document.querySelector('form')).getAll('c')`)).toEqual(['co', 'pe']);
  });

  it('chips keep their labels when options are replaced by search results', async () => {
    const page = await setup(SELECT('filter="none"', ''));
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = [{ value: 'co', label: 'Colombia' }]));
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown', 'Enter');
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = [{ value: 'pe', label: 'Perú' }]));
    await page.waitForChanges();
    expect(await chips(page)).toEqual(['Colombia']);
  });

  it('the text empties after a pick and fires no ssSearch', async () => {
    const page = await setup(SELECT());
    await page.focus('ss-search-select');
    await page.keyboard.type('co');
    await page.waitForChanges();
    const search = await page.spyOnEvent('ssSearch');
    await press(page, 'ArrowDown', 'Enter');
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.querySelector('input').value`)).toBe('');
    expect(search).not.toHaveReceivedEvent();
  });

  it('remove-label translates the chip remove name', async () => {
    const page = await setup(SELECT('remove-label="Quitar"'));
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = ['co']));
    await page.waitForChanges();
    expect(await axNodeNamed(page, 'button', 'Quitar Colombia')).not.toBeNull();
  });
});
