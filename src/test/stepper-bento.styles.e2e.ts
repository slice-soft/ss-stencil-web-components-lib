import { emulateFocus, newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

/**
 * What ss-stepper, ss-step and ss-bento look like with the test-base brand:
 * a step in every state, both orientations, a focused interactive step and a
 * bento grid. A change here is a change in how they are drawn; review it as
 * one.
 */
const STEPS =
  '<ss-step data-case="complete" value="a" label="A"></ss-step>' +
  '<ss-step data-case="error" value="b" label="B" status="error"></ss-step>' +
  '<ss-step data-case="current" value="c" label="C"><span slot="description">D</span></ss-step>' +
  '<ss-step data-case="upcoming" value="d" label="D"></ss-step>' +
  '<ss-step data-case="disabled" value="e" label="E" disabled></ss-step>';

const PARTS = {
  step: '.ss-step',
  trigger: '.ss-step__trigger',
  marker: '.ss-step__marker',
  label: '.ss-step__label',
  description: '.ss-step__description',
  connector: '.ss-step__connector',
  grid: '.ss-bento',
};

// No widths: labels follow the installed font (CI has no Sora), and the grid's the page.
const LAYOUT = ['display', 'flex-direction', 'height', 'column-gap', 'row-gap', 'grid-auto-flow', 'opacity'];

for (const theme of ['light', 'dark'] as const) {
  describe(`ss-stepper and ss-bento computed styles (test-base ${theme})`, () => {
    it('match the snapshot', async () => {
      const page = await newTestPage();
      await page.setViewport({ width: 1200, height: 900 });
      await page.setContent(
        '<meta charset="utf-8">' +
          `<ss-stepper interactive value="c">${STEPS}</ss-stepper>` +
          `<ss-stepper orientation="vertical" value="c">${STEPS.replace(/data-case="/g, 'data-case="v-')}</ss-stepper>` +
          '<ss-bento data-case="bento" dense><ss-bento-item col-span="2">A</ss-bento-item><ss-bento-item>B</ss-bento-item></ss-bento>',
      );
      await useTokens(page, theme);
      await emulateFocus(page);
      await page.waitForChanges();
      const rest = await computedParts(page, PARTS, undefined, { extra: LAYOUT });
      expect(rest['complete/marker']).toBeDefined();
      expect(rest['bento/grid']).toBeDefined();

      // Keyboard focus on the first pressable step draws its ring.
      await page.keyboard.press('Tab');
      await page.waitForChanges();
      const focused = await computedParts(page, { trigger: '.ss-step__trigger' }, ['complete'], { extra: ['outline-style', 'outline-width', 'outline-color'] });
      expect(focused['complete/trigger']['outline-style']).not.toBe('none');
      expect({ rest, focused }).toMatchSnapshot();
    }, 300_000);
  });
}
