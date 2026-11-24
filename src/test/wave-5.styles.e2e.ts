import type { E2EPage } from '@stencil/core/testing';
import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';
import type { PartOptions } from './style-snapshot';

/**
 * What the wave 5 organisms look like with the test-base brand, taken before
 * they move to their own component tokens. The migration must leave every
 * value here as it is.
 *
 * Every organism but ss-toaster is scoped, so a part or an interaction target
 * is a plain selector inside the host. Interactions name the element they
 * hover or focus: hovering a whole nav or tab list lands on whichever item the
 * installed font puts under its centre.
 */
const each = (prefix: string, attr: string, values: string[]) => Object.fromEntries(values.map(v => [`${prefix}-${v}`, `${attr}="${v}"`]));
const LAYOUT = [
  'display',
  'position',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'column-gap',
  'row-gap',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border-right-width',
  'border-right-style',
  'border-right-color',
  'border-bottom-style',
  'text-decoration-line',
  'text-align',
];
const OVERLAY = [...LAYOUT, 'z-index', 'min-width', 'max-width', 'max-height', 'overflow-y'];

interface Interaction {
  case: string;
  /** Selector inside the case's host; `light:` is not needed, scoped hosts are light DOM. */
  target: string;
}

interface Component {
  tag: string;
  parts: Record<string, string>;
  cases: Record<string, string>;
  render: (attrs: string) => string;
  /** Script run on the page after the markup, for properties HTML cannot set. */
  setup?: string;
  options?: PartOptions;
  hover?: Interaction[];
  focus?: Interaction[];
}

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'tasks', label: 'Tasks', sortable: true, align: 'end' },
];
const ROWS = [
  { name: 'Ada', role: 'Design', tasks: 3 },
  { name: 'Grace', role: 'Code', tasks: 12 },
  { name: 'Linus', role: 'Ops', tasks: 7 },
];

const COMPONENTS: Component[] = [
  {
    tag: 'ss-accordion',
    parts: { root: '.ss-accordion' },
    cases: { plain: '' },
    render: attrs => `<ss-accordion ${attrs}><ss-accordion-item heading="Shipping">Ships.</ss-accordion-item></ss-accordion>`,
    options: { extra: LAYOUT },
  },
  {
    tag: 'ss-accordion-item',
    parts: {
      item: '.ss-accordion-item',
      heading: '.ss-accordion-item__heading',
      trigger: '.ss-accordion-item__trigger',
      title: '.ss-accordion-item__title',
      icon: '.ss-accordion-item__icon',
      panel: '.ss-accordion-item__panel',
    },
    cases: { closed: '', open: 'open', disabled: 'disabled' },
    render: attrs => `<ss-accordion><ss-accordion-item ${attrs} heading="Shipping">Ships in two days.</ss-accordion-item></ss-accordion>`,
    options: { sized: ['icon'], extra: LAYOUT },
    hover: [{ case: 'closed', target: '.ss-accordion-item__trigger' }],
    focus: [{ case: 'closed', target: '.ss-accordion-item__trigger' }],
  },
  {
    tag: 'ss-dropdown',
    parts: {
      'root': '.ss-dropdown',
      'trigger': '.ss-dropdown__trigger',
      'menu': '.ss-dropdown__menu',
      'host': 'ss-dropdown-item[value="edit"]',
      'item': 'ss-dropdown-item[value="edit"] .ss-dropdown-item',
      'icon': 'ss-dropdown-item[value="edit"] .ss-dropdown-item__icon',
      'disabled': 'ss-dropdown-item[value="archive"]',
      'disabled-item': 'ss-dropdown-item[value="archive"] .ss-dropdown-item',
      'destructive': 'ss-dropdown-item[value="delete"] .ss-dropdown-item',
    },
    cases: { closed: '', open: 'open' },
    render: attrs =>
      `<ss-dropdown ${attrs}><ss-button slot="trigger" label="Actions"></ss-button>` +
      '<ss-dropdown-item value="edit"><span slot="icon">*</span>Edit</ss-dropdown-item>' +
      '<ss-dropdown-item value="archive" disabled>Archive</ss-dropdown-item>' +
      '<ss-dropdown-item value="delete" variant="destructive">Delete</ss-dropdown-item></ss-dropdown>',
    options: { extra: [...OVERLAY, 'white-space'] },
    focus: [{ case: 'open', target: 'ss-dropdown-item[value="delete"]' }],
  },
  {
    tag: 'ss-modal',
    parts: {
      backdrop: '.ss-modal__backdrop',
      dialog: '.ss-modal__dialog',
      header: '.ss-modal__header',
      body: '.ss-modal__body',
      footer: '.ss-modal__footer',
      dismiss: '.ss-modal__dismiss',
    },
    cases: { closed: '', ...Object.fromEntries(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map(s => [`size-${s}`, `open size="${s}"`])) },
    render: attrs => `<ss-modal ${attrs} heading="Delete file"><p>Body</p><ss-button slot="footer" label="Ok"></ss-button></ss-modal>`,
    // The dialog's width is the viewport's minus a margin, capped by max-width: no font in it.
    // No outline: each open modal moves focus into itself, so which one holds it
    // (and draws the browser's focus outline) changes from run to run. No
    // vertical margins: `margin: auto` centres a dialog as tall as its content,
    // and that height depends on the installed font (CI has no Sora).
    options: {
      sized: ['dialog'],
      extra: [...OVERLAY.filter(p => p !== 'margin-top' && p !== 'margin-bottom'), 'opacity', 'line-height'],
      skip: ['outline-color', 'outline-style', 'outline-width', 'outline-offset'],
    },
  },
  {
    tag: 'ss-nav',
    parts: {
      root: '.ss-nav',
      list: '.ss-nav__list',
      current: 'ss-nav-item[href="#a"] .ss-nav-item',
      disabled: 'ss-nav-item[href="#b"] .ss-nav-item',
      plain: 'ss-nav-item[href="#c"] .ss-nav-item',
      icon: 'ss-nav-item[href="#c"] .ss-nav-item__icon',
    },
    cases: { horizontal: '', vertical: 'orientation="vertical"' },
    render: attrs =>
      `<ss-nav ${attrs} value="#a" accessibility-label="Sections">` +
      '<ss-nav-item href="#a">A</ss-nav-item><ss-nav-item href="#b" disabled>B</ss-nav-item>' +
      '<ss-nav-item href="#c"><span slot="icon">*</span>C</ss-nav-item></ss-nav>',
    options: { extra: LAYOUT },
    hover: [{ case: 'horizontal', target: 'ss-nav-item[href="#c"] .ss-nav-item' }],
    focus: [{ case: 'horizontal', target: 'ss-nav-item[href="#c"] .ss-nav-item' }],
  },
  {
    tag: 'ss-popover',
    parts: { root: '.ss-popover', trigger: '.ss-popover__trigger', panel: '.ss-popover__panel' },
    cases: { closed: '', open: 'open' },
    render: attrs => `<ss-popover ${attrs} heading="Filters"><ss-button slot="trigger" label="Filters"></ss-button><p>Body</p></ss-popover>`,
    options: { extra: OVERLAY },
  },
  {
    tag: 'ss-table',
    parts: {
      'root': '.ss-table',
      'scroll': '.ss-table__scroll',
      'table': '.ss-table__table',
      'caption': '.ss-table__caption',
      'header': '.ss-table__header',
      'header-end': '.ss-table__header:last-child',
      'cell': '.ss-table__cell',
      'cell-end': '.ss-table__cell--end',
      'even-row': '.ss-table__row:nth-child(2)',
      'last-cell': '.ss-table__row:last-child .ss-table__cell',
      'sort': '.ss-table__sort',
      'sort-active': '.ss-table__sort--active',
      'sort-icon': '.ss-table__sort-icon',
      'empty': '.ss-table__empty',
    },
    cases: {
      ...each('size', 'size', ['sm', 'md', 'lg']),
      'striped': 'striped',
      'sticky-header': 'sticky-header',
      'hidden-caption': 'hide-caption',
      'sorted': 'sort-key="name"',
      'empty': 'empty-text="Nothing"',
    },
    render: attrs => `<ss-table ${attrs} caption="Team"></ss-table>`,
    setup: `for (const table of document.querySelectorAll('ss-table')) Object.assign(table, { columns: ${JSON.stringify(COLUMNS)}, rows: table.dataset.case === 'empty' ? [] : ${JSON.stringify(ROWS)} });`,
    options: { extra: [...LAYOUT, 'z-index', 'top', 'white-space', 'caption-side', 'border-collapse', 'overflow-x', 'overflow-y', 'clip-path'] },
    hover: [{ case: 'size-md', target: '.ss-table__sort' }],
    focus: [
      { case: 'size-md', target: '.ss-table__sort' },
      { case: 'size-md', target: '.ss-table__scroll' },
    ],
  },
  {
    tag: 'ss-tabs',
    parts: {
      root: '.ss-tabs',
      list: '.ss-tabs__list',
      selected: '.ss-tabs__tab--selected',
      tab: '.ss-tabs__tab:not(.ss-tabs__tab--selected):not(:disabled)',
      disabled: '.ss-tabs__tab:disabled',
      panels: '.ss-tabs__panels',
      panel: 'ss-tab[value="one"] .ss-tab',
      hidden: 'ss-tab[value="two"] .ss-tab',
    },
    cases: { horizontal: '', vertical: 'orientation="vertical"' },
    render: attrs =>
      `<ss-tabs ${attrs} accessibility-label="Settings">` +
      '<ss-tab value="one" label="One">First</ss-tab><ss-tab value="two" label="Two">Second</ss-tab>' +
      '<ss-tab value="three" label="Three" disabled>Third</ss-tab></ss-tabs>',
    options: { extra: [...LAYOUT, 'min-width', 'flex-grow'] },
    hover: [{ case: 'horizontal', target: '.ss-tabs__tab:not(.ss-tabs__tab--selected):not(:disabled)' }],
    focus: [
      { case: 'horizontal', target: '.ss-tabs__tab--selected' },
      { case: 'horizontal', target: 'ss-tab[value="one"] .ss-tab' },
    ],
  },
  {
    tag: 'ss-toaster',
    parts: {
      root: '.ss-toaster',
      toast: 'light:ss-toast[open]',
      surface: 'light:ss-toast[open] .ss-toast',
      alert: 'light:ss-toast[open] .ss-toast__alert',
      closed: 'light:ss-toast:not([open])',
    },
    cases: each('placement', 'placement', ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end']),
    render: attrs => `<ss-toaster ${attrs}><ss-toast open duration="0" heading="Saved">Done.</ss-toast><ss-toast duration="0" heading="Closed">Gone.</ss-toast></ss-toaster>`,
    // The toaster's width is the smaller of a fixed width and the viewport's minus a margin.
    options: { sized: ['root'], extra: [...LAYOUT, 'z-index', 'top', 'right', 'bottom', 'left', 'pointer-events'] },
  },
];

/** Hovers or focuses `target` inside a case's host and returns the case's parts. */
async function interact(page: E2EPage, action: 'hover' | 'focus', { case: key, target }: Interaction, component: Component) {
  const selector = `[data-case="${key}"] ${target}`;
  if (action === 'hover') await page.hover(selector);
  else await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus({ focusVisible: true })`);
  await page.waitForChanges();
  const styles = await computedParts(page, component.parts, [key], component.options);
  if (action === 'hover') await page.mouse.move(0, 0);
  else await page.evaluate(`document.activeElement && document.activeElement.blur()`);
  return Object.fromEntries(Object.entries(styles).map(([part, value]) => [`${target} → ${part}`, value]));
}

for (const component of COMPONENTS) {
  for (const theme of ['light', 'dark'] as const) {
    describe(`${component.tag} computed styles (test-base ${theme})`, () => {
      it('match the snapshot at rest, hovered and focused', async () => {
        const page = await newTestPage();
        await page.setContent(
          Object.entries(component.cases)
            .map(([key, attrs]) => `<div>${component.render(`data-case="${key}" ${attrs}`)}</div>`)
            .join(''),
        );
        if (component.setup) await page.evaluate(component.setup);
        await useTokens(page, theme);
        await emulateFocus(page);

        const rest = await computedParts(page, component.parts, undefined, component.options);
        // A snapshot taken without tokens compares empty values: make sure
        // tokens reached the component. Without them a gap, padding, margin or border
        // set from a token resolves to nothing, and the font is not Sora.
        const fromTokens = (styles: Record<string, string>) =>
          styles['font-family'].includes('Sora') ||
          ['gap', 'row-gap', 'column-gap', 'padding-left', 'margin-left', 'border-top-width'].some(p => parseFloat(styles[p]) > 0 || parseFloat(styles[p]) < 0);
        expect(Object.values(rest).some(fromTokens)).toBe(true);
        expect(Object.keys(rest).length).toBeGreaterThanOrEqual(Object.keys(component.cases).length);

        const hovered: Record<string, Record<string, string>> = {};
        for (const interaction of component.hover ?? []) Object.assign(hovered, await interact(page, 'hover', interaction, component));
        const focused: Record<string, Record<string, string>> = {};
        for (const interaction of component.focus ?? []) Object.assign(focused, await interact(page, 'focus', interaction, component));

        expect({ rest, hovered, focused }).toMatchSnapshot();
      }, 300_000);
    });
  }
}
