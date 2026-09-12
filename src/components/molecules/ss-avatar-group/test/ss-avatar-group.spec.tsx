import { newSpecPage } from '@stencil/core/testing';
import { SsAvatarGroup } from '../ss-avatar-group';
import { SsAvatar } from '../../../atoms/ss-avatar/ss-avatar';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsAvatarGroup, SsAvatar];

async function group(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

const FOUR = `
  <ss-avatar initials="AB"></ss-avatar>
  <ss-avatar initials="CD"></ss-avatar>
  <ss-avatar initials="EF"></ss-avatar>
  <ss-avatar initials="GH"></ss-avatar>
`;

/** The avatars stay in the light DOM; the group's own markup is in its shadow root. */
function avatars(page: Awaited<ReturnType<typeof group>>) {
  return Array.from(getRoot(page).querySelectorAll('ss-avatar'));
}

function rendered(page: Awaited<ReturnType<typeof group>>) {
  return getShadowRoot(getRoot(page));
}

describe('ss-avatar-group presentation', () => {
  it('shares its size and shape with every avatar', async () => {
    const page = await group(`<ss-avatar-group size="lg" shape="square">${FOUR}</ss-avatar-group>`);
    const props = avatars(page) as unknown as Record<string, unknown>[];

    expect(props.map(avatar => avatar.size)).toEqual(['lg', 'lg', 'lg', 'lg']);
    expect(props.map(avatar => avatar.shape)).toEqual(['square', 'square', 'square', 'square']);
  });

  it('shows every avatar when no limit is set', async () => {
    const page = await group(`<ss-avatar-group>${FOUR}</ss-avatar-group>`);
    expect(avatars(page).filter(avatar => avatar.classList.contains('ss-avatar-group__hidden'))).toHaveLength(0);
    expect(rendered(page).querySelector('.ss-avatar-group__overflow')).toBeNull();
  });
});

describe('ss-avatar-group overflow', () => {
  it('hides the avatars past the limit and counts them', async () => {
    const page = await group(`<ss-avatar-group max="2">${FOUR}</ss-avatar-group>`);
    const hidden = avatars(page).map(avatar => avatar.classList.contains('ss-avatar-group__hidden'));

    expect(hidden).toEqual([false, false, true, true]);
    expect(rendered(page).querySelector('.ss-avatar-group__overflow')?.textContent).toBe('+2');
  });

  it('shows no count when the limit is not reached', async () => {
    const page = await group(`<ss-avatar-group max="10">${FOUR}</ss-avatar-group>`);
    expect(rendered(page).querySelector('.ss-avatar-group__overflow')).toBeNull();
  });

  it('ignores a limit of zero rather than hiding everything', async () => {
    const page = await group(`<ss-avatar-group max="0">${FOUR}</ss-avatar-group>`);
    expect(avatars(page).some(avatar => avatar.classList.contains('ss-avatar-group__hidden'))).toBe(false);
  });

  it('updates the count when the limit changes', async () => {
    const page = await group(`<ss-avatar-group max="3">${FOUR}</ss-avatar-group>`);
    expect(rendered(page).querySelector('.ss-avatar-group__overflow')?.textContent).toBe('+1');

    getRoot(page).setAttribute('max', '1');
    await page.waitForChanges();

    expect(rendered(page).querySelector('.ss-avatar-group__overflow')?.textContent).toBe('+3');
  });
});

describe('ss-avatar-group accessibility', () => {
  it('speaks as one image with a single name', async () => {
    const page = await group(`<ss-avatar-group accessibility-label="8 collaborators">${FOUR}</ss-avatar-group>`);
    const container = rendered(page).querySelector('.ss-avatar-group');

    expect(container?.getAttribute('role')).toBe('img');
    expect(container?.getAttribute('aria-label')).toBe('8 collaborators');
  });

  it('hides the individual avatars from assistive technology', async () => {
    const page = await group(`<ss-avatar-group accessibility-label="4 people">${FOUR}</ss-avatar-group>`);
    expect(avatars(page).every(avatar => avatar.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
