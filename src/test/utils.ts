import type { SpecPage } from '@stencil/core/testing';

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
