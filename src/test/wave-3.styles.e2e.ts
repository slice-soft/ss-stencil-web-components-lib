import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts, focusedParts, hoveredParts } from './style-snapshot';
import type { PartOptions } from './style-snapshot';

/**
 * What the wave 3 atoms look like with the test-base brand, taken before they
 * move to their own component tokens. The migration must leave every value
 * here as it is.
 */
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const VARIANTS = ['default', 'brand', 'primary', 'secondary', 'tertiary', 'quaternary', 'success', 'warning', 'error', 'destructive', 'info'];
const each = (prefix: string, attr: string, values: string[]) => Object.fromEntries(values.map(v => [`${prefix}-${v}`, `${attr}="${v}"`]));

interface Component {
  tag: string;
  parts: Record<string, string>;
  cases: Record<string, string>;
  render: (attrs: string) => string;
  options?: PartOptions;
  hover?: string[];
  focus?: string[];
}

const COMPONENTS: Component[] = [
  {
    tag: 'ss-avatar',
    parts: { root: '.ss-avatar', fallback: '.ss-avatar__fallback' },
    cases: { ...each('size', 'size', ['xs', 'sm', 'md', 'lg', 'xl', '2xl']), ...each('shape', 'shape', ['circle', 'rounded', 'square']) },
    render: attrs => `<ss-avatar ${attrs} initials="JC" alt="JC"></ss-avatar>`,
    options: { sized: ['root', 'fallback'] },
  },
  {
    tag: 'ss-badge',
    parts: { root: '.ss-badge', dismiss: '.ss-badge__dismiss' },
    cases: {
      ...each('size', 'size', SIZES),
      ...Object.fromEntries(VARIANTS.flatMap(v => ['solid', 'subtle', 'outline'].map(st => [`${v}-${st}`, `variant="${v}" x-style="${st}"`]))),
      pill: 'pill',
      disabled: 'disabled',
      dismissible: 'dismissible',
    },
    render: attrs => `<ss-badge ${attrs} label="Badge"></ss-badge>`,
    focus: ['dismissible'],
  },
  {
    tag: 'ss-divider',
    parts: { root: '.ss-divider', line: '.ss-divider__line', label: '.ss-divider__label' },
    cases: {
      ...Object.fromEntries(['horizontal', 'vertical'].flatMap(o => ['none', 'sm', 'md', 'lg'].map(sp => [`${o}-${sp}`, `orientation="${o}" spacing="${sp}"`]))),
      labelled: 'label="Or"',
    },
    render: attrs => `<ss-divider ${attrs}></ss-divider>`,
    options: { extra: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'min-height', 'border-left-width', 'border-left-color'] },
  },
  {
    tag: 'ss-icon',
    parts: { root: '.ss-icon' },
    cases: { ...each('size', 'size', [...SIZES, 'inherit']), ...each('color', 'color', [...VARIANTS, 'current', 'foreground', 'muted']) },
    render: attrs => `<ss-icon ${attrs} label="Icon"><svg viewBox="0 0 1 1"></svg></ss-icon>`,
    options: { sized: ['root'] },
  },
  {
    tag: 'ss-link',
    parts: { root: '.ss-link' },
    cases: {
      ...each('size', 'size', ['sm', 'md', 'lg']),
      ...each('variant', 'variant', VARIANTS),
      ...each('underline', 'underline', ['none', 'hover', 'always']),
      disabled: 'disabled',
    },
    render: attrs => `<ss-link ${attrs} href="#x" label="Link"></ss-link>`,
    options: { extra: ['text-decoration-line', 'text-underline-offset'] },
    hover: ['variant-primary', 'underline-hover'],
    focus: ['variant-primary'],
  },
  {
    tag: 'ss-spinner',
    parts: { root: '.ss-spinner', track: '.ss-spinner__track' },
    cases: { ...each('size', 'size', SIZES), ...each('color', 'color', [...VARIANTS, 'current', 'foreground', 'muted']) },
    render: attrs => `<ss-spinner ${attrs}></ss-spinner>`,
    // The track rotates: its transform changes every frame.
    options: { sized: ['track'], extra: ['animation-duration', 'animation-name', 'animation-timing-function'], skip: ['transform'] },
  },
  {
    tag: 'ss-tooltip',
    parts: { root: '.ss-tooltip', content: '.ss-tooltip__content' },
    cases: { closed: '', open: 'open' },
    render: attrs => `<ss-tooltip ${attrs} content="Tip"><button>Trigger</button></ss-tooltip>`,
    options: { extra: ['max-width', 'z-index', 'visibility'] },
  },
  {
    tag: 'ss-typography',
    parts: { root: '.ss-typography' },
    cases: {
      ...each('color', 'color', [...VARIANTS, 'foreground', 'muted', 'inherit', 'black', 'white']),
      ...each('size', 'font-size', [...SIZES, '4xl']),
      ...each('weight', 'font-weight', ['light', 'regular', 'medium', 'semibold', 'bold']),
      ...each('line', 'line-height', ['tight', 'snug', 'normal', 'relaxed', 'loose']),
      ...each('spacing', 'letter-spacing', ['tight', 'normal', 'wide', 'wider']),
      ...each('family', 'family', ['sans', 'display', 'mono']),
      ...each('level', 'level', ['1', '2', '3', '4', '5', '6']),
      truncate: 'truncate',
    },
    render: attrs => `<ss-typography ${attrs}>Text</ss-typography>`,
    options: { extra: ['letter-spacing', 'text-transform', 'text-overflow', 'white-space'] },
  },
];

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
        await useTokens(page, theme);
        await emulateFocus(page);

        const rest = await computedParts(page, component.parts, undefined, component.options);
        // A snapshot taken without tokens compares empty values: make sure
        // tokens reached the component.
        // Sora is the tokens' font; rgb(29, 78, 216) is test-base's primary.
        expect(Object.values(rest).some(styles => styles['font-family'].includes('Sora') || styles.color === 'rgb(29, 78, 216)')).toBe(true);
        expect(Object.keys(rest).length).toBeGreaterThanOrEqual(Object.keys(component.cases).length);

        const hovered: Record<string, Record<string, string>> = {};
        for (const key of component.hover ?? []) Object.assign(hovered, await hoveredParts(page, key, component.parts, component.options));
        const focused: Record<string, Record<string, string>> = {};
        for (const key of component.focus ?? []) Object.assign(focused, await focusedParts(page, key, component.parts, component.options));

        expect({ rest, hovered, focused }).toMatchSnapshot();
      }, 300_000);
    });
  }
}
