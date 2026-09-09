import { newE2EPage } from '@stencil/core/testing';
import { axNodeByRole } from '../../../../test/utils';

/** The overlap is expressed in tokens, which `setContent` does not load. */
const TOKENS = `<style>:root{
  --ss-sizing-negative-half: -50%;
  --ss-sizing-none: 0;
  --ss-dimensions-10: 40px;
}</style>`;

const GROUP = `
  <ss-avatar-group accessibility-label="4 collaborators" max="2">
    <ss-avatar initials="AB"></ss-avatar>
    <ss-avatar initials="CD"></ss-avatar>
    <ss-avatar initials="EF"></ss-avatar>
    <ss-avatar initials="GH"></ss-avatar>
  </ss-avatar-group>
`;

describe('ss-avatar-group', () => {
  it('renders only the avatars within the limit, plus a count', async () => {
    const page = await newE2EPage();
    await page.setContent(TOKENS + GROUP);
    await page.waitForChanges();

    const shown = await page.evaluate(() => Array.from(document.querySelectorAll('ss-avatar')).filter(avatar => getComputedStyle(avatar).display !== 'none').length);
    expect(shown).toBe(2);

    const overflow = await page.find('ss-avatar-group >>> .ss-avatar-group__overflow');
    expect(overflow.textContent).toBe('+2');
  });

  it('overlaps the avatars into a stack', async () => {
    const page = await newE2EPage();
    await page.setContent(TOKENS + GROUP);
    await page.waitForChanges();

    const margins = await page.evaluate(() =>
      Array.from(document.querySelectorAll('ss-avatar'))
        .slice(0, 2)
        .map(avatar => getComputedStyle(avatar).marginInlineStart),
    );
    // The first sits flush; the second tucks under it.
    expect(margins[0]).toBe('0px');
    expect(margins[1]).not.toBe('0px');
  });

  it('speaks as a single named image', async () => {
    const page = await newE2EPage();
    await page.setContent(TOKENS + GROUP);
    await page.waitForChanges();

    expect((await axNodeByRole(page, 'image')).name).toBe('4 collaborators');
  });
});
