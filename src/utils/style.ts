export function parseStyleString(xstyles: string): Record<string,string> {
  return xstyles
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce((acc, style) => {
      const [rawKey, rawVal] = style.split(':');
      if (!rawKey || !rawVal) return acc;
      const key = rawKey.trim();
      const val = rawVal.trim();
      acc[key] = val;
      return acc;
    }, {} as Record<string,string>);
}