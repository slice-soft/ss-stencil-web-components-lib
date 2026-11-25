import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

/**
 * What ss-progress and ss-drawer look like with the test-base brand: bars and
 * circles in a few sizes and colors, determinate and not, and an open drawer
 * on each edge. A change here is a change in how they are drawn; review it as
 * one.
 */
const PROGRESS: Record<string, string> = {
  'bar-md': 'value="40"',
  'bar-sm': 'value="40" size="sm"',
  'bar-lg-success': 'value="40" size="lg" color="success"',
  'bar-indeterminate': '',
  'circle-md': 'shape="circle" value="40"',
  'circle-xl-value': 'shape="circle" size="xl" value="40" show-value',
};

const DRAWERS: Record<string, string> = {
  'drawer-end': 'placement="end" size="sm"',
  'drawer-bottom': 'placement="bottom" size="sm"',
};

const PARTS = {
  track: '.ss-progress__track',
  fill: '.ss-progress__fill',
  circle: '.ss-progress__circle',
  arc: '.ss-progress__arc',
  ring: '.ss-progress__ring',
  panel: '.ss-drawer__panel',
  header: '.ss-drawer__header',
  footer: '.ss-drawer__footer',
};

// No width or left/right: the fill's follows the track, the track's the page.
const LAYOUT = ['display', 'height', 'stroke', 'stroke-width', 'stroke-dashoffset', 'z-index', 'position', 'border-top-right-radius', 'border-bottom-left-radius'];

for (const theme of ['light', 'dark'] as const) {
  describe(`ss-progress and ss-drawer computed styles (test-base ${theme})`, () => {
    it('match the snapshot', async () => {
      const page = await newTestPage();
      await page.setContent(
        '<meta charset="utf-8">' +
          Object.entries(PROGRESS)
            .map(([key, attrs]) => `<div style="width: 200px; margin-bottom: 16px"><ss-progress data-case="${key}" ${attrs}></ss-progress></div>`)
            .join('') +
          Object.entries(DRAWERS)
            .map(([key, attrs]) => `<ss-drawer data-case="${key}" open modal="false" heading="D" ${attrs}><p>Body</p><ss-button slot="footer" label="OK"></ss-button></ss-drawer>`)
            .join(''),
      );
      await useTokens(page, theme);
      // The indeterminate fill moves every frame.
      const styles = await computedParts(page, PARTS, undefined, { extra: LAYOUT, skip: ['transform', 'outline-color', 'outline-style', 'outline-width', 'outline-offset'] });
      expect(styles['bar-md/fill']).toBeDefined();
      expect(styles['drawer-end/panel']).toBeDefined();
      expect(styles).toMatchSnapshot();
    }, 300_000);
  });
}
