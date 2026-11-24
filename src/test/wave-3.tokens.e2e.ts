import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

const PARTS = {
  badge: '.ss-badge',
  link: '.ss-link',
  divider: '.ss-divider__label',
  tooltip: '.ss-tooltip__content',
  typography: '.ss-typography',
  avatar: '.ss-avatar',
};

async function page(extraCss: string) {
  const p = await newTestPage();
  await p.setContent(
    [
      '<ss-badge data-case="badge" label="B"></ss-badge>',
      '<ss-link data-case="link" href="#x" label="L"></ss-link>',
      '<ss-divider data-case="divider" label="D"></ss-divider>',
      '<ss-tooltip data-case="tooltip" content="T"><button>t</button></ss-tooltip>',
      '<ss-typography data-case="typography" font-weight="medium">Y</ss-typography>',
      '<ss-avatar data-case="avatar" initials="A"></ss-avatar>',
    ].join(''),
  );
  await useTokens(p);
  const measure = async () => {
    const all = await computedParts(p, PARTS, undefined, { sized: ['avatar'] });
    return Object.fromEntries(
      Object.entries(all)
        .filter(([key]) => key.split('/')[0] === key.split('/')[1])
        .map(([key, v]) => [key.split('/')[0], v]),
    );
  };
  const before = await measure();
  await p.addStyleTag({ content: extraCss });
  await p.waitForChanges();
  return { before, after: await measure() };
}

const changed = (before: Record<string, Record<string, string>>, after: Record<string, Record<string, string>>, prop: string) =>
  Object.keys(before)
    .filter(key => before[key][prop] !== after[key][prop])
    .sort();

describe('wave 3 component tokens', () => {
  it('a component token moves only its component', async () => {
    const { before, after } = await page(':root { --ss-badge-font-weight: 900; }');
    expect(after.badge['font-weight']).toBe('900');
    expect(changed(before, after, 'font-weight')).toEqual(['badge']);
  });

  it('a typographic role reaches every component set in it', async () => {
    const { before, after } = await page(':root { --ss-type-weight-medium: 900; }');
    expect(changed(before, after, 'font-weight')).toEqual(['badge', 'divider', 'link', 'tooltip', 'typography']);
  });

  it('a spacing role reaches every component spaced with it', async () => {
    const { before, after } = await page(':root { --ss-space-10: 50px; }');
    expect(after.avatar.width).toBe('50px');
    expect(changed(before, after, 'width')).toEqual(['avatar']);
  });
});
