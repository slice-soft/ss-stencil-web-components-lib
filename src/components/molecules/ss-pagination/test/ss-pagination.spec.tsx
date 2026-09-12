import { newSpecPage } from '@stencil/core/testing';
import { SsPagination } from '../ss-pagination';
import { SsButton } from '../../../atoms/ss-button/ss-button';
import { getRoot } from '../../../../test/utils';

const components = [SsPagination, SsButton];

async function pagination(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

type Page = Awaited<ReturnType<typeof pagination>>;

/** What the reader sees in the row, in order: page numbers and gaps. */
function row(page: Page): string[] {
  return Array.from(getRoot(page).querySelectorAll('.ss-pagination__page, .ss-pagination__gap')).map(item =>
    item.classList.contains('ss-pagination__gap') ? '…' : ((item as unknown as { label: string }).label ?? ''),
  );
}

function pageButton(page: Page, label: string) {
  return Array.from(getRoot(page).querySelectorAll('.ss-pagination__page')).find(button => (button as unknown as { label: string }).label === label) as HTMLElement | undefined;
}

describe('ss-pagination range', () => {
  it('shows every page when they all fit', async () => {
    const page = await pagination(`<ss-pagination page="1" total="5"></ss-pagination>`);
    expect(row(page)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('collapses the far side into a gap', async () => {
    const page = await pagination(`<ss-pagination page="1" total="10"></ss-pagination>`);
    expect(row(page)).toEqual(['1', '2', '…', '10']);
  });

  it('keeps the current page between its siblings', async () => {
    const page = await pagination(`<ss-pagination page="5" total="10"></ss-pagination>`);
    expect(row(page)).toEqual(['1', '…', '4', '5', '6', '…', '10']);
  });

  it('collapses the near side once the reader is at the end', async () => {
    const page = await pagination(`<ss-pagination page="10" total="10"></ss-pagination>`);
    expect(row(page)).toEqual(['1', '…', '9', '10']);
  });

  it('shows the page instead of a gap when the gap would hide only one', async () => {
    const page = await pagination(`<ss-pagination page="4" total="7"></ss-pagination>`);

    // A gap standing in for a single page costs a click and saves nothing.
    expect(row(page)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('widens the run when more siblings are asked for', async () => {
    const page = await pagination(`<ss-pagination page="5" total="20" sibling-count="2"></ss-pagination>`);

    // Page 2 is shown rather than hidden: the gap would stand in for it alone.
    expect(row(page)).toEqual(['1', '2', '3', '4', '5', '6', '7', '…', '20']);
  });

  it('shows a single page for an empty list', async () => {
    const page = await pagination(`<ss-pagination page="1" total="0"></ss-pagination>`);
    expect(row(page)).toEqual(['1']);
  });
});

describe('ss-pagination state', () => {
  it('marks the current page for assistive technology', async () => {
    const page = await pagination(`<ss-pagination page="3" total="5"></ss-pagination>`);
    expect(pageButton(page, '3')?.getAttribute('aria-current')).toBe('page');
    expect(pageButton(page, '2')?.getAttribute('aria-current')).toBeNull();
  });

  it('disables previous on the first page and next on the last', async () => {
    const first = await pagination(`<ss-pagination page="1" total="5"></ss-pagination>`);
    const previous = getRoot(first).querySelector('.ss-pagination__previous') as unknown as Record<string, unknown>;
    const next = getRoot(first).querySelector('.ss-pagination__next') as unknown as Record<string, unknown>;
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    const last = await pagination(`<ss-pagination page="5" total="5"></ss-pagination>`);
    expect((getRoot(last).querySelector('.ss-pagination__next') as unknown as Record<string, unknown>).disabled).toBe(true);
  });

  it('clamps a page outside the range rather than rendering nothing', async () => {
    const page = await pagination(`<ss-pagination page="99" total="5"></ss-pagination>`);
    expect(pageButton(page, '5')?.getAttribute('aria-current')).toBe('page');
  });

  it('names the region so two on one screen stay distinguishable', async () => {
    const page = await pagination(`<ss-pagination accessibility-label="Search results"></ss-pagination>`);
    expect(getRoot(page).querySelector('nav')?.getAttribute('aria-label')).toBe('Search results');
  });
});

describe('ss-pagination navigation', () => {
  it('reports the page the reader asked for and adopts it', async () => {
    const page = await pagination(`<ss-pagination x-id="results" page="2" total="5"></ss-pagination>`);
    const root = getRoot(page);
    const spy = jest.fn();
    root.addEventListener('ssChange', spy);

    pageButton(page, '4')?.click();
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({ xId: 'results', page: 4 });
    expect((root as unknown as { page: number }).page).toBe(4);
  });

  it('says nothing when the page asked for is the one already shown', async () => {
    const page = await pagination(`<ss-pagination page="2" total="5"></ss-pagination>`);
    const spy = jest.fn();
    getRoot(page).addEventListener('ssChange', spy);

    pageButton(page, '2')?.click();
    await page.waitForChanges();

    expect(spy).not.toHaveBeenCalled();
  });

  it('steps with the previous and next controls', async () => {
    const page = await pagination(`<ss-pagination page="3" total="5"></ss-pagination>`);
    const root = getRoot(page);

    (root.querySelector('.ss-pagination__next') as HTMLElement).click();
    await page.waitForChanges();
    expect((root as unknown as { page: number }).page).toBe(4);

    (root.querySelector('.ss-pagination__previous') as HTMLElement).click();
    await page.waitForChanges();
    expect((root as unknown as { page: number }).page).toBe(3);
  });

  it('ignores interaction while disabled', async () => {
    const page = await pagination(`<ss-pagination page="2" total="5" disabled></ss-pagination>`);
    const spy = jest.fn();
    getRoot(page).addEventListener('ssChange', spy);

    pageButton(page, '4')?.click();
    await page.waitForChanges();

    expect(spy).not.toHaveBeenCalled();
    expect((getRoot(page) as unknown as { page: number }).page).toBe(2);
  });
});
