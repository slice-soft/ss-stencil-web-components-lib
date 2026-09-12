/** Elements that can take focus, before the state of each one is considered. */
const FOCUSABLE = ['a[href]', 'area[href]', 'button', 'input', 'select', 'textarea', 'iframe', 'audio[controls]', 'video[controls]', '[contenteditable]', '[tabindex]'].join(',');

/**
 * Collects what the browser would move focus through inside a container, in
 * tab order.
 *
 * The walk descends into shadow roots. Without that, a dialog holding an
 * `ss-button` would look empty: the button that actually takes focus is inside
 * the atom's shadow root, and a light-DOM query never sees it.
 */
export function getTabbable(container: ParentNode): HTMLElement[] {
  const found: HTMLElement[] = [];

  const visit = (root: ParentNode) => {
    for (const element of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
      if (isTabbable(element)) found.push(element);
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  };

  visit(container);
  return found;
}

function isTabbable(element: HTMLElement): boolean {
  if (!element.matches(FOCUSABLE)) return false;
  if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true') return false;
  if (Number(element.getAttribute('tabindex')) < 0) return false;

  // An element with no box takes no focus. `offsetParent` is null for a fixed
  // element too, so its own hidden-ness is what decides there.
  const hidden = element.offsetParent === null && getComputedStyle(element).position !== 'fixed';
  return !hidden;
}

/**
 * Keeps Tab inside a container until released.
 *
 * A dialog that lets Tab walk out puts a keyboard user behind a layer they
 * cannot see, still typing into a page they cannot reach — the reason a trap
 * exists at all. Focus is moved to the first element inside, unless something
 * inside already has it.
 *
 * Returns a function that stops the trap and, unless told otherwise, gives
 * focus back to whatever held it before.
 */
export function trapFocus(container: HTMLElement, options: { restore?: boolean } = {}): () => void {
  const previous = document.activeElement as HTMLElement | null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const tabbable = getTabbable(container);
    if (!tabbable.length) {
      // Nothing to land on, so the container itself holds focus rather than
      // letting Tab escape to the page behind.
      event.preventDefault();
      container.focus();
      return;
    }

    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    const active = deepestActive();

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);

  if (!container.contains(deepestActive())) {
    const [first] = getTabbable(container);
    (first ?? container).focus();
  }

  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    if (options.restore !== false) previous?.focus?.();
  };
}

/**
 * The element that really has focus. `document.activeElement` stops at a shadow
 * host, so the search continues inside it.
 */
export function deepestActive(): HTMLElement | null {
  let active = document.activeElement as HTMLElement | null;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement;
  return active;
}
