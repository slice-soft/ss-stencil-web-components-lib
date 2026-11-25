import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, newTestPage, useTokens } from '../../../../test/utils';

async function setup(html: string): Promise<E2EPage> {
  const page = await newTestPage();
  await page.setContent(`<meta charset="utf-8">${html}`);
  await useTokens(page);
  return page;
}

const shadow = (selector: string, js: string) =>
  `(() => { const el = document.querySelector('ss-progress').shadowRoot.querySelector(${JSON.stringify(selector)}); return ${js}; })()`;

describe('ss-progress', () => {
  it('is a progressbar named by its label with its value', async () => {
    const page = await setup('<ss-progress value="40"></ss-progress>');
    const node = await axNodeByRole(page, 'progressbar');
    expect(node.name).toBe('Progress');
    expect(node.value).toBe(40);
    expect(node.valuemax).toBe(100);
  });

  it('without value it is indeterminate', async () => {
    const page = await setup('<ss-progress></ss-progress>');
    const node = await axNodeByRole(page, 'progressbar');
    expect(node.value).toBeUndefined();
    expect(await page.evaluate(shadow('.ss-progress', 'el.classList.contains("ss-progress--indeterminate")'))).toBe(true);
  });

  // Chrome's accessibility tree reports valuetext as "" even for a plain
  // <div role="progressbar" aria-valuetext>, so this one reads the attribute.
  it('value-text is read instead of the percentage', async () => {
    const page = await setup('<ss-progress value="3" max="10" value-text="3 of 10 files"></ss-progress>');
    expect(await page.evaluate(shadow('[role="progressbar"]', 'el.getAttribute("aria-valuetext")'))).toBe('3 of 10 files');
  });

  it('labelled-by names it from the page', async () => {
    const page = await setup('<span id="l">Subida</span><ss-progress labelled-by="l" value="10"></ss-progress>');
    expect((await axNodeByRole(page, 'progressbar')).name).toBe('Subida');
  });

  it('the fill matches the value and never overflows', async () => {
    const page = await setup('<div style="width:200px"><ss-progress value="150"></ss-progress></div>');
    const widths = async () =>
      (await page.evaluate(
        `(() => { const r = document.querySelector('ss-progress').shadowRoot; return [r.querySelector('.ss-progress__fill').getBoundingClientRect().width, r.querySelector('.ss-progress__track').getBoundingClientRect().width]; })()`,
      )) as [number, number];
    let [fill, track] = await widths();
    expect(track).toBeGreaterThan(0);
    expect(fill).toBeCloseTo(track, 0);

    await page.evaluate(`document.querySelector('ss-progress').value = 25`);
    await page.waitForChanges();
    [fill, track] = await widths();
    expect(Math.abs(fill - track / 4)).toBeLessThanOrEqual(1);
  });

  it('show-value draws the rounded percentage, not when indeterminate', async () => {
    const page = await setup('<ss-progress show-value value="33.4"></ss-progress>');
    expect(await page.evaluate(shadow('.ss-progress__value', 'el && el.textContent'))).toBe('33%');
    await page.evaluate(`document.querySelector('ss-progress').value = undefined`);
    await page.waitForChanges();
    expect(await page.evaluate(shadow('.ss-progress__value', 'el'))).toBeNull();
  });

  it('circle draws the arc for the value', async () => {
    const page = await setup('<ss-progress shape="circle" value="25"></ss-progress>');
    expect(await page.evaluate(shadow('.ss-progress__arc', 'parseFloat(getComputedStyle(el).strokeDashoffset.replace(/^calc\\(/, ""))'))).toBe(75);
  });

  it('reduced motion stops the indeterminate animation', async () => {
    const page = await setup('<ss-progress></ss-progress>');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    expect(await page.evaluate(shadow('.ss-progress__fill', 'getComputedStyle(el).animationName'))).toBe('none');
  });
});
