import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts, focusedParts } from './style-snapshot';

/**
 * What the wave 2 controls look like with the test-base brand, taken before
 * they move to their own component tokens. The migration must leave every
 * value here as it is.
 */
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const VARIANTS = ['default', 'brand', 'primary', 'secondary', 'tertiary', 'quaternary', 'success', 'warning', 'error', 'destructive', 'info'];

interface Component {
  tag: string;
  parts: Record<string, string>;
  cases: Record<string, string>;
  render?: (attrs: string) => string;
}

const sized = (extra: Record<string, string>) => ({ ...Object.fromEntries(SIZES.map(s => [`size-${s}`, `size="${s}"`])), ...extra });
const CHOICE_STATES = {
  'checked': 'checked',
  'disabled': 'disabled',
  'disabled-checked': 'disabled checked',
  'readonly': 'readonly',
  'invalid': 'invalid',
  'invalid-checked': 'invalid checked',
};

const COMPONENTS: Component[] = [
  {
    tag: 'ss-checkbox',
    parts: { root: ':host > *', control: '.ss-checkbox__control', mark: '.ss-checkbox__mark' },
    cases: sized({ ...CHOICE_STATES, indeterminate: 'indeterminate' }),
  },
  {
    tag: 'ss-radio',
    parts: { root: ':host > *', control: '.ss-radio__control', mark: '.ss-radio__mark' },
    cases: sized(CHOICE_STATES),
  },
  {
    tag: 'ss-switch',
    parts: { root: ':host > *', track: '.ss-switch__track', thumb: '.ss-switch__thumb' },
    cases: sized({ ...CHOICE_STATES, 'label-start': 'label-position="start"' }),
  },
  {
    tag: 'ss-slider',
    parts: { root: '.ss-slider', input: '.ss-slider__input', value: '.ss-slider__value' },
    cases: sized({
      ...Object.fromEntries(VARIANTS.map(v => [`color-${v}`, `color="${v}"`])),
      'disabled': 'disabled',
      'readonly': 'readonly',
      'invalid': 'invalid',
      'full-width': 'full-width',
    }),
    render: attrs => `<ss-slider ${attrs} accessibility-label="x" value="40" show-value></ss-slider>`,
  },
  {
    tag: 'ss-label',
    parts: { root: '.ss-label', required: '.ss-label__required' },
    cases: sized({ required: 'required', disabled: 'disabled' }),
    render: attrs => `<ss-label ${attrs} label="Name"></ss-label>`,
  },
];

for (const component of COMPONENTS) {
  for (const theme of ['light', 'dark'] as const) {
    describe(`${component.tag} computed styles (test-base ${theme})`, () => {
      it('match the snapshot at rest and focused', async () => {
        const render = component.render ?? ((attrs: string) => `<${component.tag} ${attrs} label="Label"></${component.tag}>`);
        const page = await newTestPage();
        await page.setContent(
          Object.entries(component.cases)
            .map(([key, attrs]) => `<div>${render(`data-case="${key}" ${attrs}`)}</div>`)
            .join(''),
        );
        await useTokens(page, theme);
        await emulateFocus(page);

        // ':host > *' is the scoped component's own wrapper element.
        const parts = Object.fromEntries(Object.entries(component.parts).map(([n, s]) => [n, s.replace(':host > *', `.${component.tag}`)]));
        // Parts whose width the stylesheet sets; text-wrapping parts depend on the font.
        const sized = ['control', 'mark', 'track', 'thumb', 'input'];
        const rest = await computedParts(page, parts, undefined, sized);
        // A snapshot taken without tokens compares empty values: make sure
        // tokens reached the component.
        expect(Object.values(rest).some(styles => styles['font-family'].includes('Sora'))).toBe(true);
        expect(Object.keys(rest).length).toBeGreaterThanOrEqual(Object.keys(component.cases).length);

        const focused: Record<string, Record<string, string>> = {};
        if (component.tag !== 'ss-label') {
          for (const key of ['size-md', 'checked', 'color-primary'].filter(k => k in component.cases)) {
            Object.assign(focused, await focusedParts(page, key, parts, sized));
          }
        }

        expect({ rest, focused }).toMatchSnapshot();
      }, 300_000);
    });
  }
}
