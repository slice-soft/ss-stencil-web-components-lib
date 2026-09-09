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
