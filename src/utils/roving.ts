export type Orientation = 'horizontal' | 'vertical';

export interface RovingOptions {
  /** The axis the items run along. Arrows across it are left alone. */
  orientation?: Orientation;
  /** Positions focus should skip over. */
  disabled?: (index: number) => boolean;
}

/**
 * Where a key press moves focus within a row or column of items, or `null` when
 * the key is not one the pattern handles.
 *
 * Menus, tab lists and accordions all move the same way: an arrow along the axis
 * steps by one and wraps at the ends, Home and End jump to the ends, and a
 * disabled item is stepped over. Arrows across the axis return `null` so the
 * caller does not swallow them — a vertical menu has no business eating Left
 * and Right, which a submenu or the page may want.
 *
 * `current` may be -1 when nothing in the set has focus yet; the next arrow then
 * lands on the first item. When every item is disabled there is nowhere to go,
 * and the result is `null` as well.
 */
export function rovingIndex(key: string, current: number, count: number, options: RovingOptions = {}): number | null {
  const { orientation = 'vertical', disabled = () => false } = options;
  if (count <= 0) return null;

  const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  let start: number;
  let step: number;
  switch (key) {
    case forward:
      start = current;
      step = 1;
      break;
    case backward:
      start = current < 0 ? count : current;
      step = -1;
      break;
    case 'Home':
      start = -1;
      step = 1;
      break;
    case 'End':
      start = count;
      step = -1;
      break;
    default:
      return null;
  }

  for (let moved = 1; moved <= count; moved++) {
    const index = (((start + step * moved) % count) + count) % count;
    if (!disabled(index)) return index;
  }

  return null;
}

/**
 * The next item whose label starts with a typed character, searching forward
 * from the one after `current` and wrapping — so pressing the same letter again
 * walks through every item that starts with it, which is how native menus and
 * select lists behave.
 *
 * Returns `null` when the key is not a single printable character or nothing
 * matches.
 */
export function typeaheadIndex(key: string, current: number, labels: string[], disabled: (index: number) => boolean = () => false): number | null {
  if (key.length !== 1 || !key.trim()) return null;

  const char = key.toLocaleLowerCase();
  const count = labels.length;

  for (let moved = 1; moved <= count; moved++) {
    const index = (((current + moved) % count) + count) % count;
    if (!disabled(index) && labels[index].trim().toLocaleLowerCase().startsWith(char)) return index;
  }

  return null;
}
