/**
 * WCAG 2.x contrast ratio between two opaque colors, as getComputedStyle
 * reports them (`rgb(r, g, b)`) or as hex. Same formula as
 * ss-design-system/build/contrast.mjs.
 */
function channels(color: string): [number, number, number] {
  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*1)?\)$/.exec(color);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16)) as [number, number, number];
  throw new Error(`Cannot measure "${color}": use an opaque rgb() or #rrggbb`);
}

function luminance(color: string): number {
  const [r, g, b] = channels(color).map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
