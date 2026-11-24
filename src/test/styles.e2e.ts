import type { E2EPage } from '@stencil/core/testing';
import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

/**
 * Visual styles (ss-design-system `data-style`): a style changes how the
 * components inside an element are drawn, and nothing outside it. No prop
 * changes with the style.
 */
const STYLES = ['brutal', 'clay', 'glass', 'maximal', 'minimal'] as const;

const SET = [
  '<ss-button data-case="button" label="Save"></ss-button>',
  '<ss-button data-case="outline" x-style="outline" label="Save"></ss-button>',
  '<ss-button data-case="ghost" x-style="ghost" label="Save"></ss-button>',
  '<ss-input data-case="input" accessibility-label="Name"></ss-input>',
  '<ss-card data-case="card">Body</ss-card>',
  '<ss-card data-case="outlined" x-style="outlined">Body</ss-card>',
  '<ss-popover data-case="popover" open heading="P"><ss-button slot="trigger" label="P"></ss-button><p>Body</p></ss-popover>',
  '<ss-dropdown data-case="dropdown" open><ss-button slot="trigger" label="D"></ss-button><ss-dropdown-item value="a">A</ss-dropdown-item></ss-dropdown>',
].join('');

const PARTS = {
  button: 'button',
  input: 'input',
  card: '.ss-card',
  popover: '.ss-popover__panel',
  dropdown: '.ss-dropdown__menu',
};
// No outline: each open dropdown moves focus into its menu, so which one holds
// it (and draws a focus outline) changes from run to run.
const PROPS = { extra: ['border-left-width', 'backdrop-filter'], skip: ['outline-color', 'outline-style', 'outline-width', 'outline-offset'] };

/** The part each case draws: a button's button, a card's card, … */
const OWN_PART: Record<string, string> = {
  button: 'button',
  outline: 'button',
  ghost: 'button',
  input: 'input',
  card: 'card',
  outlined: 'card',
  popover: 'popover',
  dropdown: 'dropdown',
};

/** Each case's own part, keyed by case (`brutal:card`). */
async function measure(page: E2EPage) {
  const all = await computedParts(page, PARTS, undefined, PROPS);
  return Object.fromEntries(
    Object.entries(all)
      .map(([key, styles]) => [key.split('/'), styles] as const)
      .filter(([[scope, part]]) => OWN_PART[scope.replace(/^.*?:/, '')] === part)
      .map(([[scope], styles]) => [scope, styles]),
  );
}

/** The ::before layer a surface draws its backdrop filter on. */
async function layer(page: E2EPage, key: string, selector: string) {
  return page.evaluate(`(() => {
    const host = document.querySelector('[data-case="${key}"]');
    const el = (host.shadowRoot || host).querySelector('${selector}');
    return { own: getComputedStyle(el).backdropFilter, layer: getComputedStyle(el, '::before').backdropFilter };
  })()`) as Promise<{ own: string; layer: string }>;
}

/** The same set inside data-style="<style>" (or none), cases prefixed with the style. */
function styled(style: string | null, inner = SET) {
  const prefix = style ?? 'stock';
  const cases = inner.replace(/data-case="/g, `data-case="${prefix}:`);
  return style ? `<div data-style="${style}">${cases}</div>` : `<div>${cases}</div>`;
}

describe('visual styles', () => {
  it('restyle what is inside data-style and nothing outside it', async () => {
    const page = await newTestPage();
    await page.setContent(styled(null) + styled('brutal'));
    await useTokens(page);
    const s = await measure(page);

    expect(s['brutal:button']['box-shadow']).toBe('rgb(17, 24, 39) 3px 3px 0px 0px');
    expect(s['brutal:button']['border-top-left-radius']).toBe('0px');
    expect(s['brutal:card']['border-top-left-radius']).toBe('0px');
    expect(s['brutal:outlined']['border-left-width']).toBe('3px');
    // A ghost button has no surface to cast a shadow from.
    expect(s['brutal:ghost']['box-shadow']).toBe('none');

    expect(s['stock:button']['box-shadow']).toBe('none');
    expect(s['stock:card']['border-top-left-radius']).not.toBe('0px');
    expect(s['stock:outlined']['border-left-width']).not.toBe('3px');
  });

  it('every style draws the components differently from the stock look', async () => {
    const page = await newTestPage();
    await page.setContent(styled(null) + STYLES.map(style => styled(style)).join(''));
    await useTokens(page);
    const s = await measure(page);
    const look = (prefix: string) => JSON.stringify(['button', 'input', 'card', 'outlined', 'popover', 'dropdown'].map(c => s[`${prefix}:${c}`]));
    for (const style of STYLES) expect(look(style)).not.toBe(look('stock'));
  });

  it('a dark island inside a style keeps the style and takes its own colors', async () => {
    const page = await newTestPage();
    await page.setContent(
      `<div data-style="brutal"><ss-button data-case="light" label="A"></ss-button>` + `<div data-theme="dark"><ss-button data-case="dark" label="B"></ss-button></div></div>`,
    );
    await useTokens(page);
    const s = await computedParts(page, { button: 'button' });
    expect(s['light/button']['box-shadow']).toBe('rgb(17, 24, 39) 3px 3px 0px 0px');
    // The island's foreground, not the page's: test-base dark foreground.
    expect(s['dark/button']['box-shadow']).not.toBe(s['light/button']['box-shadow']);
    expect(s['dark/button']['box-shadow']).toMatch(/ 3px 3px 0px 0px$/);
    expect(s['dark/button']['border-top-left-radius']).toBe('0px');
  });

  it('glass blurs behind surfaces without making them a containing block', async () => {
    const page = await newTestPage();
    await page.setContent(styled('glass') + '<div data-style="glass"><ss-modal data-case="modal" open heading="M"><p>Body</p></ss-modal></div>');
    await useTokens(page);
    const blur = 'blur(16px) saturate(1.4)';
    for (const [key, selector] of [
      ['glass:card', '.ss-card'],
      ['glass:popover', '.ss-popover__panel'],
      ['modal', '.ss-modal__dialog'],
    ]) {
      // On the layer, never the surface: a dropdown opened inside must still
      // be placed against the viewport.
      expect(await layer(page, key, selector)).toEqual({ own: 'none', layer: blur });
    }
    // The menu scrolls, so the filter is on the menu itself.
    expect((await layer(page, 'glass:dropdown', '.ss-dropdown__menu')).own).toBe(blur);
    const s = await measure(page);
    expect(s['glass:card']['background-color']).toMatch(/^color\(srgb .* \/ 0\.62\)$/);
  });

  it('base, by name, brings a region inside a styled page back to the stock look', async () => {
    const page = await newTestPage();
    await page.setContent(styled(null) + `<div data-style="brutal">${styled('base')}</div>` + `<div data-style="glass">${styled('base').replace(/base:/g, 'base2:')}</div>`);
    await useTokens(page);
    const s = await measure(page);
    for (const c of Object.keys(OWN_PART)) {
      expect(s[`base:${c}`]).toEqual(s[`stock:${c}`]);
      expect(s[`base2:${c}`]).toEqual(s[`stock:${c}`]);
    }
  });

  it('a parameter tunes every role built on it, coherently', async () => {
    const page = await newTestPage();
    await page.setContent(
      styled('brutal') +
        styled('brutal')
          .replace('data-style="brutal"', 'data-style="brutal" style="--ss-style-brutal-offset: 8px; --ss-style-brutal-radius: 6px"')
          .replace(/brutal:/g, 'tuned:'),
    );
    await useTokens(page);
    const s = await measure(page);
    // Controls take ×0.75 of the offset, popovers (elevation.lg) ×1.5.
    expect(s['brutal:button']['box-shadow']).toBe('rgb(17, 24, 39) 3px 3px 0px 0px');
    expect(s['tuned:button']['box-shadow']).toBe('rgb(17, 24, 39) 6px 6px 0px 0px');
    expect(s['tuned:popover']['box-shadow']).toBe('rgb(17, 24, 39) 12px 12px 0px 0px');
    for (const c of ['button', 'input', 'card', 'popover', 'dropdown']) expect(s[`tuned:${c}`]['border-top-left-radius']).toBe('6px');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`each style's look (test-base ${theme})`, async () => {
      const page = await newTestPage();
      await page.setContent(STYLES.map(style => styled(style)).join(''));
      await useTokens(page, theme);
      expect(await measure(page)).toMatchSnapshot();
    }, 300_000);
  }
});
