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
