import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * The design tokens the library is tested with: ss-design-system's slicesoft
 * stylesheets, committed in test/tokens/slicesoft/ so tests and CI never touch
 * the network. `npm run tokens:sync` refreshes them, from the CDN release
 * pinned in test/tokens.config.json or, ahead of a release, from a local
 * design-system build (`-- --from <dist/css>`).
 */
export type TokenFile = '_variables.css' | '_dark.css';

const config = JSON.parse(readFileSync(join(process.cwd(), 'test/tokens.config.json'), 'utf8')) as { designSystem: string };

/** The design-system release consumers need, and the one the copy comes from. */
export const DESIGN_SYSTEM_VERSION: string = config.designSystem;

export function cdnUrl(file: TokenFile, version = DESIGN_SYSTEM_VERSION): string {
  return `https://cdn.slicesoft.dev/design-system/ss-design-system-v${version}/css/${file}`;
}

export async function slicesoftCss(file: TokenFile): Promise<string> {
  return readFileSync(join(process.cwd(), 'test/tokens/slicesoft', file), 'utf8');
}

/**
 * Brands the library is tested with. slicesoft is the real one; the others are
 * test brands, not clients: small override files in test/brands/<brand>/, named
 * like the CDN files and loaded on top of slicesoft. Whatever a test brand does
 * not declare falls back to slicesoft, so no variable is ever undefined.
 */
export const TEST_BRANDS = ['slicesoft', 'neon-purple', 'organic-emerald'] as const;
export type TestBrand = (typeof TEST_BRANDS)[number];

export function brandOverrides(brand: TestBrand, file: TokenFile): string {
  if (brand === 'slicesoft') return '';
  return readFileSync(join(process.cwd(), 'test/brands', brand, file), 'utf8');
}
