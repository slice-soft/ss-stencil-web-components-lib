import { readFileSync } from 'fs';
import { join } from 'path';
import { newE2EPage } from '@stencil/core/testing';
import type { E2EPage, SpecPage } from '@stencil/core/testing';

export function getRoot(page: SpecPage): HTMLElement {
  expect(page.root).toBeDefined();
  return page.root!;
}

export function getElement<T extends Element>(root: Element | ShadowRoot, selector: string): T {
  const element = root.querySelector<T>(selector);
  expect(element).not.toBeNull();
  return element!;
}

export function getShadowRoot(element: Element): ShadowRoot {
  expect(element.shadowRoot).not.toBeNull();
  return element.shadowRoot!;
}

/**
 * Reads a node from the browser's accessibility tree by role.
 *
 * `waitForChanges()` drains Stencil's render queue, but the accessibility tree
 * is recomputed by the browser on its own schedule, so a snapshot taken right
 * after a render can still describe the previous state — rarely on an idle
 * machine, and often enough to flake when the suite saturates the CPU. This
 * re-reads the tree until the node settles.
 *
 * The pause runs here rather than in the page: `requestAnimationFrame` does not
 * fire dependably in the headless shell this project tests against, so waiting
 * on a frame inside the browser hangs instead of yielding.
 *
 * `settled` decides what "ready" means for the assertion at hand; it defaults
 * to the node simply having an accessible name.
 */
export async function axNodeByRole(page: E2EPage, role: string, settled: (node: AxNode) => boolean = node => !!node.name): Promise<AxNode> {
  return (await findAxNode(page, candidate => candidate.role === role, settled)) ?? { name: null, description: null };
}

/**
 * The node with a given role and accessible name, for a page holding several
 * of the same role — a trigger among other buttons, one tab of many.
 * {@link axNodeByRole} takes the first node of the role, which on such a page
 * is whichever happens to come first. Returns `null` when no node matches.
 */
export async function axNodeNamed(page: E2EPage, role: string, name: string, settled: (node: AxNode) => boolean = () => true): Promise<AxNode | null> {
  return findAxNode(page, candidate => candidate.role === role && candidate.name === name, settled);
}

/** Re-reads the accessibility tree until a matching node settles. See {@link axNodeByRole}. */
async function findAxNode(page: E2EPage, match: (candidate: AxSnapshotNode) => boolean, settled: (node: AxNode) => boolean): Promise<AxNode | null> {
  let node: AxNode | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    await page.waitForChanges();
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, 25));

    const snapshot = await (page as unknown as AccessibilityPage).accessibility.snapshot({ interestingOnly: false });
    const flat: AxSnapshotNode[] = [];
    const walk = (candidate: AxSnapshotNode) => {
      flat.push(candidate);
      (candidate.children ?? []).forEach(walk);
    };
    if (snapshot) walk(snapshot);

    const found = flat.find(match);
    if (found) {
      node = { name: found.name ?? null, description: found.description ?? null, expanded: found.expanded, haspopup: found.haspopup, selected: found.selected };
      if (settled(node)) return node;
    }
  }

  return node;
}

export interface AxNode {
  name: string | null;
  description: string | null;
  /** Present only on nodes that expand something: a disclosure, a menu button. */
  expanded?: boolean;
  /** What a trigger announces it opens. */
  haspopup?: string;
  /** Present on selectable nodes, such as tabs. */
  selected?: boolean;
}

/** The slice of a Puppeteer accessibility snapshot this helper reads. */
interface AxSnapshotNode {
  role?: string;
  name?: string;
  description?: string;
  expanded?: boolean;
  haspopup?: string;
  selected?: boolean;
  children?: AxSnapshotNode[];
}

/** Puppeteer's accessibility API, which Stencil's E2EPage type does not expose. */
interface AccessibilityPage {
  accessibility: { snapshot(options?: { interestingOnly?: boolean }): Promise<AxSnapshotNode | null> };
}

/**
 * An e2e page whose `setContent` waits longer for the app to load.
 *
 * Stencil hard-codes a 30 second app-load timeout. That is generous for one
 * page and tight for a suite that starts a browser per worker: when several
 * launch at once, a browser can still be getting to the first paint when the
 * clock runs out, and the run fails with "App did not load" on `setContent`
 * rather than on anything the component did. The work still completes — the
 * same file passes on its own — so the timeout is the wrong length, not the
 * verdict. Raising it lets a loaded machine finish instead of giving up, and a
 * genuinely broken page still fails, just later.
 *
 * The ceiling is jest's own per-test timeout, which Stencil derives from an
 * environment variable it overwrites itself, so it cannot be configured: 30s
 * for e2e, times 1.5, is 45s. Waiting longer only trades a clear "App did not
 * load" for jest's generic timeout, so this stays under it.
 *
 * This is the smaller half of the fix. The larger half is `--max-workers` in
 * the test script: one browser per core leaves each too little to start in
 * time. Neither alone is enough — capping workers still flaked about one run in
 * three on the default wait, and this headroom alone left three failures a run
 * — and together they are clean.
 */
export async function newTestPage(...args: Parameters<typeof newE2EPage>): Promise<E2EPage> {
  const page = await newE2EPage(...args);
  const setContent = page.setContent.bind(page);

  page.setContent = (html: string, options?: Parameters<E2EPage['setContent']>[1]) => setContent(html, { timeout: APP_LOAD_TIMEOUT, ...options });

  return page;
}

const APP_LOAD_TIMEOUT = 40_000;

/**
 * Loads the dev design tokens into an e2e page.
 *
 * Every length in the component stylesheets is a `--ss-*` variable, and an e2e
 * page loads the components but not the tokens, so without this each one
 * resolves to nothing and `inset`, `max-width` and `padding` fall back to their
 * initial values. A layout assertion made that way tests a page nobody will
 * ever see, and misses bugs that only exist with real values — the modal's
 * centring transform was itself invalid without tokens, so the harm it did to
 * fixed descendants could not show up.
 */
export async function useTokens(page: E2EPage): Promise<void> {
  const tokens = readFileSync(join(process.cwd(), 'test/token-set-01/tokens.css'), 'utf8');
  await page.addStyleTag({ content: `${tokens}\n${NO_TRANSITIONS}` });
  await page.waitForChanges();
}

/**
 * Loading tokens into a page that has already rendered changes every length at
 * once, and a component with a transition on padding animates to its new value
 * — so the first measurement catches a control mid-animation: `ss-button` was
 * measured at 35px on its way to 42. Zeroing the durations makes every change
 * immediate. It is done through the tokens because custom properties inherit
 * into shadow roots, where a `transition: none` rule in the document would
 * never reach.
 */
const NO_TRANSITIONS =
  ':root { --ss-transitions-durations-instant: 0s; --ss-transitions-durations-short: 0s; --ss-transitions-durations-medium: 0s; --ss-transitions-durations-long: 0s; }';
