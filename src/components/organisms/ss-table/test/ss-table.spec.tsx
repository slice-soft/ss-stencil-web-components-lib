import { newSpecPage } from '@stencil/core/testing';
import { SsTable, SsTableColumn, TableRow } from '../ss-table';
import { getRoot } from '../../../../test/utils';

const COLUMNS: SsTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'tasks', label: 'Tasks', sortable: true, align: 'end' },
];

const ROWS: TableRow[] = [
  { name: 'Item 10', role: 'Design', tasks: 3 },
  { name: 'Item 2', role: 'Code', tasks: 12 },
  { name: 'Item 1', role: 'Ops', tasks: null },
];

type Table = HTMLElement & { columns: SsTableColumn[]; rows: TableRow[]; sortKey?: string; sortDirection: string };

async function table(attrs = '', rows: TableRow[] = ROWS, columns: SsTableColumn[] = COLUMNS) {
  const page = await newSpecPage({ components: [SsTable], html: `<ss-table caption="Team" ${attrs}></ss-table>` });
  const root = getRoot(page) as Table;
  root.columns = columns;
  root.rows = rows;
  await page.waitForChanges();

  const column = (index: number) => Array.from(root.querySelectorAll('tbody tr')).map(row => row.querySelectorAll('td')[index]?.textContent);
  const header = (index: number) => root.querySelectorAll('th')[index] as HTMLElement;
  const press = async (index: number) => {
    (header(index).querySelector('button') as HTMLElement).click();
    await page.waitForChanges();
  };
  return { page, root, column, header, press };
}

describe('ss-table rendering', () => {
  it('is a table named by its caption, with column headers', async () => {
    const { root } = await table();

    expect(root.querySelector('caption')?.textContent).toBe('Team');
    expect(Array.from(root.querySelectorAll('th')).map(th => th.getAttribute('scope'))).toEqual(['col', 'col', 'col']);
    expect(Array.from(root.querySelectorAll('th')).map(th => th.textContent?.replace(/[▲▼↕]/g, ''))).toEqual(['Name', 'Role', 'Tasks']);
  });

  it('draws one row per item, in the order given', async () => {
    const { column } = await table();
    expect(column(0)).toEqual(['Item 10', 'Item 2', 'Item 1']);
  });

  it('shows an empty value as an empty cell', async () => {
    const { column } = await table();
    expect(column(2)).toEqual(['3', '12', '']);
  });

  it('shapes a cell through the column format', async () => {
    const columns: SsTableColumn[] = [{ key: 'tasks', label: 'Tasks', format: (value, row) => `${value ?? 0} for ${row.name}` }];
    const { column } = await table('', ROWS, columns);

    expect(column(0)).toEqual(['3 for Item 10', '12 for Item 2', '0 for Item 1']);
  });

  it('aligns a column the way it asks', async () => {
    const { header, root } = await table();

    expect(header(2).className).toContain('ss-table__cell--end');
    expect(root.querySelector('tbody td:nth-child(3)')?.className).toContain('ss-table__cell--end');
  });

  it('says so when there are no rows, across every column', async () => {
    const { root } = await table('empty-text="Nobody yet"', []);
    const empty = root.querySelector('.ss-table__empty') as HTMLTableCellElement;

    expect(empty.textContent).toBe('Nobody yet');
    expect(empty.getAttribute('colspan')).toBe('3');
  });

  it('keeps a hidden caption for assistive technology', async () => {
    const { root } = await table('hide-caption');
    const caption = root.querySelector('caption')!;

    expect(caption.textContent).toBe('Team');
    expect(caption.className).toContain('ss-table__caption--hidden');
  });
});

describe('ss-table sorting', () => {
  it('makes a sortable header a button, and leaves the others as text', async () => {
    const { header } = await table();

    expect(header(0).querySelector('button')?.textContent).toContain('Name');
    expect(header(1).querySelector('button')).toBeNull();
  });

  it('sorts ascending on the first press and says so on the header', async () => {
    const { root, column, header, press } = await table();
    const sorts: unknown[] = [];
    root.addEventListener('ssSort', event => sorts.push((event as CustomEvent).detail));

    await press(0);

    // Natural order: "Item 2" before "Item 10".
    expect(column(0)).toEqual(['Item 1', 'Item 2', 'Item 10']);
    expect(header(0).getAttribute('aria-sort')).toBe('ascending');
    expect(header(2).hasAttribute('aria-sort')).toBe(false);
    expect(sorts).toEqual([{ xId: undefined, key: 'name', direction: 'ascending' }]);
  });

  it('reverses on a second press', async () => {
    const { column, header, press } = await table();

    await press(0);
    await press(0);

    expect(column(0)).toEqual(['Item 10', 'Item 2', 'Item 1']);
    expect(header(0).getAttribute('aria-sort')).toBe('descending');
  });

  it('sorts numbers as numbers, with empty cells last either way', async () => {
    const { column, press } = await table();

    await press(2);
    expect(column(2)).toEqual(['3', '12', '']);

    await press(2);
    expect(column(2)).toEqual(['12', '3', '']);
  });

  it('starts sorted when told to', async () => {
    const { column, header } = await table('sort-key="tasks" sort-direction="descending"');

    expect(column(2)).toEqual(['12', '3', '']);
    expect(header(2).getAttribute('aria-sort')).toBe('descending');
  });

  it('with manual sorting, reports the request and keeps the order it was given', async () => {
    const { root, column, header, press } = await table('manual-sort');
    const sorts: unknown[] = [];
    root.addEventListener('ssSort', event => sorts.push((event as CustomEvent).detail));

    await press(0);

    expect(column(0)).toEqual(['Item 10', 'Item 2', 'Item 1']);
    expect(header(0).getAttribute('aria-sort')).toBe('ascending');
    expect(sorts).toEqual([{ xId: undefined, key: 'name', direction: 'ascending' }]);
  });

  it('never reorders the array it was given', async () => {
    const rows = [...ROWS];
    const { press } = await table('', rows);

    await press(0);

    expect(rows.map(row => row.name)).toEqual(['Item 10', 'Item 2', 'Item 1']);
  });
});
