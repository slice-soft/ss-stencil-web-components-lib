import { newSpecPage } from '@stencil/core/testing';
import { SsTabs } from '../ss-tabs';
import { SsTab } from '../../ss-tab/ss-tab';
import { getRoot } from '../../../../test/utils';

const TABS = `
  <ss-tabs>
    <ss-tab value="account" label="Account">Account settings</ss-tab>
    <ss-tab value="password" label="Password">Password settings</ss-tab>
    <ss-tab value="billing" label="Billing" disabled>Billing settings</ss-tab>
  </ss-tabs>
`;

async function tabs(html = TABS) {
  const page = await newSpecPage({ components: [SsTabs, SsTab], html });
  await page.waitForChanges();
  const root = getRoot(page) as HTMLElement & { value?: string };
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('.ss-tabs__tab')).filter(b => b.closest('ss-tabs') === root);
  const panels = () => Array.from(root.querySelectorAll<HTMLElement>('.ss-tab')).filter(p => p.closest('ss-tabs') === root);
  return { page, root, buttons, panels };
}

describe('ss-tabs rendering', () => {
  it('draws a tab list with one tab per panel, named by its label', async () => {
    const { root, buttons } = await tabs();

    expect(root.querySelector('.ss-tabs__list')?.getAttribute('role')).toBe('tablist');
    expect(buttons().map(b => b.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
    expect(buttons().map(b => b.textContent)).toEqual(['Account', 'Password', 'Billing']);
  });

  it('selects the first tab when no value is given, and makes only it a tab stop', async () => {
    const { buttons } = await tabs();

    expect(buttons().map(b => b.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(buttons().map(b => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('ties each tab to its panel, both ways', async () => {
    const { buttons, panels } = await tabs();
    const [tab] = buttons();
    const [panel] = panels();

    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('shows only the selected panel', async () => {
    const { panels } = await tabs();
    expect(panels().map(p => p.hasAttribute('hidden'))).toEqual([false, true, true]);
  });

  it('marks a disabled tab disabled', async () => {
    const { buttons } = await tabs();
    expect(buttons().map(b => b.hasAttribute('disabled'))).toEqual([false, false, true]);
  });

  it('states its orientation', async () => {
    const { root } = await tabs(TABS.replace('<ss-tabs>', '<ss-tabs orientation="vertical">'));
    expect(root.querySelector('.ss-tabs__list')?.getAttribute('aria-orientation')).toBe('vertical');
  });
});

describe('ss-tabs selection', () => {
  it('selects by value', async () => {
    const { buttons, panels } = await tabs(TABS.replace('<ss-tabs>', '<ss-tabs value="password">'));

    expect(buttons().map(b => b.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(panels().map(p => p.hasAttribute('hidden'))).toEqual([true, false, true]);
  });

  it('never selects a disabled tab, even by value', async () => {
    const { buttons } = await tabs(TABS.replace('<ss-tabs>', '<ss-tabs value="billing">'));
    expect(buttons()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('skips a disabled first tab when choosing the default', async () => {
    const { buttons } = await tabs(TABS.replace('value="account" label="Account"', 'value="account" label="Account" disabled'));
    expect(buttons().map(b => b.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('selects a tab that is pressed, and reports it', async () => {
    const { page, root, buttons } = await tabs();
    const changes: string[] = [];
    root.addEventListener('ssChange', event => changes.push((event as CustomEvent).detail.value));

    buttons()[1].click();
    await page.waitForChanges();

    expect(root.value).toBe('password');
    expect(changes).toEqual(['password']);
    expect(buttons()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('does not report pressing the tab that is already selected', async () => {
    const { page, root, buttons } = await tabs();
    const changes: string[] = [];
    root.addEventListener('ssChange', event => changes.push((event as CustomEvent).detail.value));

    buttons()[0].click();
    await page.waitForChanges();

    expect(changes).toEqual([]);
  });

  it('identifies a tab with no value by its position', async () => {
    const { page, root, buttons } = await tabs(`<ss-tabs><ss-tab label="One">1</ss-tab><ss-tab label="Two">2</ss-tab></ss-tabs>`);
    const changes: string[] = [];
    root.addEventListener('ssChange', event => changes.push((event as CustomEvent).detail.value));

    buttons()[1].click();
    await page.waitForChanges();

    expect(changes).toEqual(['1']);
  });
});

describe('ss-tabs keeping up with its tabs', () => {
  it('redraws the tab list when a label changes', async () => {
    const { page, root, buttons } = await tabs();

    (root.querySelector('ss-tab') as HTMLElement & { label: string }).label = 'Profile';
    await page.waitForChanges();

    expect(buttons()[0].textContent).toBe('Profile');
  });

  it('does not claim the panels of a tab set nested inside it', async () => {
    const { buttons } = await tabs(`
      <ss-tabs>
        <ss-tab label="Outer one">
          <ss-tabs><ss-tab label="Inner one">a</ss-tab><ss-tab label="Inner two">b</ss-tab></ss-tabs>
        </ss-tab>
        <ss-tab label="Outer two">c</ss-tab>
      </ss-tabs>
    `);

    expect(buttons().map(b => b.textContent)).toEqual(['Outer one', 'Outer two']);
  });
});
