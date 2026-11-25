/**
 * How many columns of at least `minItem` fit in `width`, with `gap` between
 * them, capped at `max`. Never fewer than one: at its narrowest a grid is a
 * single column. A `max` that is not a positive number means one column.
 */
export function fitColumns(width: number, minItem: number, gap: number, max: number): number {
  const cap = Number.isFinite(max) && max >= 1 ? Math.floor(max) : 1;
  const fit = Math.floor((width + gap) / (minItem + gap));
  if (!Number.isFinite(fit)) return cap;
  return Math.min(Math.max(fit, 1), cap);
}
