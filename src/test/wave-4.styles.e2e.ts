import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts, focusedParts } from './style-snapshot';
import type { PartOptions } from './style-snapshot';

/**
 * What the wave 4 molecules look like with the test-base brand, taken before
 * they move to their own component tokens. The migration must leave every
 * value here as it is.
 */
const each = (prefix: string, attr: string, values: string[]) => Object.fromEntries(values.map(v => [`${prefix}-${v}`, `${attr}="${v}"`]));
const LAYOUT = [
  'display',
  'flex-direction',
  'column-gap',
  'row-gap',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'border-bottom-style',
  'border-left-width',
  'border-right-width',
  'min-width',
];

interface Component {
  tag: string;
  parts: Record<string, string>;
  cases: Record<string, string>;
  render: (attrs: string) => string;
  options?: PartOptions;
  focus?: string[];
}

const avatars = (n: number) => Array.from({ length: n }, (_, i) => `<ss-avatar initials="A${i}"></ss-avatar>`).join('');
const choices = (tag: string) => `<${tag} label="One" value="1"></${tag}><${tag} label="Two" value="2"></${tag}>`;

const COMPONENTS: Component[] = [
  {
    tag: 'ss-alert',
    parts: { root: '.ss-alert', body: '.ss-alert__body', message: '.ss-alert__message', actions: '.ss-alert__actions', dismiss: '.ss-alert__dismiss', icon: '.ss-alert__icon' },
    cases: { ...each('variant', 'variant', ['info', 'success', 'warning', 'error']), 'dismissible': 'dismissible', 'full-width': 'full-width' },
    render: attrs => `<ss-alert ${attrs} heading="Heads up"><span slot="icon">!</span>Message<ss-button slot="actions" label="Ok"></ss-button></ss-alert>`,
    focus: ['dismissible'],
  },
  {
    tag: 'ss-avatar-group',
    parts: { root: '.ss-avatar-group', overflow: '.ss-avatar-group__overflow', first: 'light:ss-avatar:first-child', second: 'light:ss-avatar:nth-child(2)' },
    cases: { ...each('size', 'size', ['xs', 'sm', 'md', 'lg', 'xl', '2xl']), ...each('shape', 'shape', ['circle', 'rounded', 'square']) },
    render: attrs => `<ss-avatar-group ${attrs} max="2">${avatars(4)}</ss-avatar-group>`,
    options: { sized: ['overflow'], extra: LAYOUT },
  },
  {
    tag: 'ss-breadcrumb',
    parts: {
      list: '.ss-breadcrumb__list',
      item: '.ss-breadcrumb-item',
      label: '.ss-breadcrumb-item__label',
      separator: '.ss-breadcrumb-item__separator',
      current: 'ss-breadcrumb-item:last-child .ss-breadcrumb-item__label',
    },
    cases: each('size', 'size', ['sm', 'md', 'lg']),
    render: attrs =>
      `<ss-breadcrumb ${attrs}><ss-breadcrumb-item href="#a" label="Home"></ss-breadcrumb-item><ss-breadcrumb-item label="Here"></ss-breadcrumb-item></ss-breadcrumb>`,
    options: { extra: LAYOUT },
  },
  {
    tag: 'ss-button-group',
    parts: { root: '.ss-button-group', second: 'light:ss-button:nth-child(2)' },
    cases: { ...each('orientation', 'orientation', ['horizontal', 'vertical']), 'attached': 'attached', 'full-width': 'full-width' },
    render: attrs => `<ss-button-group ${attrs} accessibility-label="g"><ss-button label="A"></ss-button><ss-button label="B"></ss-button></ss-button-group>`,
    options: { extra: LAYOUT },
  },
  {
    tag: 'ss-card',
    parts: { root: '.ss-card', header: '.ss-card__header', content: '.ss-card__content', footer: '.ss-card__footer' },
    cases: {
      ...Object.fromEntries(['elevated', 'outlined', 'filled'].flatMap(st => ['none', 'sm', 'md', 'lg'].map(p => [`${st}-${p}`, `x-style="${st}" padding="${p}"`]))),
      'full-width': 'full-width',
    },
    render: attrs => `<ss-card ${attrs}><span slot="header">H</span>Body<span slot="footer">F</span></ss-card>`,
    options: { extra: [...LAYOUT, 'border-top-width', 'border-top-style', 'border-bottom-width', 'border-bottom-color'] },
  },
  {
    tag: 'ss-checkbox-group',
    parts: {
      root: '.ss-checkbox-group',
      choices: '.ss-checkbox-group__choices',
      master: '.ss-checkbox-group__master',
      label: '.ss-checkbox-group__label',
      helper: '.ss-checkbox-group__helper',
    },
    cases: { 'vertical': '', 'horizontal': 'orientation="horizontal"', 'disabled': 'disabled', 'select-all': 'select-all-label="All"' },
    render: attrs => `<ss-checkbox-group ${attrs} label="Pick" helper-text="Help">${choices('ss-checkbox')}</ss-checkbox-group>`,
    options: { extra: [...LAYOUT, 'padding-bottom', 'border-bottom-width', 'border-bottom-color'] },
  },
  {
    tag: 'ss-field',
    parts: { root: '.ss-field', control: '.ss-field__control', helper: '.ss-field__helper' },
    cases: { vertical: '', horizontal: 'orientation="horizontal"', disabled: 'disabled' },
    render: attrs => `<ss-field ${attrs} label="Name" helper-text="Help"><ss-input accessibility-label="x"></ss-input></ss-field>`,
    options: { extra: [...LAYOUT, 'grid-template-columns'] },
  },
  {
    tag: 'ss-input-group',
    parts: { root: '.ss-input-group', start: '.ss-input-group__addon--start', end: '.ss-input-group__addon--end' },
    cases: { 'plain': '', 'disabled': 'disabled', 'full-width': 'full-width' },
    render: attrs => `<ss-input-group ${attrs}><span slot="start">$</span><ss-input accessibility-label="x"></ss-input><span slot="end">.00</span></ss-input-group>`,
    options: { extra: [...LAYOUT, 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'] },
  },
  {
    tag: 'ss-pagination',
    parts: { list: '.ss-pagination__list', gap: '.ss-pagination__gap' },
    cases: { plain: '', disabled: 'disabled' },
    render: attrs => `<ss-pagination ${attrs} page="5" total="20"></ss-pagination>`,
    options: { extra: LAYOUT },
  },
  {
    tag: 'ss-radio-group',
    parts: { root: '.ss-radio-group', choices: '.ss-radio-group__choices', label: '.ss-radio-group__label', helper: '.ss-radio-group__helper' },
    cases: { vertical: '', horizontal: 'orientation="horizontal"', disabled: 'disabled' },
    render: attrs => `<ss-radio-group ${attrs} label="Pick" helper-text="Help">${choices('ss-radio')}</ss-radio-group>`,
    options: { extra: LAYOUT },
  },
];

for (const component of COMPONENTS) {
  for (const theme of ['light', 'dark'] as const) {
    describe(`${component.tag} computed styles (test-base ${theme})`, () => {
      it('match the snapshot at rest and focused', async () => {
        const page = await newTestPage();
        await page.setContent(
          Object.entries(component.cases)
            .map(([key, attrs]) => `<div>${component.render(`data-case="${key}" ${attrs}`)}</div>`)
            .join(''),
        );
        await useTokens(page, theme);
        await emulateFocus(page);

        const rest = await computedParts(page, component.parts, undefined, component.options);
        // A snapshot taken without tokens compares empty values: make sure
        // tokens reached the component. Without them a gap, padding or margin
        // set from a token resolves to nothing, and the font is not Sora.
        const fromTokens = (styles: Record<string, string>) =>
          styles['font-family'].includes('Sora') ||
          ['gap', 'row-gap', 'column-gap', 'padding-left', 'margin-left'].some(p => parseFloat(styles[p]) > 0 || parseFloat(styles[p]) < 0);
        expect(Object.values(rest).some(fromTokens)).toBe(true);
        expect(Object.keys(rest).length).toBeGreaterThanOrEqual(Object.keys(component.cases).length);

        const focused: Record<string, Record<string, string>> = {};
        for (const key of component.focus ?? []) Object.assign(focused, await focusedParts(page, key, component.parts, component.options));

        expect({ rest, focused }).toMatchSnapshot();
      }, 300_000);
    });
  }
}
