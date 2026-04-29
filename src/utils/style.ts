export function parseStyleString(xstyles: string): Record<string, string> {
  return xstyles
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce(
      (acc, style) => {
        const idx = style.indexOf(':');
        if (idx < 1) return acc;
        const key = style.slice(0, idx).trim();
        const val = style.slice(idx + 1).trim();
        if (!key || !val) return acc;
        acc[key] = val;
        return acc;
      },
      {} as Record<string, string>,
    );
}

export function resolveInlineStyles(value?: string | Record<string, string>): Record<string, string> {
  if (!value) return {};
  if (typeof value === 'string') return parseStyleString(value);
  return value;
}
