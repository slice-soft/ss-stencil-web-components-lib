import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * The design tokens the library is tested with. Two layers, neither of them a
 * real brand's values:
 *
 * - test/tokens/design-system/: ss-design-system's stylesheets, committed, for
 *   the structure (every variable, the system roles, the component tokens).
 *   `npm run tokens:sync` refreshes them from the CDN release pinned in
 *   test/tokens.config.json or, ahead of a release, from a local build
 *   (`-- --from <dist/css>`). Tests and CI never touch the network.
 * - test/brands/test-base/: a generic test brand that replaces every
 *   brand-level value (color, brand, division), so no value of the design
 *   system's own brand reaches a test. brands.spec.ts enforces it.
 *
 * The other test brands are variations loaded on top of test-base.
 */
export type TokenFile = '_variables.css' | '_dark.css';

const config = JSON.parse(readFileSync(join(process.cwd(), 'test/tokens.config.json'), 'utf8')) as { designSystem: string };

/** The design-system release consumers need, and the one the copy comes from. */
export const DESIGN_SYSTEM_VERSION: string = config.designSystem;

export function cdnUrl(file: TokenFile, version = DESIGN_SYSTEM_VERSION): string {
  return `https://cdn.slicesoft.dev/design-system/ss-design-system-v${version}/css/${file}`;
}

export async function designSystemCss(file: TokenFile): Promise<string> {
  return readFileSync(join(process.cwd(), 'test/tokens/design-system', file), 'utf8');
}

export const TEST_BRANDS = ['test-base', 'neon-purple', 'organic-emerald'] as const;
export type TestBrand = (typeof TEST_BRANDS)[number];

const brandFile = (brand: TestBrand, file: TokenFile) => readFileSync(join(process.cwd(), 'test/brands', brand, file), 'utf8');

/** test-base's overrides, then the variation's own when `brand` is one. */
export function brandOverrides(brand: TestBrand, file: TokenFile): string {
  const base = brandFile('test-base', file);
  return brand === 'test-base' ? base : `${base}\n${brandFile(brand, file)}`;
}
