/**
 * @security Generated ids are rendered into IDREF attributes (`for`,
 * `aria-describedby`, `aria-labelledby`). Only pass trusted/static prefixes.
 */

/**
 * One counter per prefix. Keeping the sequences separate makes generated ids
 * readable in devtools and in test failures (`ss-field-0`, `ss-field-1`) while
 * still being unique: two components sharing a prefix never share a number.
 *
 * Ids are generated at runtime and are not stable between a server render and a
 * client hydration. Do not persist them, and do not assert exact numbers.
 */
const counters = new Map<string, number>();

/** Returns the next unique id for a prefix, such as `ss-field-0`. */
export function nextId(prefix: string): string {
  const next = counters.get(prefix) ?? 0;
  counters.set(prefix, next + 1);
  return `${prefix}-${next}`;
}

/**
 * Returns the consumer's id when one was supplied, and a generated id otherwise.
 * An explicit id never consumes a sequence number, so generated ids do not shift
 * depending on how many siblings happened to be configured by hand.
 */
export function resolveId(explicit: string | undefined, prefix: string): string {
  const trimmed = explicit?.trim();
  return trimmed ? trimmed : nextId(prefix);
}
