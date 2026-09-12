import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const TABS = `
  <button id="before">Before</button>
  <ss-tabs accessibility-label="Settings">
    <ss-tab value="account" label="Account">Account settings</ss-tab>
    <ss-tab value="password" label="Password">Password settings</ss-tab>
    <ss-tab value="billing" label="Billing" disabled>Billing settings</ss-tab>
    <ss-tab value="team" label="Team">Team settings</ss-tab>
  </ss-tabs>
  <button id="after">After</button>
`;

async function setup(html = TABS) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

async function press(page: E2EPage, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key as Parameters<E2EPage['keyboard']['press']>[0]);
  await page.waitForChanges();
}

/** Tabs into the tab list from the button before it. */
async function tabIn(page: E2EPage) {
  await page.focus('#before');
  await press(page, 'Tab');
}

function focused(page: E2EPage) {
  return page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    const role = active?.getAttribute('role');
    if (role === 'tab' || role === 'tabpanel') return `${role}:${active!.textContent!.trim()}`;
    return `#${active?.id}`;
  });
}

const selected = (page: E2EPage) => page.$eval('ss-tabs', el => (el as HTMLElement & { value?: string }).value);

describe('ss-tabs in the tab order', () => {
  it('is one stop: Tab lands on the selected tab', async () => {
    const page = await setup();
    await tabIn(page);

    expect(await focused(page)).toBe('tab:Account');
  });

  it('goes from the tab list straight into the panel', async () => {
    const page = await setup();
    await tabIn(page);
    await press(page, 'Tab');

    expect(await focused(page)).toBe('tabpanel:Account settings');
  });
});

describe('ss-tabs with the arrow keys', () => {
  it('moves and shows as it goes, skipping a disabled tab and wrapping', async () => {
    const page = await setup();
    await tabIn(page);

    await press(page, 'ArrowRight');
    expect(await focused(page)).toBe('tab:Password');
    expect(await selected(page)).toBe('password');

    await press(page, 'ArrowRight');
    expect(await focused(page)).toBe('tab:Team');

    await press(page, 'ArrowRight');
    expect(await focused(page)).toBe('tab:Account');

    await press(page, 'ArrowLeft');
    expect(await focused(page)).toBe('tab:Team');
    expect(await selected(page)).toBe('team');
  });

  it('jumps to the ends with Home and End', async () => {
    const page = await setup();
    await tabIn(page);

    await press(page, 'End');
    expect(await focused(page)).toBe('tab:Team');

    await press(page, 'Home');
    expect(await focused(page)).toBe('tab:Account');
  });

  it('with manual activation, moves without showing until Enter or Space', async () => {
    const page = await setup(TABS.replace('<ss-tabs ', '<ss-tabs activation="manual" '));
    await tabIn(page);

    await press(page, 'ArrowRight');
    expect(await focused(page)).toBe('tab:Password');
    expect(await selected(page)).toBeUndefined();

    await press(page, 'Enter');
    expect(await selected(page)).toBe('password');

    await press(page, 'ArrowRight', 'Space');
    expect(await selected(page)).toBe('team');
  });

  it('when vertical, uses Up and Down and leaves Left and Right alone', async () => {
    const page = await setup(TABS.replace('<ss-tabs ', '<ss-tabs orientation="vertical" '));
    await tabIn(page);

    await press(page, 'ArrowDown');
    expect(await focused(page)).toBe('tab:Password');

    await press(page, 'ArrowRight');
    expect(await focused(page)).toBe('tab:Password');
  });
});

describe('ss-tabs semantics', () => {
  it('exposes a named tab list whose selected tab is announced as selected', async () => {
    const page = await setup();

    expect((await axNodeByRole(page, 'tablist')).name).toBe('Settings');
    expect(await axNodeNamed(page, 'tab', 'Account', node => node.selected === true)).toMatchObject({ selected: true });
    expect((await axNodeNamed(page, 'tab', 'Password'))?.selected).toBeFalsy();
  });

  it('names the visible panel after its tab', async () => {
    const page = await setup(TABS.replace('<ss-tabs ', '<ss-tabs value="team" '));
    expect((await axNodeByRole(page, 'tabpanel')).name).toBe('Team');
  });
});
