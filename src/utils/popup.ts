import type { PopupKind } from '../types/popup';

/**
 * The element a caller put in a named slot of this host, ignoring any nested
 * instance of the same component — a dropdown inside a popover has a trigger of
 * its own, and the outer one must not claim it.
 *
 * The lookup searches the whole subtree because a scoped component relocates
 * slotted content into what it rendered, so after the first render the element
 * is no longer a direct child.
 */
export function slottedIn(host: HTMLElement, name: string): HTMLElement | null {
  const candidates = Array.from(host.querySelectorAll<HTMLElement>(`[slot="${name}"]`));
  return candidates.find(element => element.parentElement?.closest(host.localName) === host) ?? null;
}

/**
 * Tells a trigger what it opens and whether it is open.
 *
 * Both have to land on the element that takes focus, which is what a screen
 * reader announces. For an `ss-button` that element is inside its shadow root,
 * where an attribute on the host would reach nothing, so the state goes in
 * through props. Anything else is taken to be the focusable element itself.
 */
export function markTrigger(trigger: HTMLElement | null, popup: PopupKind, expanded: boolean) {
  if (!trigger) return;

  if (trigger.localName === 'ss-button') {
    const props = trigger as unknown as Record<string, unknown>;
    props.popup = popup;
    props.expanded = expanded;
    return;
  }

  trigger.setAttribute('aria-haspopup', popup);
  trigger.setAttribute('aria-expanded', String(expanded));
}
