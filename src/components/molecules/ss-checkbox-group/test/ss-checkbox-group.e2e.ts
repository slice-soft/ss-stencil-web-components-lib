import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { axNodeByRole } from '../../../../test/utils';

const GROUP = `
  <ss-checkbox-group name="topics" label="Topics" helper-text="Pick what interests you">
    <ss-checkbox value="a">A</ss-checkbox>
    <ss-checkbox value="b">B</ss-checkbox>
    <ss-checkbox value="c">C</ss-checkbox>
  </ss-checkbox-group>
`;

async function recordChanges(page: E2EPage) {
  await page.evaluate(() => {
    (window as any).seen = [];
    document.querySelector('ss-checkbox-group')!.addEventListener('ssChange', (event: Event) => {
      (window as any).seen.push({ from: (event.target as HTMLElement).tagName.toLowerCase(), detail: (event as CustomEvent).detail });
    });
  });
}

async function seen(page: E2EPage) {
  return page.evaluate(() => (window as any).seen);
}

async function groupValue(page: E2EPage) {
  return page.evaluate(() => (document.querySelector('ss-checkbox-group') as any).value);
}

describe('ss-checkbox-group event boundary', () => {
  it('is observed once, carrying the whole selection', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();
    await recordChanges(page);

    await (await page.find('ss-checkbox[value="a"] input')).click();
    await (await page.find('ss-checkbox[value="c"] input')).click();
    await page.waitForChanges();

    expect(await seen(page)).toEqual([
      { from: 'ss-checkbox-group', detail: { name: 'topics', value: ['a'] } },
      { from: 'ss-checkbox-group', detail: { name: 'topics', value: ['a', 'c'] } },
    ]);
  });

  it('still delivers its own event to a listener on the checkbox', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    await page.evaluate(() => {
      (window as any).fromChild = null;
      document.querySelector('ss-checkbox[value="b"]')!.addEventListener('ssChange', (event: Event) => {
        (window as any).fromChild = (event as CustomEvent).detail;
      });
    });

    await (await page.find('ss-checkbox[value="b"] input')).click();
    await page.waitForChanges();

    expect(await page.evaluate(() => (window as any).fromChild)).toEqual({ name: 'topics', value: 'b', checked: true });
  });
});

describe('ss-checkbox-group native behaviour', () => {
  it('submits every selected value under the shared name', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form>${GROUP}</form>`);
    await page.waitForChanges();

    await (await page.find('ss-checkbox[value="a"] input')).click();
    await (await page.find('ss-checkbox[value="c"] input')).click();
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).getAll('topics'));
    expect(submitted).toEqual(['a', 'c']);
  });

  it('requires a selection, and is satisfied by any of them', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form>${GROUP.replace('name="topics"', 'name="topics" required')}</form>`);
    await page.waitForChanges();

    const before = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(before).toBe(false);

    // The third box, not the one carrying the native requirement.
    await (await page.find('ss-checkbox[value="c"] input')).click();
    await page.waitForChanges();

    const after = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(after).toBe(true);
  });
});

describe('ss-checkbox-group select-all master', () => {
  const WITH_MASTER = GROUP.replace('label="Topics"', 'label="Topics" select-all-label="Select all"');

  it('selects and clears every choice', async () => {
    const page = await newE2EPage();
    await page.setContent(WITH_MASTER);
    await page.waitForChanges();

    const master = await page.find('.ss-checkbox-group__master input');
    await master.click();
    await page.waitForChanges();
    expect(await groupValue(page)).toEqual(['a', 'b', 'c']);

    await master.click();
    await page.waitForChanges();
    expect(await groupValue(page)).toEqual([]);
  });

  it('shows a mixed selection as indeterminate', async () => {
    const page = await newE2EPage();
    await page.setContent(WITH_MASTER);
    await page.waitForChanges();

    await (await page.find('ss-checkbox[value="b"] input')).click();
    await page.waitForChanges();

    const state = await page.evaluate(() => {
      const input = document.querySelector('.ss-checkbox-group__master input') as HTMLInputElement;
      return { checked: input.checked, indeterminate: input.indeterminate };
    });
    expect(state).toEqual({ checked: false, indeterminate: true });
  });

  it('becomes checked once the last choice is selected by hand', async () => {
    const page = await newE2EPage();
    await page.setContent(WITH_MASTER);
    await page.waitForChanges();

    for (const value of ['a', 'b', 'c']) {
      await (await page.find(`ss-checkbox[value="${value}"] input`)).click();
    }
    await page.waitForChanges();

    const state = await page.evaluate(() => {
      const input = document.querySelector('.ss-checkbox-group__master input') as HTMLInputElement;
      return { checked: input.checked, indeterminate: input.indeterminate };
    });
    expect(state).toEqual({ checked: true, indeterminate: false });
  });
});

describe('ss-checkbox-group accessibility', () => {
  it('names and describes the group', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'group')).toEqual({ name: 'Topics', description: 'Pick what interests you' });
  });

  it('adds the error to the group description once invalid', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP.replace('helper-text=', 'error-text="Pick at least one" helper-text='));
    await page.waitForChanges();

    const group = await page.find('ss-checkbox-group');
    group.setAttribute('invalid', '');
    await page.waitForChanges();

    const settled = await axNodeByRole(page, 'group', node => node.description === 'Pick what interests you Pick at least one');
    expect(settled.description).toBe('Pick what interests you Pick at least one');
  });
});
