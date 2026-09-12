import { newSpecPage } from '@stencil/core/testing';
import { SsBreadcrumb } from '../ss-breadcrumb';
import { SsBreadcrumbItem } from '../../ss-breadcrumb-item/ss-breadcrumb-item';
import { SsLink } from '../../../atoms/ss-link/ss-link';
import { getRoot } from '../../../../test/utils';

const components = [SsBreadcrumb, SsBreadcrumbItem, SsLink];

async function trail(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

type Page = Awaited<ReturnType<typeof trail>>;

const THREE = `
  <ss-breadcrumb-item href="/">Home</ss-breadcrumb-item>
  <ss-breadcrumb-item href="/docs">Docs</ss-breadcrumb-item>
  <ss-breadcrumb-item>Components</ss-breadcrumb-item>
`;

function items(page: Page) {
  return Array.from(getRoot(page).querySelectorAll('ss-breadcrumb-item')) as unknown as Record<string, unknown>[];
}

describe('ss-breadcrumb structure', () => {
  it('states the list roles, which custom elements do not inherit', async () => {
    const page = await trail(`<ss-breadcrumb>${THREE}</ss-breadcrumb>`);
    const root = getRoot(page);

    expect(root.querySelector('ol')?.getAttribute('role')).toBe('list');
    expect(Array.from(root.querySelectorAll('ss-breadcrumb-item')).map(item => item.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem']);
  });

  it('names the trail so two on one page stay navigable', async () => {
    const page = await trail(`<ss-breadcrumb accessibility-label="You are here">${THREE}</ss-breadcrumb>`);
    expect(getRoot(page).querySelector('nav')?.getAttribute('aria-label')).toBe('You are here');
  });
});

describe('ss-breadcrumb coordination', () => {
  it('marks only the final step as the last', async () => {
    const page = await trail(`<ss-breadcrumb>${THREE}</ss-breadcrumb>`);
    expect(items(page).map(item => item.last)).toEqual([false, false, true]);
  });

  it('shares its separator and size with every step', async () => {
    const page = await trail(`<ss-breadcrumb separator="›" size="lg">${THREE}</ss-breadcrumb>`);
    expect(items(page).map(item => item.separator)).toEqual(['›', '›', '›']);
    expect(items(page).map(item => item.size)).toEqual(['lg', 'lg', 'lg']);
  });

  it('moves the last mark when a step is appended', async () => {
    const page = await trail(`<ss-breadcrumb>${THREE}</ss-breadcrumb>`);
    const added = page.doc.createElement('ss-breadcrumb-item');
    added.textContent = 'Buttons';
    getRoot(page).appendChild(added);
    getRoot(page).setAttribute('size', 'sm');
    await page.waitForChanges();

    expect(items(page).map(item => item.last)).toEqual([false, false, false, true]);
  });

  it('ignores steps belonging to a nested trail', async () => {
    const page = await trail(`
      <ss-breadcrumb separator="›">
        <ss-breadcrumb-item>Outer</ss-breadcrumb-item>
        <ss-breadcrumb separator="/"><ss-breadcrumb-item>Inner</ss-breadcrumb-item></ss-breadcrumb>
      </ss-breadcrumb>
    `);
    const all = Array.from(page.body.querySelectorAll('ss-breadcrumb-item')) as unknown as Record<string, unknown>[];

    expect(all[0].separator).toBe('›');
    expect(all[1].separator).toBe('/');
  });
});

describe('ss-breadcrumb-item rendering', () => {
  it('links the steps that lead somewhere else', async () => {
    const page = await trail(`<ss-breadcrumb>${THREE}</ss-breadcrumb>`);
    const links = getRoot(page).querySelectorAll('ss-breadcrumb-item ss-link');

    expect(links).toHaveLength(2);
  });

  it('renders the current page as text, not a link to itself', async () => {
    const page = await trail(`<ss-breadcrumb>${THREE}</ss-breadcrumb>`);
    const last = getRoot(page).querySelectorAll('ss-breadcrumb-item')[2];

    expect(last.querySelector('ss-link')).toBeNull();
    expect(last.querySelector('[aria-current="page"]')?.textContent).toContain('Components');
  });

  it('renders text for a step that was given an href but is the current page', async () => {
    const page = await trail(`<ss-breadcrumb><ss-breadcrumb-item href="/here">Here</ss-breadcrumb-item></ss-breadcrumb>`);
    const only = getRoot(page).querySelector('ss-breadcrumb-item') as HTMLElement;

    // A single step is the page itself, so the href does not make it a link.
    expect(only.querySelector('ss-link')).toBeNull();
    expect(only.querySelector('[aria-current="page"]')).not.toBeNull();
  });

  it('draws a separator after every step but the last', async () => {
    const page = await trail(`<ss-breadcrumb separator="›">${THREE}</ss-breadcrumb>`);
    const separators = Array.from(getRoot(page).querySelectorAll('.ss-breadcrumb-item__separator'));

    expect(separators).toHaveLength(2);
    expect(separators.every(separator => separator.textContent === '›')).toBe(true);
    expect(separators.every(separator => separator.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('falls back to the label prop when no content is slotted', async () => {
    const page = await trail(`<ss-breadcrumb><ss-breadcrumb-item label="Home" href="/"></ss-breadcrumb-item><ss-breadcrumb-item label="Now"></ss-breadcrumb-item></ss-breadcrumb>`);
    expect(getRoot(page).textContent).toContain('Home');
    expect(getRoot(page).textContent).toContain('Now');
  });
});
