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
  let node: AxNode = { name: null, description: null };

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

    const found = flat.find(candidate => candidate.role === role);
    if (found) {
      node = { name: found.name ?? null, description: found.description ?? null };
      if (settled(node)) return node;
    }
  }

  return node;
}

export interface AxNode {
  name: string | null;
  description: string | null;
}

/** The slice of a Puppeteer accessibility snapshot this helper reads. */
interface AxSnapshotNode {
  role?: string;
  name?: string;
  description?: string;
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
 * This buys headroom; it does not settle the matter. Roughly one full run in
 * four still loses a browser to a slow start, in a different file each time.
 * Capping workers, passing Chrome's constrained-environment flags and retrying
 * the load were all measured and none of them moved the rate outside the noise,
 * so none of them are here. Each e2e file is reliable on its own, which is the
 * workaround while it is being chased on CI, where the environment differs.
 */
export async function newTestPage(...args: Parameters<typeof newE2EPage>): Promise<E2EPage> {
  const page = await newE2EPage(...args);
  const setContent = page.setContent.bind(page);

  page.setContent = (html: string, options?: Parameters<E2EPage['setContent']>[1]) => setContent(html, { timeout: APP_LOAD_TIMEOUT, ...options });

  return page;
}

const APP_LOAD_TIMEOUT = 40_000;
