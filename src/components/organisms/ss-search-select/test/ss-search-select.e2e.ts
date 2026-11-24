import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const COUNTRIES = `
  <ss-option value="co">Colombia</ss-option>
  <ss-option value="cl" disabled>Chile</ss-option>
  <ss-option value="cr">Costa Rica</ss-option>
  <ss-option value="pe">Perú</ss-option>
`;

const SELECT = (attrs = '', options = COUNTRIES) => `<ss-search-select accessibility-label="Country" ${attrs}>${options}</ss-search-select>`;

async function setup(html: string) {
  const page = await newTestPage();
  // Without a charset the page reads the markup as Latin-1, and "Perú" arrives as "PerÃº".
  await page.setContent('<meta charset="utf-8">' + html);
  await useTokens(page);
  return page;
}

async function press(page: E2EPage, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key as Parameters<E2EPage['keyboard']['press']>[0]);
  await page.waitForChanges();
}

async function typeIn(page: E2EPage, text: string, selector = 'ss-search-select') {
  await page.focus(selector);
  await page.keyboard.type(text);
  await page.waitForChanges();
}

/** Labels of the options the list shows now, in order. */
const shown = (page: E2EPage, selector = 'ss-search-select') =>
  page.evaluate(`(() => {
    const root = document.querySelector(${JSON.stringify(selector)}).shadowRoot;
    const list = root.querySelector('[role=listbox]');
    if (!list || list.closest('[hidden]')) return [];
    return [...list.querySelectorAll('[role=option]')].map(o => o.textContent.trim());
  })()`) as Promise<string[]>;

/** What the field shows. */
const fieldText = (page: E2EPage, selector = 'ss-search-select') =>
  page.evaluate(`document.querySelector(${JSON.stringify(selector)}).shadowRoot.querySelector('input').value`) as Promise<string>;

const active = (page: E2EPage) =>
  page.evaluate(`(() => {
    const root = document.querySelector('ss-search-select').shadowRoot;
    const id = root.querySelector('input').getAttribute('aria-activedescendant');
    return id ? root.getElementById(id)?.textContent.trim() ?? null : null;
  })()`) as Promise<string | null>;

describe('ss-search-select, one value', () => {
  it('is a combobox named by its label that opens a listbox', async () => {
    const page = await setup(SELECT());
    const closed = await axNodeByRole(page, 'combobox');
    expect(closed.name).toBe('Country');
    expect(closed.expanded).toBe(false);
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    expect((await axNodeByRole(page, 'combobox', node => node.expanded === true)).expanded).toBe(true);
    expect(await axNodeByRole(page, 'listbox', () => true)).not.toBeNull();
    expect(await shown(page)).toEqual(['Colombia', 'Chile', 'Costa Rica', 'Perú']);
  });

  it('typing filters ignoring case and accents', async () => {
    const page = await setup(SELECT());
    await typeIn(page, 'PERU');
    expect(await shown(page)).toEqual(['Perú']);
  });

  it('typing fires ssSearch with each query; picking does not', async () => {
    const page = await setup(SELECT());
    const search = await page.spyOnEvent('ssSearch');
    await typeIn(page, 'pe');
    await press(page, 'ArrowDown', 'Enter');
    expect(search.events.map(e => e.detail.query)).toEqual(['p', 'pe']);
  });

  it('arrows skip disabled options and Enter selects', async () => {
    const page = await setup('<form>' + SELECT('name="country"') + '</form>');
    const change = await page.spyOnEvent('ssChange');
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    expect(await active(page)).toBe('Colombia');
    await press(page, 'ArrowDown');
    expect(await active(page)).toBe('Costa Rica');
    await press(page, 'Enter');
    expect(change).toHaveReceivedEventDetail({ value: 'cr' });
    expect(await fieldText(page)).toBe('Costa Rica');
    expect(await shown(page)).toEqual([]);
    expect(await page.evaluate(`new FormData(document.querySelector('form')).get('country')`)).toBe('cr');
  });

  it('a press on an option selects it', async () => {
    const page = await setup(SELECT());
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    await page.click('ss-search-select >>> [role=option]:last-child');
    await page.waitForChanges();
    expect(await fieldText(page)).toBe('Perú');
  });

  it('closing without choosing restores the selected label', async () => {
    const page = await setup('<button id="after">x</button>' + SELECT('value="co"'));
    await typeIn(page, 'zz');
    await page.focus('#after');
    await page.waitForChanges();
    expect(await fieldText(page)).toBe('Colombia');
  });

  it('closing with an empty field clears the selection', async () => {
    const page = await setup('<button id="after">x</button>' + SELECT('value="co"'));
    const change = await page.spyOnEvent('ssChange');
    await page.focus('ss-search-select');
    await page.evaluate(`(() => { const i = document.querySelector('ss-search-select').shadowRoot.querySelector('input'); i.select(); })()`);
    await press(page, 'Backspace');
    await page.focus('#after');
    await page.waitForChanges();
    expect(change).toHaveReceivedEventDetail({ value: '' });
    expect(await page.$eval('ss-search-select', el => (el as HTMLSsSearchSelectElement).value)).toBe('');
  });

  it('Escape closes, a second Escape clears the typed text', async () => {
    const page = await setup(SELECT());
    await typeIn(page, 'co');
    await press(page, 'Escape');
    expect(await shown(page)).toEqual([]);
    expect(await fieldText(page)).toBe('co');
    await press(page, 'Escape');
    expect(await fieldText(page)).toBe('');
  });

  it('Tab closes and moves on', async () => {
    const page = await setup(SELECT() + '<button id="after">x</button>');
    await typeIn(page, 'co');
    await press(page, 'Tab');
    expect(await shown(page)).toEqual([]);
    expect(await page.evaluate('document.activeElement.id')).toBe('after');
  });

  it('a press outside closes', async () => {
    const page = await setup(SELECT() + '<p id="outside" style="margin-top:400px">outside</p>');
    await typeIn(page, 'co');
    await page.click('#outside');
    await page.waitForChanges();
    expect(await shown(page)).toEqual([]);
  });

  it('reopening shows every option, not only the selected one', async () => {
    const page = await setup(SELECT('value="pe"'));
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    expect(await shown(page)).toEqual(['Colombia', 'Chile', 'Costa Rica', 'Perú']);
  });

  it('filter="none" shows the options exactly as given', async () => {
    const page = await setup(SELECT('filter="none"', ''));
    await page.$eval(
      'ss-search-select',
      el =>
        ((el as HTMLSsSearchSelectElement).options = [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]),
    );
    await typeIn(page, 'zzz');
    expect(await shown(page)).toEqual(['Alpha', 'Beta']);
  });

  it('the options property wins over children', async () => {
    const page = await setup(SELECT());
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = [{ value: 'x', label: 'Xanadu' }]));
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    expect(await shown(page)).toEqual(['Xanadu']);
  });

  it('a child option added later appears', async () => {
    const page = await setup(SELECT());
    await page.evaluate(`document.querySelector('ss-search-select').insertAdjacentHTML('beforeend', '<ss-option value="ec">Ecuador</ss-option>')`);
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    expect(await shown(page)).toContain('Ecuador');
  });

  it('loading shows the loading text and announces it', async () => {
    const page = await setup(SELECT('loading loading-label="Buscando…"', ''));
    await typeIn(page, 'co');
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.querySelector('[role=status]').textContent`)).toBe('Buscando…');
    expect(await axNodeNamed(page, 'listbox', 'Country')).not.toBeNull();
  });

  it('no matches shows the empty text', async () => {
    const page = await setup(SELECT('empty-label="Sin resultados"'));
    await typeIn(page, 'zzz');
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.querySelector('[role=status]').textContent`)).toBe('Sin resultados');
    expect(await page.evaluate(`document.querySelector('ss-search-select').shadowRoot.querySelector('.ss-search-select__status').textContent.trim()`)).toBe('Sin resultados');
  });

  it('replacing options while open keeps a valid active option', async () => {
    const page = await setup(SELECT());
    await page.focus('ss-search-select');
    await press(page, 'ArrowUp');
    expect(await active(page)).toBe('Perú');
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = [{ value: 'a', label: 'Alpha' }]));
    await page.waitForChanges();
    expect(await active(page)).toBe('Alpha');
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = []));
    await page.waitForChanges();
    expect(await active(page)).toBeNull();
    const change = await page.spyOnEvent('ssChange');
    await press(page, 'Enter');
    expect(change).not.toHaveReceivedEvent();
  });

  it('a value set before its option arrives shows the value, then the label', async () => {
    const page = await setup(SELECT('value="ar" filter="none"', ''));
    expect(await fieldText(page)).toBe('ar');
    await page.$eval('ss-search-select', el => ((el as HTMLSsSearchSelectElement).options = [{ value: 'ar', label: 'Argentina' }]));
    await page.waitForChanges();
    expect(await fieldText(page)).toBe('Argentina');
  });

  it('Enter while composing text does not select', async () => {
    const page = await setup(SELECT());
    const change = await page.spyOnEvent('ssChange');
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown');
    await page.evaluate(
      `document.querySelector('ss-search-select').shadowRoot.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, composed: true }))`,
    );
    await page.waitForChanges();
    expect(change).not.toHaveReceivedEvent();
  });

  it('clearable empties the text and the selection and keeps focus', async () => {
    const page = await setup(SELECT('value="co" clearable'));
    const change = await page.spyOnEvent('ssChange');
    await page.click('ss-search-select >>> .ss-search-select__clear');
    await page.waitForChanges();
    expect(await fieldText(page)).toBe('');
    expect(change).toHaveReceivedEventDetail({ value: '' });
    expect(await page.evaluate('document.activeElement.tagName')).toBe('SS-SEARCH-SELECT');
  });

  it('required blocks an empty form, and reset restores the first value', async () => {
    const page = await setup('<form>' + SELECT('name="c" required') + '</form><form id="f2">' + SELECT('name="d" value="pe"') + '</form>');
    expect(await page.evaluate(`document.querySelector('form').checkValidity()`)).toBe(false);
    await page.$eval('#f2 ss-search-select', el => ((el as HTMLSsSearchSelectElement).value = 'co'));
    await page.waitForChanges();
    await page.evaluate(`document.getElementById('f2').reset()`);
    await page.waitForChanges();
    expect(await page.evaluate(`new FormData(document.getElementById('f2')).get('d')`)).toBe('pe');
    expect(await fieldText(page, '#f2 ss-search-select')).toBe('Perú');
  });

  it('ssOpenChange reports opening and closing', async () => {
    const page = await setup(SELECT());
    const open = await page.spyOnEvent('ssOpenChange');
    await page.focus('ss-search-select');
    await press(page, 'ArrowDown', 'Escape');
    expect(open.events.map(e => e.detail.open)).toEqual([true, false]);
  });
});
