import { newSpecPage } from '@stencil/core/testing';
import { SsDropdown } from '../ss-dropdown';
import { SsDropdownItem } from '../../ss-dropdown-item/ss-dropdown-item';
import { SsButton } from '../../../atoms/ss-button/ss-button';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsDropdown, SsDropdownItem, SsButton];

const MENU = `
  <ss-dropdown>
    <ss-button slot="trigger" label="Actions"></ss-button>
    <ss-dropdown-item value="edit">Edit</ss-dropdown-item>
    <ss-dropdown-item label="Duplicate"></ss-dropdown-item>
    <ss-dropdown-item value="archive" disabled>Archive</ss-dropdown-item>
    <ss-dropdown-item>Delete</ss-dropdown-item>
  </ss-dropdown>
`;

async function dropdown(html = MENU) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

const menuOf = (root: HTMLElement) => root.querySelector('.ss-dropdown__menu') as HTMLElement;

describe('ss-dropdown rendering', () => {
  it('is hidden until it is opened', async () => {
    const page = await dropdown();
    expect(menuOf(getRoot(page)).hasAttribute('hidden')).toBe(true);

    getRoot(page).setAttribute('open', '');
    await page.waitForChanges();

    expect(menuOf(getRoot(page)).hasAttribute('hidden')).toBe(false);
  });

  it('is a menu of menu items, none of them a tab stop', async () => {
    const page = await dropdown();
    const items = Array.from(getRoot(page).querySelectorAll('ss-dropdown-item'));

    expect(menuOf(getRoot(page)).getAttribute('role')).toBe('menu');
    expect(items.map(item => item.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem']);
    expect(items.map(item => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '-1']);
  });

  it('marks a disabled item as such', async () => {
    const page = await dropdown();
    expect(getRoot(page).querySelector('ss-dropdown-item[value="archive"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(getRoot(page).querySelector('ss-dropdown-item[value="edit"]')?.hasAttribute('aria-disabled')).toBe(false);
  });

  it('is named after the trigger that opens it', async () => {
    const page = await dropdown();
    expect(menuOf(getRoot(page)).getAttribute('aria-label')).toBe('Actions');
  });

  it('takes a stated name over the trigger label', async () => {
    const page = await dropdown(MENU.replace('<ss-dropdown>', '<ss-dropdown accessibility-label="File actions">'));
    expect(menuOf(getRoot(page)).getAttribute('aria-label')).toBe('File actions');
  });

  it('is named from the text of a native trigger', async () => {
    const page = await dropdown(MENU.replace('<ss-button slot="trigger" label="Actions"></ss-button>', '<button slot="trigger">More</button>'));
    expect(menuOf(getRoot(page)).getAttribute('aria-label')).toBe('More');
  });
});

describe('ss-dropdown trigger', () => {
  it('tells an ss-button trigger that it opens a menu, and whether it is open', async () => {
    const page = await dropdown();
    const button = getShadowRoot(getRoot(page).querySelector('ss-button')!).querySelector('button')!;

    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    getRoot(page).setAttribute('open', '');
    await page.waitForChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('stays closed while disabled', async () => {
    const page = await dropdown(MENU.replace('<ss-dropdown>', '<ss-dropdown open disabled>'));
    expect(menuOf(getRoot(page)).hasAttribute('hidden')).toBe(true);
  });
});

describe('ss-dropdown selection', () => {
  async function pick(value: string) {
    const page = await dropdown(MENU.replace('<ss-dropdown>', '<ss-dropdown open>'));
    const root = getRoot(page) as HTMLElement & { open: boolean };
    const picked: string[] = [];
    root.addEventListener('ssSelect', event => picked.push((event as CustomEvent).detail.value));

    const items = Array.from(root.querySelectorAll<HTMLElement>('ss-dropdown-item'));
    items.find(item => item.textContent?.trim() === value || item.getAttribute('label') === value)!.click();
    await page.waitForChanges();

    return { root, picked };
  }

  it('reports the value of the item pressed, and closes', async () => {
    const { root, picked } = await pick('Edit');

    expect(picked).toEqual(['edit']);
    expect(root.open).toBe(false);
  });

  it('falls back to the label, then the text, for an item with no value', async () => {
    expect((await pick('Duplicate')).picked).toEqual(['Duplicate']);
    expect((await pick('Delete')).picked).toEqual(['Delete']);
  });

  it('ignores a disabled item, and stays open', async () => {
    const { root, picked } = await pick('Archive');

    expect(picked).toEqual([]);
    expect(root.open).toBe(true);
  });
});
