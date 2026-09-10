import { newSpecPage } from '@stencil/core/testing';
import { SsNav } from '../ss-nav';
import { SsNavItem } from '../../ss-nav-item/ss-nav-item';
import { getRoot } from '../../../../test/utils';

const NAV = (attrs = '') => `
  <ss-nav ${attrs}>
    <ss-nav-item href="/" value="home">Home</ss-nav-item>
    <ss-nav-item href="/projects">Projects</ss-nav-item>
    <ss-nav-item href="/billing" disabled>Billing</ss-nav-item>
  </ss-nav>
`;

async function nav(html: string) {
  const page = await newSpecPage({ components: [SsNav, SsNavItem], html });
  await page.waitForChanges();
  const root = getRoot(page) as HTMLElement & { value?: string };
  const links = () => Array.from(root.querySelectorAll('a'));
  return { page, root, links };
}

describe('ss-nav rendering', () => {
  it('is a named navigation landmark holding a list', async () => {
    const { root } = await nav(NAV());
    const landmark = root.querySelector('nav')!;

    expect(landmark.getAttribute('aria-label')).toBe('Main');
    expect(landmark.querySelector('ul')?.getAttribute('role')).toBe('list');
    expect(Array.from(root.querySelectorAll('ss-nav-item')).map(item => item.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem']);
  });

  it('takes a stated name, so two navigations stay distinct', async () => {
    const { root } = await nav(NAV('accessibility-label="Account"'));
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Account');
  });

  it('renders real links', async () => {
    const { links } = await nav(NAV());
    expect(links().map(link => link.getAttribute('href'))).toEqual(['/', '/projects', null]);
  });

  it('turns a disabled item into a disabled link nobody can follow', async () => {
    const { links } = await nav(NAV());
    const disabled = links()[2];

    expect(disabled.hasAttribute('href')).toBe(false);
    expect(disabled.getAttribute('role')).toBe('link');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('ss-nav current page', () => {
  it('marks the item matching its value, and only that one', async () => {
    const { links } = await nav(NAV('value="home"'));
    expect(links().map(link => link.getAttribute('aria-current'))).toEqual(['page', null, null]);
  });

  it('matches an item with no value by its href', async () => {
    const { links } = await nav(NAV('value="/projects"'));
    expect(links().map(link => link.getAttribute('aria-current'))).toEqual([null, 'page', null]);
  });

  it('marks nothing when no value is given', async () => {
    const { links } = await nav(NAV());
    expect(links().every(link => !link.hasAttribute('aria-current'))).toBe(true);
  });
});

describe('ss-nav following an item', () => {
  function click(link: Element, init: MouseEventInit = {}) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    link.dispatchEvent(event);
    return event;
  }

  it('moves the current page and reports the item', async () => {
    const { page, root, links } = await nav(NAV('value="home"'));
    const changes: unknown[] = [];
    root.addEventListener('ssChange', event => changes.push((event as CustomEvent).detail));

    const event = click(links()[1]);
    await page.waitForChanges();

    expect(changes).toEqual([{ xId: undefined, value: '/projects', href: '/projects' }]);
    expect(root.value).toBe('/projects');
    expect(links().map(link => link.getAttribute('aria-current'))).toEqual([null, 'page', null]);
    // Nobody asked to route on the client, so the browser follows the link.
    expect(event.defaultPrevented).toBe(false);
  });

  it('lets the browser skip the link when ssChange is cancelled', async () => {
    const { page, root, links } = await nav(NAV());
    root.addEventListener('ssChange', event => event.preventDefault());

    const event = click(links()[1]);
    await page.waitForChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(root.value).toBe('/projects');
  });

  it('leaves a modified click to the browser', async () => {
    const { page, root, links } = await nav(NAV('value="home"'));
    const changes: unknown[] = [];
    root.addEventListener('ssChange', event => changes.push(event));

    click(links()[1], { ctrlKey: true });
    click(links()[1], { metaKey: true });
    await page.waitForChanges();

    expect(changes).toEqual([]);
    expect(root.value).toBe('home');
  });

  it('ignores a disabled item', async () => {
    const { page, root, links } = await nav(NAV('value="home"'));
    const changes: unknown[] = [];
    root.addEventListener('ssChange', event => changes.push(event));

    click(links()[2]);
    await page.waitForChanges();

    expect(changes).toEqual([]);
    expect(root.value).toBe('home');
  });
});

describe('ss-nav orientation', () => {
  it('tells its items which way they run', async () => {
    const { root } = await nav(NAV('orientation="vertical"'));

    expect(root.querySelector('nav')?.className).toContain('ss-nav--vertical');
    expect(root.querySelector('a')?.className).toContain('ss-nav-item--vertical');
  });
});
