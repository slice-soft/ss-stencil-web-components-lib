/**
 * A valid range from whatever the attributes held. A `max` that is not a
 * positive number would make every value meaningless, so it falls back to 100;
 * a value that is not a number means "not known" — indeterminate — and any
 * other value is held inside the track.
 */
export function normalize(value: unknown, max: unknown): { max: number; value?: number } {
  const m = typeof max === 'number' ? max : typeof max === 'string' && max.trim() !== '' ? Number(max) : NaN;
  const safeMax = Number.isFinite(m) && m > 0 ? m : 100;
  const v = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(v)) return { max: safeMax, value: undefined };
  return { max: safeMax, value: Math.min(Math.max(v, 0), safeMax) };
}
