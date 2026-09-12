import { newSpecPage } from '@stencil/core/testing';
import { SsCheckboxGroup } from '../ss-checkbox-group';
import { SsCheckbox } from '../../../atoms/ss-checkbox/ss-checkbox';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot } from '../../../../test/utils';

const components = [SsCheckboxGroup, SsCheckbox, SsTypography];

/** The group coordinates its checkboxes after its own render, one tick later. */
async function group(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

const THREE = `
  <ss-checkbox value="a">A</ss-checkbox>
  <ss-checkbox value="b">B</ss-checkbox>
  <ss-checkbox value="c">C</ss-checkbox>
`;

type Page = Awaited<ReturnType<typeof group>>;

/** The coordinated choices, excluding the master the group renders itself. */
function choices(page: Page) {
  return Array.from(getRoot(page).querySelectorAll('ss-checkbox:not(.ss-checkbox-group__master) input')) as HTMLInputElement[];
}

function master(page: Page) {
  return getRoot(page).querySelector('.ss-checkbox-group__master input') as HTMLInputElement | null;
}

async function setValue(page: Page, value: string[]) {
  (getRoot(page) as unknown as { value: string[] }).value = value;
  await page.waitForChanges();
}

describe('ss-checkbox-group semantics', () => {
  it('exposes the container as a group, not a radio group', async () => {
    const page = await group(`<ss-checkbox-group>${THREE}</ss-checkbox-group>`);
    const container = getRoot(page).querySelector('[role]');

    expect(container?.getAttribute('role')).toBe('group');
  });

  it('labels the group with an element the container points at', async () => {
    const page = await group(`<ss-checkbox-group label="Choices">${THREE}</ss-checkbox-group>`);
    const root = getRoot(page);
    const labelledBy = root.querySelector('[role="group"]')?.getAttribute('aria-labelledby');

    expect(root.querySelector(`#${labelledBy}`)?.textContent).toContain('Choices');
  });

  it('describes the group with the helper first and the error second', async () => {
    const page = await group(`<ss-checkbox-group invalid helper-text="Helper" error-text="Error">${THREE}</ss-checkbox-group>`);
    const root = getRoot(page);
    const ids = root.querySelector('[role="group"]')?.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(ids).toHaveLength(2);
    expect(root.querySelector(`#${ids[0]}`)?.textContent).toContain('Helper');
    expect(root.querySelector(`#${ids[1]}`)?.textContent).toContain('Error');
  });

  it('hides the error until the group is invalid', async () => {
    const page = await group(`<ss-checkbox-group error-text="Pick one">${THREE}</ss-checkbox-group>`);
    expect(getRoot(page).textContent).not.toContain('Pick one');

    getRoot(page).setAttribute('invalid', '');
    await page.waitForChanges();
    expect(getRoot(page).textContent).toContain('Pick one');
  });
});

describe('ss-checkbox-group selection', () => {
  it('checks the boxes whose values are in the aggregate', async () => {
    const page = await group(`<ss-checkbox-group>${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a', 'c']);

    expect(choices(page).map(input => input.checked)).toEqual([true, false, true]);
  });

  it('adds a value when a box is checked', async () => {
    const page = await group(`<ss-checkbox-group>${THREE}</ss-checkbox-group>`);
    const b = choices(page)[1];
    b.checked = true;
    b.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((getRoot(page) as unknown as { value: string[] }).value).toEqual(['b']);
  });

  it('removes a value when a box is unchecked', async () => {
    const page = await group(`<ss-checkbox-group>${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a', 'b']);

    const a = choices(page)[0];
    a.checked = false;
    a.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((getRoot(page) as unknown as { value: string[] }).value).toEqual(['b']);
  });

  it('emits the whole selection, not the box that changed', async () => {
    const page = await group(`<ss-checkbox-group name="cb">${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a']);

    const root = getRoot(page);
    const details: unknown[] = [];
    root.addEventListener('ssChange', (event: Event) => {
      if (event.target === root) details.push((event as CustomEvent).detail);
    });

    const c = choices(page)[2];
    c.checked = true;
    c.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect(details).toEqual([{ xId: undefined, name: 'cb', value: ['a', 'c'] }]);
  });

  it('leaves a checkbox without a value uncoordinated', async () => {
    const page = await group(`<ss-checkbox-group><ss-checkbox>No value</ss-checkbox></ss-checkbox-group>`);
    const box = choices(page)[0];
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((getRoot(page) as unknown as { value: string[] }).value).toEqual([]);
  });
});

describe('ss-checkbox-group coordination', () => {
  it('gives every checkbox the shared name', async () => {
    const page = await group(`<ss-checkbox-group name="cb">${THREE}</ss-checkbox-group>`);
    expect(choices(page).map(input => input.name)).toEqual(['cb', 'cb', 'cb']);
  });

  it('disables every checkbox with the group', async () => {
    const page = await group(`<ss-checkbox-group disabled>${THREE}</ss-checkbox-group>`);
    expect(choices(page).every(input => input.disabled)).toBe(true);
  });

  it('requires the group only while nothing is selected', async () => {
    const page = await group(`<ss-checkbox-group required>${THREE}</ss-checkbox-group>`);
    expect(choices(page).map(input => input.required)).toEqual([true, false, false]);

    await setValue(page, ['c']);

    // Any selection satisfies the group, so the requirement is lifted.
    expect(choices(page).some(input => input.required)).toBe(false);
  });
});

describe('ss-checkbox-group select-all master', () => {
  it('renders no master unless a label is supplied', async () => {
    const page = await group(`<ss-checkbox-group>${THREE}</ss-checkbox-group>`);
    expect(master(page)).toBeNull();
  });

  it('is unchecked and determinate when nothing is selected', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All">${THREE}</ss-checkbox-group>`);
    expect(master(page)?.checked).toBe(false);
    expect(master(page)?.indeterminate).toBe(false);
  });

  it('is indeterminate when only some are selected', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All">${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a']);

    expect(master(page)?.checked).toBe(false);
    expect(master(page)?.indeterminate).toBe(true);
  });

  it('is checked when every choice is selected', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All">${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a', 'b', 'c']);

    expect(master(page)?.checked).toBe(true);
    expect(master(page)?.indeterminate).toBe(false);
  });

  it('selects every choice when checked', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All">${THREE}</ss-checkbox-group>`);
    const box = master(page) as HTMLInputElement;
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((getRoot(page) as unknown as { value: string[] }).value).toEqual(['a', 'b', 'c']);
  });

  it('clears the selection when unchecked', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All">${THREE}</ss-checkbox-group>`);
    await setValue(page, ['a', 'b', 'c']);

    const box = master(page) as HTMLInputElement;
    box.checked = false;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((getRoot(page) as unknown as { value: string[] }).value).toEqual([]);
  });

  it('ignores a disabled choice, and keeps the value it already had', async () => {
    const page = await group(`
      <ss-checkbox-group select-all-label="All">
        <ss-checkbox value="a">A</ss-checkbox>
        <ss-checkbox value="b" disabled>B</ss-checkbox>
      </ss-checkbox-group>
    `);
    await setValue(page, ['b']);

    // Only "a" is selectable, so selecting all must not claim to have chosen "b"
    // afresh, nor drop it.
    const box = master(page) as HTMLInputElement;
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect(((getRoot(page) as unknown as { value: string[] }).value ?? []).sort()).toEqual(['a', 'b']);
  });

  it('reflects only the selectable choices in its own state', async () => {
    const page = await group(`
      <ss-checkbox-group select-all-label="All">
        <ss-checkbox value="a">A</ss-checkbox>
        <ss-checkbox value="b" disabled>B</ss-checkbox>
      </ss-checkbox-group>
    `);
    await setValue(page, ['a']);

    expect(master(page)?.checked).toBe(true);
    expect(master(page)?.indeterminate).toBe(false);
  });

  it('stays unchecked when the group has no choices at all', async () => {
    const page = await group(`<ss-checkbox-group select-all-label="All"></ss-checkbox-group>`);
    expect(master(page)?.checked).toBe(false);
    expect(master(page)?.indeterminate).toBe(false);
  });
});
