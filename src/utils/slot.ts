/**
 * Whether a slot currently has content assigned to it.
 *
 * Inside a shadow root, CSS cannot answer this: `:empty` and `:has(> *)` both
 * look at the slot's own children, which are its fallback content, never the
 * nodes assigned from the light DOM. A region that should collapse when unused
 * therefore has to be told, and `slotchange` is what tells it — including when
 * the caller fills or empties the slot later, which a one-off DOM query on
 * render would miss.
 *
 * Whitespace-only text does not count: markup indentation should not keep an
 * empty region open.
 */
export function slotHasContent(event: Event): boolean {
  const slot = event.target as HTMLSlotElement;
  if (typeof slot?.assignedNodes !== 'function') return false;

  return slot.assignedNodes({ flatten: true }).some(node => node.nodeType === 1 || !!node.textContent?.trim());
}
