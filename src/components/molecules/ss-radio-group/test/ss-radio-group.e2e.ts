import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { axNodeByRole } from '../../../../test/utils';

const GROUP = `
  <ss-radio-group name="plan" label="Choose a plan" helper-text="You can change it later">
    <ss-radio value="free">Free</ss-radio>
    <ss-radio value="pro">Pro</ss-radio>
    <ss-radio value="team">Team</ss-radio>
  </ss-radio-group>
`;

/** Records every ssChange seen at the group, tagged with what dispatched it. */
async function recordChanges(page: E2EPage) {
  await page.evaluate(() => {
    (window as any).seen = [];
    document.querySelector('ss-radio-group')!.addEventListener('ssChange', (event: Event) => {
      (window as any).seen.push({ from: (event.target as HTMLElement).tagName.toLowerCase(), detail: (event as CustomEvent).detail });
    });
  });
}

async function seen(page: E2EPage) {
  return page.evaluate(() => (window as any).seen);
}

describe('ss-radio-group event boundary', () => {
  it('is observed once, with the group payload', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();
    await recordChanges(page);

    const pro = await page.find('ss-radio[value="pro"] input');
    await pro.click();
    await page.waitForChanges();

    // The radio's own checked transition must not surface here as well.
    expect(await seen(page)).toEqual([{ from: 'ss-radio-group', detail: { name: 'plan', value: 'pro' } }]);
  });

  it('still delivers its own event to a listener on the radio', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    await page.evaluate(() => {
      (window as any).fromRadio = null;
      document.querySelector('ss-radio[value="pro"]')!.addEventListener('ssChange', (event: Event) => {
        (window as any).fromRadio = (event as CustomEvent).detail;
      });
    });

    const pro = await page.find('ss-radio[value="pro"] input');
    await pro.click();
    await page.waitForChanges();

    expect(await page.evaluate(() => (window as any).fromRadio)).toEqual({ name: 'plan', value: 'pro', checked: true });
  });
});

describe('ss-radio-group native behaviour', () => {
  it('moves the selection with the arrow keys', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();
    await recordChanges(page);

    const free = await page.find('ss-radio[value="free"] input');
    await free.click();
    await free.press('ArrowDown');
    await page.waitForChanges();

    const group = await page.find('ss-radio-group');
    expect(group.getAttribute('value')).toBe('pro');
    expect((await seen(page)).map((entry: any) => entry.detail.value)).toEqual(['free', 'pro']);
  });

  it('submits the selected value under the shared name', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form>${GROUP}</form>`);
    await page.waitForChanges();

    const team = await page.find('ss-radio[value="team"] input');
    await team.click();
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('plan'));
    expect(submitted).toBe('team');
  });

  it('requires a selection through native validation', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form>${GROUP.replace('name="plan"', 'name="plan" required')}</form>`);
    await page.waitForChanges();

    const before = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(before).toBe(false);

    const pro = await page.find('ss-radio[value="pro"] input');
    await pro.click();
    await page.waitForChanges();

    const after = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(after).toBe(true);
  });
});

describe('ss-radio-group accessibility', () => {
  it('names and describes the group', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'radiogroup')).toEqual({ name: 'Choose a plan', description: 'You can change it later' });
  });

  it('adds the error to the group description once invalid', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP.replace('helper-text=', 'error-text="Choose one" helper-text='));
    await page.waitForChanges();

    const group = await page.find('ss-radio-group');
    group.setAttribute('invalid', '');
    await page.waitForChanges();

    expect((await axNodeByRole(page, 'radiogroup', node => node.description === 'You can change it later Choose one')).description).toBe('You can change it later Choose one');
    const alert = await page.find('ss-radio-group [role="alert"]');
    expect(alert.textContent).toContain('Choose one');
  });
});
