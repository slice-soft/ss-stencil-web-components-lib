/**
 * Joins the ids that describe a control into a single `aria-describedby` value,
 * preserving the order in which they are passed so helper text is announced
 * before error text.
 *
 * Falsy entries are dropped so callers can pass conditional ids inline, and an
 * entry may itself hold several space-separated ids — that is what a consumer's
 * own `describedBy` prop looks like when a molecule merges it with the ids it
 * generated. Repeated ids are collapsed, because a duplicated IDREF makes a
 * screen reader announce the same text twice.
 *
 * Returns `undefined` when nothing remains, so the caller omits the attribute
 * instead of rendering `aria-describedby=""`, which reads as an empty
 * description rather than as no description.
 */
export function composeDescribedBy(...ids: (string | undefined | null | false)[]): string | undefined {
  const unique = new Set<string>();

  for (const entry of ids) {
    if (typeof entry !== 'string') continue;
    for (const id of entry.split(/\s+/)) {
      if (id) unique.add(id);
    }
  }

  return unique.size ? [...unique].join(' ') : undefined;
}

/** The ARIA relationships that can be expressed as element references. */
type AriaElementRefs = 'ariaLabelledByElements' | 'ariaDescribedByElements';

/**
 * A control rendered inside a shadow root can be neither named nor described by
 * an element outside it: `aria-labelledby` and `aria-describedby` are IDREFs,
 * and an IDREF only resolves within its own tree. Setting the attribute leaves
 * the accessible name or description empty — worse than a visible failure,
 * because the markup looks correct.
 *
 * ARIA element reflection carries the reference across the boundary, so this
 * resolves the ids against the host's own root — where a wrapper such as
 * `ss-field` renders its label, helper and error text — and hands the control
 * real element references.
 *
 * Assigning element references blanks the rendered attribute, because the
 * platform then holds the reference internally rather than by id. That only
 * happens where reflection exists, so nothing is lost: a browser without it
 * never reaches the assignment and keeps reading the attribute. For the same
 * reason, ids that resolve to nothing leave the attribute untouched instead of
 * replacing a working same-tree reference with a blank one.
 *
 * Returns whether element references were applied.
 */
function applyAriaElementRefs(host: Element, control: Element | null | undefined, relationship: AriaElementRefs, ids?: string): boolean {
  if (!control || !(relationship in control)) return false;

  const root = host.getRootNode() as Document | ShadowRoot;
  const targets = (ids ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => root.getElementById?.(id))
    .filter((el): el is HTMLElement => !!el);

  const reflected = control as unknown as Record<AriaElementRefs, Element[] | null>;

  if (!targets.length) {
    // Clear only a reference this function set earlier, so a stale relationship
    // does not survive; never blank an attribute we never replaced.
    if (reflected[relationship]?.length) reflected[relationship] = null;
    return false;
  }

  reflected[relationship] = targets;
  return true;
}

/** Names the control with the elements the ids point at. See {@link applyAriaElementRefs}. */
export function applyLabelledBy(host: Element, control: Element | null | undefined, labelledBy?: string): boolean {
  return applyAriaElementRefs(host, control, 'ariaLabelledByElements', labelledBy);
}

/** Describes the control with the elements the ids point at. See {@link applyAriaElementRefs}. */
export function applyDescribedBy(host: Element, control: Element | null | undefined, describedBy?: string): boolean {
  return applyAriaElementRefs(host, control, 'ariaDescribedByElements', describedBy);
}
