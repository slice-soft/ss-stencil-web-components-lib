import { newTestPage } from '../../../../test/utils';

// The separator is written as an entity: the page `setContent` builds declares
// no charset, so a literal non-ASCII character arrives mis-decoded.
const TRAIL = `
  <ss-breadcrumb accessibility-label="You are here" separator="&rsaquo;">
    <ss-breadcrumb-item href="/">Home</ss-breadcrumb-item>
    <ss-breadcrumb-item href="/docs">Docs</ss-breadcrumb-item>
    <ss-breadcrumb-item>Components</ss-breadcrumb-item>
  </ss-breadcrumb>
`;

/** The trail as assistive technology sees it: roles and names, in order. */
async function axTrail(page: Awaited<ReturnType<typeof newTestPage>>) {
  const snapshot: any = await (page as any).accessibility.snapshot({ interestingOnly: false });
  const flat: any[] = [];
  const walk = (node: any) => {
    flat.push(node);
    (node.children ?? []).forEach(walk);
  };
  walk(snapshot);
  return flat;
}

describe('ss-breadcrumb', () => {
  it('is announced as a named list of steps', async () => {
    const page = await newTestPage();
    await page.setContent(TRAIL);
    await page.waitForChanges();

    const nodes = await axTrail(page);
    expect(nodes.find(node => node.role === 'navigation')?.name).toBe('You are here');
    expect(nodes.filter(node => node.role === 'listitem')).toHaveLength(3);
  });

  it('offers links for the steps behind, and none for the page itself', async () => {
    const page = await newTestPage();
    await page.setContent(TRAIL);
    await page.waitForChanges();

    const nodes = await axTrail(page);
    expect(nodes.filter(node => node.role === 'link').map(node => node.name)).toEqual(['Home', 'Docs']);
  });

  it('hides the separators from assistive technology', async () => {
    const page = await newTestPage();
    await page.setContent(TRAIL);
    await page.waitForChanges();

    const nodes = await axTrail(page);
    // The separator is decoration; hearing "slash" between every step is noise.
    expect(nodes.some(node => (node.name ?? '').includes('›'))).toBe(false);

    const drawn = await page.evaluate(() => Array.from(document.querySelectorAll('.ss-breadcrumb-item__separator')).map(el => el.textContent));
    expect(drawn).toEqual(['›', '›']);
  });

  it('re-marks the current page when a step is appended', async () => {
    const page = await newTestPage();
    await page.setContent(TRAIL);
    await page.waitForChanges();

    await page.evaluate(() => {
      const added = document.createElement('ss-breadcrumb-item');
      added.textContent = 'Buttons';
      document.querySelector('ss-breadcrumb')!.appendChild(added);
      document.querySelector('ss-breadcrumb')!.setAttribute('size', 'sm');
    });
    await page.waitForChanges();

    const current = await page.evaluate(() => document.querySelector('[aria-current="page"]')?.textContent?.trim());
    expect(current).toBe('Buttons');

    const links = (await axTrail(page)).filter(node => node.role === 'link').map(node => node.name);
    expect(links).toEqual(['Home', 'Docs']);
  });
});
