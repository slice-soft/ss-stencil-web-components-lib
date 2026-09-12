import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'tasks', label: 'Tasks', sortable: true, align: 'end' },
];

const ROWS = [
  { name: 'Ada', role: 'Design', tasks: 3 },
  { name: 'Grace', role: 'Code', tasks: 12 },
  { name: 'Linus', role: 'Ops', tasks: 7 },
];

/** Mounts a table inside a container of the given width, with the columns and rows set as properties. */
async function setup(container = 'width: 600px', attrs = '', rows: unknown[] = ROWS) {
  const page = await newTestPage();
  await page.setContent(`<button id="before">Before</button><div style="${container}"><ss-table caption="Team" ${attrs}></ss-table></div><button id="after">After</button>`);
  await useTokens(page);
  await page.$eval(
    'ss-table',
    (el, columns, data) => {
      Object.assign(el, { columns, rows: data });
    },
    COLUMNS,
    rows,
  );
  await page.waitForChanges();
  return page;
}

const names = (page: E2EPage) => page.$$eval('ss-table tbody tr', rows => rows.map(row => row.querySelector('td')?.textContent));

describe('ss-table semantics', () => {
  it('is a table named by its caption, with named column headers', async () => {
    const page = await setup();

    expect((await axNodeByRole(page, 'table')).name).toBe('Team');
    expect(await axNodeNamed(page, 'columnheader', 'Role')).not.toBeNull();
  });

  it('puts a sort button in a sortable header, named by the column', async () => {
    const page = await setup();
    expect(await axNodeNamed(page, 'button', 'Name')).not.toBeNull();
  });
});

describe('ss-table sorting from the keyboard', () => {
  it('sorts when the header button is pressed with Enter', async () => {
    const page = await setup();
    await page.focus('#before');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForChanges();

    // The second stop is the Tasks header: the first sorted by Name, which the
    // rows are already in.
    expect(await page.evaluate(() => document.activeElement?.textContent?.replace(/[▲▼↕]/g, ''))).toBe('Tasks');
    expect(await names(page)).toEqual(['Ada', 'Linus', 'Grace']);
  });
});

describe('ss-table scrolling', () => {
  it('adds no tab stop when it fits', async () => {
    const page = await setup('width: 600px');
    expect(await page.$eval('ss-table .ss-table__scroll', el => el.getAttribute('tabindex'))).toBeNull();
  });

  it('becomes a focusable region named by its caption when it overflows', async () => {
    const page = await setup('width: 120px');

    expect(await page.$eval('ss-table .ss-table__scroll', el => el.getAttribute('tabindex'))).toBe('0');
    expect((await axNodeByRole(page, 'region')).name).toBe('Team');
  });

  it('notices when its container shrinks under it', async () => {
    const page = await setup('width: 600px');

    await page.$eval('ss-table', el => ((el.parentElement as HTMLElement).style.width = '120px'));

    let tabindex: string | null = null;
    for (let attempt = 0; attempt < 20 && tabindex === null; attempt++) {
      await page.waitForChanges();
      tabindex = await page.$eval('ss-table .ss-table__scroll', el => el.getAttribute('tabindex'));
      if (tabindex === null) await new Promise(resolve => setTimeout(resolve, 25));
    }

    expect(tabindex).toBe('0');
  });

  it('keeps the header in view while the rows scroll, when asked to', async () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({ name: `Person ${index}`, role: 'Code', tasks: index }));
    const page = await setup('width: 600px', 'sticky-header inline-styles="max-height: 200px"', rows);

    await page.$eval('ss-table .ss-table__scroll', el => (el.scrollTop = 300));
    await page.waitForChanges();

    const [scroll, header] = await page.evaluate(() => ['ss-table .ss-table__scroll', 'ss-table th'].map(sel => document.querySelector(sel)!.getBoundingClientRect().top));
    // The border of the scroll area is the only thing above the header.
    expect(header - scroll).toBeLessThanOrEqual(2);
  });
});
