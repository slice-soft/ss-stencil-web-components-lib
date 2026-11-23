import { newTestPage, useTokens } from './utils';
import { computedStyles, focusedStyles, hoveredStyles } from './style-snapshot';

/**
 * What the wave 1 controls look like with slicesoft, taken before they move to
 * their own component tokens. The migration must leave every value here as it
 * is; the only intended changes are recorded in the plan and updated by hand.
 */
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const VARIANTS = ['default', 'brand', 'primary', 'secondary', 'tertiary', 'quaternary', 'success', 'warning', 'error', 'destructive', 'info'];

interface Component {
  tag: string;
  styles: string[];
  /** Markup for one case; `attrs` already carries data-case. */
  render: (attrs: string) => string;
  extra: Record<string, string>;
}

const control =
  (tag: string, inner = '') =>
  (attrs: string) =>
    `<${tag} ${attrs} accessibility-label="x">${inner}</${tag}>`;

const COMPONENTS: Component[] = [
  {
    tag: 'ss-button',
    styles: ['solid', 'outline', 'ghost'],
    render: attrs => `<ss-button ${attrs} label="Label"></ss-button>`,
    extra: {
      'shape-pill': 'shape="pill"',
      'shape-circle': 'shape="circle"',
      'shape-square': 'shape="square"',
      'full-width': 'full-width',
      'loading': 'status="loading"',
    },
  },
  { tag: 'ss-input', styles: ['solid', 'outline', 'underline'], render: control('ss-input'), extra: { readonly: 'readonly', invalid: 'invalid' } },
  { tag: 'ss-textarea', styles: ['solid', 'outline', 'underline'], render: control('ss-textarea'), extra: { readonly: 'readonly', invalid: 'invalid' } },
  { tag: 'ss-select', styles: ['solid', 'outline', 'underline'], render: control('ss-select', '<option>One</option>'), extra: { invalid: 'invalid' } },
  {
    tag: 'ss-combobox',
    styles: ['solid', 'outline', 'underline'],
    render: control('ss-combobox', '<option value="One"></option>'),
    extra: { readonly: 'readonly', invalid: 'invalid' },
  },
];

function cases(component: Component): Record<string, string> {
  const variantAttr = component.tag === 'ss-button' ? 'variant' : 'color';
  const out: Record<string, string> = {};
  for (const size of SIZES) out[`size-${size}`] = `size="${size}"`;
  for (const variant of VARIANTS) {
    for (const style of component.styles) out[`${variant}-${style}`] = `${variantAttr}="${variant}" x-style="${style}"`;
  }
  out['disabled'] = 'disabled';
  Object.assign(out, component.extra);
  return out;
}

for (const component of COMPONENTS) {
  for (const theme of ['light', 'dark'] as const) {
    describe(`${component.tag} computed styles (slicesoft ${theme})`, () => {
      it('match the snapshot at rest, hovered and focused', async () => {
        const all = cases(component);
        const page = await newTestPage();
        await page.setContent(
          Object.entries(all)
            .map(([key, attrs]) => `<div>${component.render(`data-case="${key}" ${attrs}`)}</div>`)
            .join(''),
        );
        await useTokens(page, theme);

        const rest = await computedStyles(page);
        // A snapshot taken without tokens compares empty values and passes
        // forever: make sure the tokens reached the component.
        expect(parseFloat(rest['size-md']['padding-left'])).toBeGreaterThan(0);
        expect(Object.keys(rest)).toHaveLength(Object.keys(all).length);

        const interactive = Object.keys(all).filter(key => key.endsWith('-solid') || key.endsWith('-outline') || key.endsWith('-ghost') || key.endsWith('-underline'));
        const hovered: Record<string, Record<string, string>> = {};
        const focused: Record<string, Record<string, string>> = {};
        for (const key of interactive) {
          hovered[key] = await hoveredStyles(page, key);
          focused[key] = await focusedStyles(page, key);
        }

        expect({ rest, hovered, focused }).toMatchSnapshot();
      });
    });
  }
}
