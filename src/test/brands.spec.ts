import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { brandOverrides, DESIGN_SYSTEM_VERSION, slicesoftCss, TEST_BRANDS } from './tokens';

const declared = (css: string) => [...css.matchAll(/(--ss-[\w-]+)\s*:/g)].map(m => m[1]);

function componentTags(dir = join(process.cwd(), 'src/components')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (!entry.isDirectory()) return [];
    if (entry.name.startsWith('ss-')) return [entry.name.slice(3)];
    return componentTags(join(dir, entry.name));
  });
}

describe('test brands', () => {
  it('include slicesoft and two test brands', () => {
    expect([...TEST_BRANDS]).toEqual(['slicesoft', 'neon-purple', 'organic-emerald']);
  });

  for (const brand of TEST_BRANDS.filter(b => b !== 'slicesoft')) {
    it(`${brand} only overrides variables the pinned design system declares`, async () => {
      const known = new Set([...declared(await slicesoftCss('_variables.css')), ...declared(await slicesoftCss('_dark.css'))]);
      for (const file of ['_variables.css', '_dark.css'] as const) {
        const names = declared(brandOverrides(brand, file));
        expect(names.length).toBeGreaterThan(0);
        expect(names.filter(name => !known.has(name))).toEqual([]);
      }
    });

    it(`${brand} overrides brand-level layers only`, () => {
      const components = componentTags().map(tag => `--ss-${tag}-`);
      for (const file of ['_variables.css', '_dark.css'] as const) {
        const names = declared(brandOverrides(brand, file));
        expect(names.filter(name => components.some(prefix => name.startsWith(prefix)))).toEqual([]);
        expect(names.filter(name => !/^--ss-(color|brand|division|shape|control)-/.test(name))).toEqual([]);
      }
    });
  }

  it('slicesoft has no overrides', () => {
    expect(brandOverrides('slicesoft', '_variables.css')).toBe('');
  });

  it('the playground pins the same design system version', () => {
    const html = readFileSync(join(process.cwd(), 'src/index.html'), 'utf8');
    expect(html).toContain(`ss-design-system-v${DESIGN_SYSTEM_VERSION}/css/`);
    expect([...html.matchAll(/ss-design-system-v([\d.]+)\//g)].map(m => m[1]).filter(v => v !== DESIGN_SYSTEM_VERSION)).toEqual([]);
  });
});
