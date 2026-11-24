/** One choice in a list the person picks from. */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

/** Lower case, without accents or other combining marks: "Perú" → "peru". */
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Whether a label contains the query, ignoring case and accents. A blank query matches every label. */
export function matches(label: string, query: string): boolean {
  const needle = fold(query.trim());
  return !needle || fold(label).includes(needle);
}

/**
 * The options written as `ss-option` children of the host — direct children
 * only, so a nested list belongs to its own owner. The label is the trimmed
 * text; the value falls back to it.
 */
export function readOptions(host: HTMLElement): SelectOption[] {
  return Array.from(host.children)
    .filter(child => child.tagName === 'SS-OPTION')
    .map(option => {
      const label = (option.textContent ?? '').trim();
      return {
        value: option.getAttribute('value') ?? label,
        label,
        disabled: option.hasAttribute('disabled'),
        selected: option.hasAttribute('selected'),
      };
    });
}
