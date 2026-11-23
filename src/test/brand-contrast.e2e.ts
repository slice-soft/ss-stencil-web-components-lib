import { newTestPage, useTokens } from './utils';
import { contrast } from './contrast';
import { TEST_BRANDS } from './tokens';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'info', 'error', 'destructive'];

describe('solid buttons are legible in every test brand', () => {
  for (const brand of TEST_BRANDS) {
    for (const theme of ['light', 'dark'] as const) {
      it(`${brand} / ${theme}`, async () => {
        const page = await newTestPage();
        await page.setContent(VARIANTS.map(v => `<ss-button variant="${v}" label="${v}"></ss-button>`).join(''));
        await useTokens(page, theme, brand);
        const colors = (await page.evaluate(`
          [...document.querySelectorAll('ss-button')].map(host => {
            const style = getComputedStyle(host.shadowRoot.querySelector('button'));
            return { variant: host.getAttribute('variant'), fg: style.color, bg: style.backgroundColor };
          })
        `)) as { variant: string; fg: string; bg: string }[];
        expect(colors.map(c => c.variant)).toEqual(VARIANTS);
        const failing = colors.filter(({ fg, bg }) => contrast(fg, bg) < 4.5).map(({ variant, fg, bg }) => `${variant}: ${fg} on ${bg} = ${contrast(fg, bg).toFixed(2)}`);
        expect(failing).toEqual([]);
      });
    }
  }
});
