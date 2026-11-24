import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts, focusedParts } from './style-snapshot';

/**
 * What ss-search-select looks like with the test-base brand: the field in each
 * size, style and state, chips with `multiple`, and the open list with an
 * active, a selected and a disabled option. A change here is a change in how
 * the component is drawn; review it as one.
 */
const OPTIONS = '<ss-option value="a">Alpha</ss-option><ss-option value="b">Beta</ss-option><ss-option value="c" disabled>Gamma</ss-option>';

const CASES: Record<string, string> = {
  'size-sm': 'size="sm"',
  'size-md': '',
  'size-lg': 'size="lg"',
  'outline': 'x-style="outline"',
  'underline': 'x-style="underline"',
  'success': 'color="success"',
  'invalid': 'invalid',
  'disabled': 'disabled value="a"',
  'clearable': 'clearable value="a"',
  'chips': 'multiple value=""',
  'open': 'value="b"',
};

const PARTS = {
  field: '.ss-search-select__field',
  input: '.ss-search-select__input',
  clear: '.ss-search-select__clear',
  indicator: '.ss-search-select__indicator',
  chip: '.ss-search-select__chip',
  popup: '.ss-search-select__popup',
  active: '.ss-search-select__option--active',
  selected: '.ss-search-select__option--selected:not(.ss-search-select__option--active)',
  disabled: '.ss-search-select__option--disabled',
};

// No min-width: the list's is the field's width, which follows the installed font (CI has no Sora). A behaviour test covers it.
const LAYOUT = ['display', 'flex-wrap', 'align-items', 'column-gap', 'row-gap', 'z-index', 'max-height', 'overflow-y', 'border-bottom-width'];

for (const theme of ['light', 'dark'] as const) {
  describe(`ss-search-select computed styles (test-base ${theme})`, () => {
    it('match the snapshot at rest, open and focused', async () => {
      const page = await newTestPage();
      await page.setContent(
        '<meta charset="utf-8">' +
          Object.entries(CASES)
            .map(([key, attrs]) => `<div style="margin-bottom: 200px"><ss-search-select data-case="${key}" accessibility-label="Pick" ${attrs}>${OPTIONS}</ss-search-select></div>`)
            .join(''),
      );
      await useTokens(page, theme);
      await emulateFocus(page);
      await page.$eval('[data-case="chips"]', el => ((el as HTMLSsSearchSelectElement).value = ['a', 'b']));
      // Open one list, with its first option active and Beta selected.
      await page.focus('[data-case="open"]');
      await page.keyboard.press('ArrowDown');
      await page.waitForChanges();

      const rest = await computedParts(page, PARTS, undefined, { extra: LAYOUT, skip: ['opacity', 'transform'] });
      expect(rest['open/active']).toBeDefined();
      expect(rest['chips/chip']).toBeDefined();
      await page.keyboard.press('Escape');
      await page.waitForChanges();

      const focused = await focusedParts(page, 'size-md', PARTS, { extra: LAYOUT, skip: ['opacity', 'transform'] });
      expect({ rest, focused }).toMatchSnapshot();
    }, 300_000);
  });
}
