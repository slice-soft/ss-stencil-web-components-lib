import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { brandOverrides, designSystemCss, DESIGN_SYSTEM_VERSION, TEST_BRANDS } from './tokens';

const declared = (css: string) => [...css.matchAll(/(--ss-[\w-]+)\s*:/g)].map(m => m[1]);
// Brand-level: semantic colors, brand and division. --ss-color-keywords-* is a
// core primitive (currentColor), not a brand value.
const BRAND_LEVEL = /^--ss-(color-(?!keywords-)|brand-|division-)/;

function componentTags(dir = join(process.cwd(), 'src/components')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (!entry.isDirectory()) return [];
    if (entry.name.startsWith('ss-')) return [entry.name.slice(3)];
    return componentTags(join(dir, entry.name));
  });
}

const ownFile = (brand: string, file: string) => readFileSync(join(process.cwd(), 'test/brands', brand, file), 'utf8');

describe('test brands', () => {
  it('are a generic base and two variations, none of them a real brand', () => {
    expect([...TEST_BRANDS]).toEqual(['test-base', 'neon-purple', 'organic-emerald']);
  });

  it('test-base replaces every brand-level value of the design system, so none of a real brand reaches a test', async () => {
    for (const file of ['_variables.css', '_dark.css'] as const) {
      const fromDesignSystem = declared(await designSystemCss(file)).filter(name => BRAND_LEVEL.test(name));
      const base = new Set(declared(ownFile('test-base', file)));
      expect(fromDesignSystem.filter(name => !base.has(name))).toEqual([]);
    }
  });

  for (const brand of TEST_BRANDS) {
    it(`${brand} only overrides variables the pinned design system declares`, async () => {
      const known = new Set([...declared(await designSystemCss('_variables.css')), ...declared(await designSystemCss('_dark.css'))]);
      for (const file of ['_variables.css', '_dark.css'] as const) {
        const names = declared(ownFile(brand, file));
        expect(names.length).toBeGreaterThan(0);
        expect(names.filter(name => !known.has(name))).toEqual([]);
      }
    });

    it(`${brand} overrides brand-level layers only`, () => {
      const components = componentTags().map(tag => `--ss-${tag}-`);
      for (const file of ['_variables.css', '_dark.css'] as const) {
        const names = declared(ownFile(brand, file));
        expect(names.filter(name => components.some(prefix => name.startsWith(prefix)))).toEqual([]);
        expect(names.filter(name => !/^--ss-(color|brand|division|shape|control)-/.test(name))).toEqual([]);
      }
    });
  }

  it('a variation loads on top of test-base, never on the design system alone', () => {
    const css = brandOverrides('neon-purple', '_variables.css');
    expect(css.indexOf(ownFile('test-base', '_variables.css'))).toBe(0);
    expect(css).toContain(ownFile('neon-purple', '_variables.css'));
  });

  it('the bare index pins the same design system version', () => {
    const html = readFileSync(join(process.cwd(), 'src/index.html'), 'utf8');
    expect(html).toContain(`ss-design-system-v${DESIGN_SYSTEM_VERSION}/css/`);
    expect([...html.matchAll(/ss-design-system-v([\d.]+)\//g)].map(m => m[1]).filter(v => v !== DESIGN_SYSTEM_VERSION)).toEqual([]);
  });
});
