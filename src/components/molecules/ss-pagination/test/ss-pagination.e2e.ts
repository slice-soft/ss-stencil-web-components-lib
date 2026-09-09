import { newTestPage } from '../../../../test/utils';

const PAGINATION = `<ss-pagination x-id="results" page="5" total="20" accessibility-label="Search results"></ss-pagination>`;

describe('ss-pagination in the browser', () => {
  it('moves to the page the reader clicks', async () => {
    const page = await newTestPage();
    await page.setContent(PAGINATION);
    await page.waitForChanges();

    const changed = await page.spyOnEvent('ssChange');

    // `label` is a property, not an attribute, so the page is found by the text
    // the reader actually sees.
    await page.evaluate(() => {
      const target = Array.from(document.querySelectorAll('ss-pagination .ss-pagination__page')).find(
        button => (button as HTMLElement).shadowRoot?.querySelector('button')?.textContent?.trim() === '6',
      );
      (target as HTMLElement).shadowRoot!.querySelector('button')!.click();
    });
    await page.waitForChanges();

    expect(changed.lastEvent.detail.page).toBe(6);
    expect(await page.find('ss-pagination')).toEqualAttribute('page', '6');
  });

  it('walks through pages with the keyboard', async () => {
    const page = await newTestPage();
    await page.setContent(PAGINATION);
    await page.waitForChanges();

    const next = await page.find('ss-pagination .ss-pagination__next >>> button');
    await next.focus();
    await next.press('Enter');
    await page.waitForChanges();

    expect(await page.find('ss-pagination')).toEqualAttribute('page', '6');
  });

  it('exposes a named navigation region with the current page marked', async () => {
    const page = await newTestPage();
    await page.setContent(PAGINATION);
    await page.waitForChanges();

    const region = await page.find('ss-pagination nav');
    expect(region.getAttribute('aria-label')).toBe('Search results');

    const current = await page.evaluate(() =>
      (document.querySelector('ss-pagination [aria-current="page"]') as HTMLElement)?.shadowRoot?.querySelector('button')?.textContent?.trim(),
    );
    expect(current).toBe('5');
  });

  it('refuses to step past the ends', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-pagination page="1" total="3"></ss-pagination>`);
    await page.waitForChanges();

    const previous = await page.find('ss-pagination .ss-pagination__previous >>> button');
    expect(previous).toHaveAttribute('disabled');
  });
});
