import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const NAV = `
  <button id="before">Before</button>
  <ss-nav value="#overview" accessibility-label="Sections">
    <ss-nav-item href="#overview">Overview</ss-nav-item>
    <ss-nav-item href="#billing" disabled>Billing</ss-nav-item>
    <ss-nav-item href="#team">Team</ss-nav-item>
  </ss-nav>
`;

async function setup(html = NAV) {
  const page = await newTestPage();
  await page.setContent(html);
  await useTokens(page);
  return page;
}

const currentLink = (page: E2EPage) => page.$eval('a[aria-current="page"]', link => link.textContent?.trim());

describe('ss-nav from the keyboard', () => {
  it('is a row of ordinary tab stops, skipping a disabled item', async () => {
    const page = await setup();
    await page.focus('#before');

    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe('Overview');

    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe('Team');
  });
});

describe('ss-nav following a link', () => {
  it('follows an in-page link and moves the current page with it', async () => {
    const page = await setup();

    await page.click('ss-nav-item:last-child a');
    await page.waitForChanges();

    expect(await page.evaluate(() => location.hash)).toBe('#team');
    expect(await currentLink(page)).toBe('Team');
  });

  it('stays put when an app cancels ssChange to route on its own', async () => {
    const page = await setup();
    await page.evaluate(() => document.querySelector('ss-nav')!.addEventListener('ssChange', event => event.preventDefault()));

    await page.click('ss-nav-item:last-child a');
    await page.waitForChanges();

    expect(await page.evaluate(() => location.hash)).toBe('');
    expect(await currentLink(page)).toBe('Team');
  });
});

describe('ss-nav semantics', () => {
  it('is a navigation landmark with the name it was given', async () => {
    const page = await setup();
    expect((await axNodeByRole(page, 'navigation')).name).toBe('Sections');
  });

  it('exposes its items as links, the disabled one included', async () => {
    const page = await setup();

    expect(await axNodeNamed(page, 'link', 'Overview')).not.toBeNull();
    expect(await axNodeNamed(page, 'link', 'Billing')).not.toBeNull();
  });
});
